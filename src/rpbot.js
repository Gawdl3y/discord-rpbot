#!/usr/bin/env node
'use babel';
'use strict';

import Discord from 'discord.js';
import config from './config';
import logger from './logger';
import version from './version';
import checkForUpdate from './update-check';

// Commands
import HelpCommand from './commands/help';
import AboutCommand from './commands/about';
import DiceRollCommand from './commands/dice-roll';
import MaxDiceRollCommand from './commands/max-roll';
import MinDiceRollCommand from './commands/min-roll';
import ViewCharacterCommand from './commands/view-character';
import ListCharactersCommand from './commands/list-characters';
import AddCharacterCommand from './commands/add-character';
import DeleteCharacterCommand from './commands/delete-character';
export const commands = [
	HelpCommand,
	AboutCommand,
	DiceRollCommand,
	MaxDiceRollCommand,
	MinDiceRollCommand,
	ViewCharacterCommand,
	ListCharactersCommand,
	AddCharacterCommand,
	DeleteCharacterCommand
];

logger.info('RPBot v' + version + ' is starting...');
checkForUpdate();

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
	logger.error('Both "email" and "password" must be specified if not using a token.');
	process.exit(1);
}

// Create client
const clientOptions = { autoReconnect: config.autoReconnect, forceFetchUsers: true, disableEveryone: true };
export const client = new Discord.Client(clientOptions);
logger.info('Client created.', clientOptions);
client.on('ready', () => { logger.info('Bot is ready; logged in as ' + client.user.username + '#' + client.user.discriminator + ' (ID ' + client.user.id + ')'); });
client.on('error', e => { logger.error(e); });
client.on('warn', e => { logger.warn(e); });
client.on('debug', e => { logger.debug(e); });
client.on('disconnected', () => { logger.error('Disconnected.'); });

// Set up command recognition
client.on('message', message => {
	if(message.author !== client.user) {
		commandLoop: for(const command of commands) {
			for(const trigger of command.triggers) {
				const matches = trigger.exec(message.content);
				if(matches) {
					const logInfo = {
						matches: matches.toString(),
						user: message.author.username + '#' + message.author.discriminator,
						userID: message.author.id,
						server: message.server ? message.server.toString() : null,
						serverID: message.server ? message.server.id : null
					};

					if(command.isRunnable(message)) {
						logger.info('Running ' + command.name + '.', logInfo);
						command.run(message, matches);
					} else {
						logger.info('Not running ' + command.name + '; not runnable.', logInfo);
					}

					break commandLoop;
				}
			}
		}
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
