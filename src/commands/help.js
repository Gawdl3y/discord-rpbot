'use babel';
'use strict';

import { commands } from '../rpbot';

export default class HelpCommand {
	static information() {
		return {
			label: 'help',
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			usage: '!help <command (optional)>',
			examples: ['!help', '!help roll']
		};
	}

	static triggers() {
		return [
			/^!help(?:\s+([a-z0-9 -]+?))?\s*$/i
		];
	}

	static run(message, matches) {
		if(matches[1]) {
			const command = commands.find(command => command.information().label === matches[1].toLowerCase());
			if(command) {
				const info = command.information();
				let help = 'Command "' + info.label + '": ' + info.description;
				help += '\n**Usage:** ' + info.usage;
				help += info.details ? '\n**Details:** ' + info.details : '';
				if(info.examples) {
					help += '\n**Examples:**';
					for(const example of info.examples) help += '\n' + example;
				}
				message.client.reply(message, help);
			} else {
				message.client.reply(message, 'Invalid command specified.');
			}
		} else {
			let commandList = '';
			for(const command of commands) {
				if(commandList) commandList += '\n';
				const info = command.information();
				commandList += '!' + info.label + ' - ' + info.description;
			}
			message.client.reply(message, 'Available commands (use "!help <command>" for more info):\n' + commandList);
		}
	}
}
