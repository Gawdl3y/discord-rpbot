'use babel';
'use strict';

import { findCommands } from '..';
import disambiguation from '../../util/disambiguation';
import * as usage from '../../util/command-usage';

export default {
	name: 'help',
	group: 'general',
	groupName: 'help',
	description: 'Displays a list of available commands, or detailed information for a specified command.',
	usage: 'help [command]',
	details: 'The command may be part of a command name or a whole command name. If it isn\'t specified, all available commands will be listed.',
	examples: ['!help', '!help roll'],

	isRunnable() {
		return true;
	},

	run(message, args) {
		const commands = findCommands(args[0], message);
		if(args[0]) {
			if(commands.length === 1) {
				let help = 'Command **' + commands[0].name + '**: ' + commands[0].description;
				help += '\n**Usage:** ' + usage.long(commands[0].usage ? commands[0].usage : commands[0].name);
				if(commands[0].aliases) help += '\n**Aliases:** ' + commands[0].aliases.join(', ');
				if(commands[0].details) help += '\n**Details:** ' + commands[0].details;
				if(commands[0].examples) help += '\n**Examples:**\n' + commands[0].examples.join('\n');
				message.client.reply(message, help);
			} else if(commands.length > 1) {
				message.client.reply(message, disambiguation(commands, 'commands'));
			} else {
				message.client.reply(message, `Unable to identify command. Use ${usage.long('help')} to view the list of all commands.`);
			}
		} else {
			const info = `To use a command, use ${usage.long('command')}. For example, ${usage.long('roll d20')}.`;
			const commandList = commands.map(c => `${c.name} - ${c.description}`).join('\n');
			message.client.reply(message, `${info}\n\nAvailable commands (use ${usage.short('help <command>', false)} for more info):\n${commandList}`);
		}
	}
};
