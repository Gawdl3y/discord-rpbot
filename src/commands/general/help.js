'use babel';
'use strict';

import { findCommands } from '..';
import disambiguation from '../../util/disambiguation';
import * as nbsp from '../../util/nbsp';

export default {
	name: 'help',
	group: 'general',
	groupName: 'help',
	description: 'Displays a list of available commands, or detailed information for a specified command.',
	usage: '!help [command]',
	examples: ['!help', '!help roll'],

	triggers: [
		/^!help(?:\s+(.+?))?\s*$/i
	],

	isRunnable() {
		return true;
	},

	run(message, matches) {
		const commands = findCommands(matches[1], message);
		if(matches[1]) {
			if(commands.length === 1) {
				let help = 'Command **' + commands[0].name + '**: ' + commands[0].description;
				help += '\n**Usage:** `' + nbsp.convert(commands[0].usage) + '`';
				if(commands[0].aliases) help += '\n**Aliases:** ' + commands[0].aliases.join(', ');
				if(commands[0].details) help += '\n**Details:** ' + commands[0].details;
				if(commands[0].examples) help += '\n**Examples:**\n' + commands[0].examples.join('\n');
				message.client.reply(message, help);
			} else if(commands.length > 1) {
				message.client.reply(message, disambiguation(commands, 'commands'));
			} else {
				message.client.reply(message, 'Unable to find command. Use `!help` to view the list of all commands.');
			}
		} else {
			const commandList = commands.map(c => `${c.name} - ${c.description}`).join('\n');
			message.client.reply(message, `Available commands (use \`!help${nbsp.character}<command>\` for more info):\n${commandList}`);
		}
	}
};
