#!/usr/bin/env node
'use babel';
'use strict';

import config from './config';
import Discord from 'discord.js';
import stringArgv from 'string-argv';
import { stripIndents } from 'common-tags';
import version from './version';
import commands from './commands';
import { init as initDatabase, close as closeDatabase } from './database';
import logger from './util/logger';
import buildCommandPattern from './util/command-pattern';
import checkForUpdate from './util/update-check';
import usage from './util/command-usage';
import * as analytics from './util/analytics';
import FriendlyError from './util/errors/friendly';

logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Output safe config
const debugConfig = Object.assign({}, config);
if(debugConfig.email) debugConfig.email = '--snip--';
if(debugConfig.password) debugConfig.password = '--snip--';
if(debugConfig.token) debugConfig.token = '--snip--';
for(const key of Object.keys(debugConfig)) if(key.length === 1 || key.includes('-')) delete debugConfig[key];
logger.debug('Configuration:', debugConfig);

// Verify that the credentials are usable
if(!config.token && (!config.email || !config.password)) {
	logger.error('Invalid credentials; either "token" or both "email" and "password" must be specified.');
	process.exit(1);
}

// Set up database
initDatabase().catch(err => {
	logger.error(err);
	process.exit(1);
});

// Create client
const clientOptions = { autoReconnect: config.autoReconnect, forceFetchUsers: true, disableEveryone: true };
export const client = new Discord.Client(clientOptions);
logger.info('Client created.', clientOptions);
client.on('error', err => { logger.error(err); });
client.on('warn', err => { logger.warn(err); });
client.on('debug', err => { logger.debug(err); });
client.on('disconnected', () => { logger.error('Disconnected.'); });
client.on('ready', () => {
	logger.info(`Bot is ready; logged in as ${client.user.username}#${client.user.discriminator} (ID: ${client.user.id})`);
	checkForUpdate();
	if(config.updateCheck > 0) setInterval(checkForUpdate, config.updateCheck * 60 * 1000);
});

// Set up command recognition
export const serverCommandPatterns = {};
export const unprefixedCommandPattern = /^([^\s]+)/i;
client.on('message', message => {
	if(message.author.equals(client.user)) return;
	let runCommand;
	let runArgs;
	let runFromPattern = false;

	// Find the command to run by patterns
	commandLoop: for(const command of commands) {
		if(!command.patterns) continue;
		for(const pattern of command.patterns) {
			const matches = pattern.exec(message.content);
			if(matches) {
				runCommand = command;
				runArgs = matches;
				runFromPattern = true;
				break commandLoop;
			}
		}
	}

	// Find the command to run with default command handling
	const patternIndex = message.server ? message.server.id : '-';
	if(!serverCommandPatterns[patternIndex]) serverCommandPatterns[patternIndex] = buildCommandPattern(message.server, client.user);
	let defaultMatches;
	let unprefixedMatches;
	if(!runCommand) {
		defaultMatches = serverCommandPatterns[patternIndex].exec(message.content);
		if(defaultMatches) {
			const commandName = defaultMatches[2].toLowerCase();
			const command = commands.find(cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.some(alias => alias === commandName)));
			if(command && !command.disableDefault) {
				const argString = message.content.substring(defaultMatches[1].length + defaultMatches[2].length);
				runCommand = command;
				runArgs = !command.singleArgument ? stringArgv(argString) : [argString.trim()];
			}
		} else if(!message.server) {
			unprefixedMatches = unprefixedCommandPattern.exec(message.content);
			if(unprefixedMatches) {
				const commandName = unprefixedMatches[1].toLowerCase();
				const command = commands.find(cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.some(alias => alias === commandName)));
				if(command && !command.disableDefault) {
					const argString = message.content.substring(unprefixedMatches[1].length);
					runCommand = command;
					runArgs = !command.singleArgument ? stringArgv(argString) : [argString.trim()];
				}
			}
		}
	}

	// Run the command
	if(runCommand) {
		const logInfo = {
			args: runArgs.toString(),
			user: `${message.author.username}#${message.author.discriminator}`,
			userID: message.author.id,
			server: message.server ? message.server.name : null,
			serverID: message.server ? message.server.id : null
		};

		if(runCommand.isRunnable(message)) {
			logger.info(`Running ${runCommand.group}:${runCommand.groupName}.`, logInfo);
			analytics.sendEvent('Command', 'run', `${runCommand.group}:${runCommand.groupName}`);
			runCommand.run(message, runArgs, runFromPattern).catch(err => {
				if(err instanceof FriendlyError) {
					message.reply(err.message);
				} else {
					const owner = config.owner ? client.users.get('id', config.owner) : null;
					message.reply(stripIndents`
						An error occurred while running the command.
						\`${err.name}: ${err.message}\`
						${owner ? `Please contact ${owner.name}#${owner.discriminator}${config.invite ? ` in ${config.invite}` : ''}.` : ''}
					`);
					logger.error(err);
					analytics.sendException(err);
				}
			});
		} else {
			message.reply(`The \`${runCommand.name}\` command is not currently usable in your context.`);
			logger.info(`Not running ${runCommand.group}:${runCommand.groupName}; not runnable.`, logInfo);
		}
	} else if(defaultMatches || unprefixedMatches) {
		if(!config.unknownOnlyMention || defaultMatches[1].startsWith('<@')) message.reply(`Unknown command. Use ${usage('help', message.server)} to view the list of all commands.`);
	}
});

// Log in
const loginCallback = err => { if(err) logger.error('Failed to login.', err); };
if(config.token) {
	logger.info('Logging in with token...');
	client.loginWithToken(config.token, config.email, config.password, loginCallback);
} else {
	logger.info('Logging in with email and password...');
	client.login(config.email, config.password, loginCallback);
}

// Exit on interrupt
let interruptCount = 0;
process.on('SIGINT', async () => {
	interruptCount++;
	if(interruptCount === 1) {
		logger.info('Received interrupt signal; closing database, destroying client, and exiting...');
		await Promise.all([
			closeDatabase(),
			client.destroy()
		]).catch(err => {
			logger.error(err);
		});
		process.exit(0);
	} else {
		logger.info('Received another interrupt signal; immediately exiting.');
		process.exit(0);
	}
});
