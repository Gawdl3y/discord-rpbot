'use babel';
'use strict';

import { commands } from '../rpbot';

export default class HelpCommand {
	static get information() {
		return {
			label: 'help',
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			usage: '!help <command (optional)>',
			examples: ['!help', '!help roll']
		};
	}

	static get triggers() {
		return [
			/^!help(?:\s+(.+?))?\s*$/i
		];
	}

	static isRunnable() {
		return true;
	}

	static run(message, matches) {
		if(matches[1]) {
			const lowercaseSearch = matches[1].toLowerCase();
			const command = commands.find(command => {
				return command.information.label === lowercaseSearch || (command.information.aliases && command.information.aliases.includes(lowercaseSearch));
			});
			if(command) {
				const info = command.information;
				let help = 'Command "' + info.label + '": ' + info.description;
				help += '\n**Usage:** ' + info.usage;
				if(info.aliases) help += '\n**Aliases:** ' + info.aliases.join(', ');
				help += info.details ? '\n**Details:** ' + info.details : '';
				if(info.examples) {
					help += '\n**Examples:**';
					for(const example of info.examples) help += '\n' + example;
				}
				message.client.reply(message, help);
			} else {
				message.client.reply(message, 'Invalid command specified. Use "!help" to view the list of all commands.');
			}
		} else {
			let commandList = '';
			for(const command of commands) {
				if(commandList) commandList += '\n';
				const info = command.information;
				commandList += info.label + ' - ' + info.description;
			}
			message.client.reply(message, 'Available commands (use "!help <command>" for more info):\n' + commandList);
		}
	}
}
