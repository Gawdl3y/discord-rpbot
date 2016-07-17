#!/usr/bin/env node
'use babel';
'use strict';

import Discord from 'discord.js';
import config from './config';
import logger from './logger';

// Commands
import HelpCommand from './commands/help';
import TestCommand from './commands/test';
import DiceRollCommand from './commands/dice-roll';
import MaxDiceRollCommand from './commands/max-roll';
import MinDiceRollCommand from './commands/min-roll';
export const commands = [
	HelpCommand,
	TestCommand,
	DiceRollCommand,
	MaxDiceRollCommand,
	MinDiceRollCommand
];

logger.info('RPBot is starting...');

// Verify that the credentials are usable
if(!config.token && (!config.email || !config.password)) {
	logger.error('Both "email" and "password" must be specified if not using a token.');
	process.exit(1);
}

// Create client
export const client = new Discord.Client({ autoReconnect: config.autoReconnect });
client.on('ready', () => {
	logger.info('Bot is ready; logged in as ' + client.user.username + '#' + client.user.discriminator + ' (ID ' + client.user.id + ')');
});
client.on('error', e => {
	logger.error(e);
});
client.on('warn', e => {
	logger.warn(e);
});
client.on('disconnected', () => {
	logger.error('Disconnected!');
});

// Set up commands
client.on('message', message => {
	if(message.author !== client.user) {
		commandLoop: for(const command of commands) {
			for(const match of command.triggers()) {
				const matches = match.exec(message.content);
				if(matches) {
					logger.info('Running ' + command.name, { message: message.toString(), matches: matches.toString() });
					command.run(message, matches);
					break commandLoop;
				}
			}
		}
	}
});

// Log in
if(config.token) client.loginWithToken(config.token, config.email, config.password); else client.login(config.email, config.password);
