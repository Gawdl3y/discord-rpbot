'use babel';
'use strict';

import Discord from 'discord.js';
import YAML from 'js-yaml';
import fs from 'fs';

// Commands
import TestCommand from './commands/test';
import DiceRollCommand from './commands/dice-roll';
import MaxDiceRollCommand from './commands/max-roll';
import MinDiceRollCommand from './commands/min-roll';
const commands = [
	new TestCommand(),
	new DiceRollCommand(),
	new MaxDiceRollCommand(),
	new MinDiceRollCommand()
];

// Parse config
const config = YAML.safeLoad(fs.readFileSync('settings.yaml'));

// Create client
const bot = new Discord.Client();
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
	commandLoop: for(const command of commands) {
		for(const match of command.matches) {
			const matchResult = match.exec(message.content);
			if(matchResult) {
				console.log('Running ' + command.constructor.name + ': message="' + message + '" matchResult="' + matchResult + '"');
				command.run(message, matchResult);
				break commandLoop;
			}
		}
	}
});

// Log in
bot.login(config.email, config.password);
