#!/usr/bin/env node
'use babel';
'use strict';

import Discord from 'discord.js';
import yargs from 'yargs';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

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

// Set up config
export const config = yargs.usage('$0 [args]')
	.option('token', {
		type: 'string',
		alias: 't',
		describe: 'API token for the bot account'
	})
	.option('email', {
		type: 'string',
		alias: 'e',
		describe: 'Email of the Discord account for the bot to use'
	})
	.option('password', {
		type: 'string',
		alias: 'p',
		describe: 'Password of the Discord account for the bot to use'
	})
	.option('auto-reconnect', {
		type: 'boolean',
		describe: 'Whether or not the bot should automatically reconnect when disconnected'
	})
	.config('config', (configFile) => {
		const extension = path.extname(configFile).toLowerCase();
		if(extension === '.json')
			return JSON.parse(fs.readFileSync(configFile));
		else if(extension === '.yml' || extension == '.yaml')
			return YAML.safeLoad(fs.readFileSync(configFile));
		throw new Error('Unknown config file type');
	})
	.alias('config', 'c')
	.help()
	.alias('help', 'h')
	.argv;

// Verify that the credentials are usable
if(!config.token && (!config.email || !config.password)) {
	console.log('Both "email" and "password" must be specified if not using a token.');
	process.exit(1);
}

// Create client
export const client = new Discord.Client({ autoReconnect: config.autoReconnect });
client.on('ready', () => {
	console.log('Bot is ready; logged in as ' + client.user.username + '#' + client.user.discriminator + ' (ID ' + client.user.id + ')');
});
client.on('error', e => {
	console.log('ERROR: ' + e);
});
client.on('warn', e => {
	console.log('WARNING: ' + e);
});
client.on('disconnected', () => {
	console.log('Disconnected!');
});

// Set up commands
client.on('message', message => {
	if(message.author !== client.user) {
		commandLoop: for(const command of commands) {
			for(const match of command.triggers()) {
				const matchResult = match.exec(message.content);
				if(matchResult) {
					console.log('Running ' + command.name + ': message="' + message + '" matchResult="' + matchResult + '"');
					command.run(message, matchResult);
					break commandLoop;
				}
			}
		}
	}
});

// Log in
if(config.token) client.loginWithToken(config.token, config.email, config.password); else client.login(config.email, config.password);
