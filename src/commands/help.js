'use babel';
'use strict';

import commands from '../commands';
import * as nbsp from '../util/nbsp';

export default class HelpCommand {
	static get information() {
		return {
			label: 'help',
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			usage: '!help [command]',
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
			const command = commands.find(c => c.information.label === lowercaseSearch || (c.information.aliases && c.information.aliases.includes(lowercaseSearch)));
			if(command) {
				const info = command.information;
				let help = 'Command **' + info.label + '**: ' + info.description;
				help += '\n**Usage:** `' + nbsp.convert(info.usage) + '`';
				if(info.aliases) help += '\n**Aliases:** ' + info.aliases.join(', ');
				if(info.details) help += '\n**Details:** ' + info.details;
				if(info.examples) help += '\n**Examples:**\n' + info.examples.join('\n');
				message.client.reply(message, help);
			} else {
				message.client.reply(message, 'Invalid command specified. Use `!help` to view the list of all commands.');
			}
		} else {
			const commandList = commands.filter(c => c.isRunnable(message)).map(c => c.information.label + ' - ' + c.information.description).join('\n');
			message.client.reply(message, `Available commands (use \`!help${nbsp.character}<command>\` for more info):\n${commandList}`);
		}
	}
}
