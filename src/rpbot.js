#!/usr/bin/env node
'use babel';
'use strict';

import Discord from 'discord.js';
import stringArgv from 'string-argv';
import config from './config';
import version from './version';
import commands from './commands';
import logger from './util/logger';
import checkForUpdate from './util/update-check';
import * as usage from './util/command-usage';
import * as analytics from './util/analytics';

logger.info('RPBot v' + version + ' is starting...');
analytics.sendEvent('Bot', 'started');

// Output safe config
const debugConfig = Object.assign({}, config);
if(debugConfig.email) debugConfig.email = '--snip--';
if(debugConfig.e) debugConfig.e = '--snip--';
if(debugConfig.password) debugConfig.password = '--snip--';
if(debugConfig.p) debugConfig.p = '--snip--';
if(debugConfig.token) debugConfig.token = '--snip--';
if(debugConfig.t) debugConfig.t = '--snip--';
logger.debug('Configuration:', debugConfig);

// Verify that the credentials are usable
if(!config.token && (!config.email || !config.password)) {
	logger.error('Invalid credentials; either "token" or both "email" and "password" must be specified.');
	process.exit(1);
}

// Create client
const clientOptions = { autoReconnect: config.autoReconnect, forceFetchUsers: true, disableEveryone: true };
export const client = new Discord.Client(clientOptions);
logger.info('Client created.', clientOptions);
client.on('error', e => { logger.error(e); });
client.on('warn', e => { logger.warn(e); });
client.on('debug', e => { logger.debug(e); });
client.on('disconnected', () => { logger.error('Disconnected.'); });
client.on('ready', () => {
	logger.info(`Bot is ready; logged in as ${client.user.username}#${client.user.discriminator} (ID: ${client.user.id})`);
	defaultCommandPattern = new RegExp(`^(!|<@!?${client.user.id}>\\s+!?)([^\\s]+)`);
	checkForUpdate();
	if(config.updateCheck > 0) setInterval(checkForUpdate, config.updateCheck * 60 * 1000);
});

// Set up command recognition
let defaultCommandPattern;
client.on('message', message => {
	if(message.author === client.user) return;
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
	let defaultMatches;
	if(!runCommand) {
		defaultMatches = defaultCommandPattern.exec(message.content);
		if(defaultMatches) {
			const commandName = defaultMatches[2].toLowerCase();
			const command = commands.find(command => command.name === commandName || (command.aliases && command.aliases.some(alias => alias === commandName)));
			if(command && !command.disableDefault) {
				const argString = message.content.substring(defaultMatches[1].length + defaultMatches[2].length);
				runCommand = command;
				runArgs = !command.singleArgument ? stringArgv(argString) : [argString.trim()];
			}
		}
	}

	// Run the command
	if(runCommand) {
		const logInfo = {
			args: runArgs.toString(),
			user: message.author.username + '#' + message.author.discriminator,
			userID: message.author.id,
			server: message.server ? message.server.name : null,
			serverID: message.server ? message.server.id : null
		};

		if(runCommand.isRunnable(message)) {
			logger.info(`Running ${runCommand.group}:${runCommand.groupName}.`, logInfo);
			analytics.sendEvent('Command', 'run', runCommand.group + ':' + runCommand.groupName);
			const result = runCommand.run(message, runArgs, runFromPattern);
			if(typeof result !== 'undefined' && !result) client.reply(message, `Invalid command format. Use \`!help ${runCommand.name}\` for information.`);
		} else {
			logger.info(`Not running ${runCommand.group}:${runCommand.groupName}; not runnable.`, logInfo);
		}
	} else if(defaultMatches) {
		if(!config.unknownOnlyMention || defaultMatches[1].startsWith('<@')) client.reply(message, `Unknown command. Use ${usage.long('help')} to view the list of all commands.`);
	}
});

// Log in
const loginCallback = e => { if(e) logger.error('Failed to login.', e); };
if(config.token) {
	logger.info('Logging in with token...');
	client.loginWithToken(config.token, config.email, config.password, loginCallback);
} else {
	logger.info('Logging in with email and password...');
	client.login(config.email, config.password, loginCallback);
}

// Exit on interrupt
process.on('SIGINT', () => {
	logger.info('Received interrupt signal; destroying client and exiting...');
	client.destroy(() => { process.exit(0); });
});
