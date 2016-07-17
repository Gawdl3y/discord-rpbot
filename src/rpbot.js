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
	.option('email', {
		type: 'string',
		alias: 'e',
		describe: 'Email for the Discord account'
	})
	.option('password', {
		type: 'string',
		alias: 'p',
		describe: 'Password for the Discord account'
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

// Verify that user and password are set
if(!config.email) {
	console.log('No email specified. Config file: ' + config.config);
	process.exit(1);
}
if(!config.password) {
	console.log('No password specified. Config file: ' + config.config);
	process.exit(1);
}

// Create client
export const bot = new Discord.Client();
bot.on('ready', () => {
	console.log('Bot is ready; logged in as ' + bot.user.username + '#' + bot.user.discriminator + ' (ID ' + bot.user.id + ')');
});
bot.on('error', e => {
	console.log('ERROR: ' + e);
});
bot.on('warn', e => {
	console.log('WARNING: ' + e);
});
bot.on('disconnected', () => {
	console.log('Disconnected!');
	process.exit(1);
})

// Set up commands
bot.on('message', message => {
	if(message.author !== bot.user) {
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
bot.login(config.email, config.password);
