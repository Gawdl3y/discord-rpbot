'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import { groups, findCommands, isUsable } from '..';
import disambiguation from '../../util/disambiguation';
import usage from '../../util/command-usage';

export default {
	name: 'help',
	group: 'general',
	groupName: 'help',
	aliases: ['commands'],
	description: 'Displays a list of available commands, or detailed information for a specified command.',
	usage: 'help [command]',
	details: 'The command may be part of a command name or a whole command name. If it isn\'t specified, all available commands will be listed.',
	examples: ['help', 'help roll'],

	async run(message, args) {
		const commands = findCommands(args[0], message);
		if(args[0]) {
			if(commands.length === 1) {
				let help = stripIndents`
					__Command **${commands[0].name}**:__ ${commands[0].description}

					**Usage:** ${usage(commands[0].usage ? commands[0].usage : commands[0].name, message.server)}
				`;
				if(commands[0].aliases) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;
				return { direct: help, reply: 'Sent a DM to you with information.' };
			} else if(commands.length > 1) {
				return disambiguation(commands, 'commands');
			} else {
				return `Unable to identify command. Use ${usage('help', message.server)} to view the list of all commands.`;
			}
		} else {
			return {
				direct: stripIndents`
					To run a command in ${message.server ? message.server : 'any server'}, use ${usage('command', message.server, !message.server)}. For example, ${usage('roll d20', message.server, !message.server)}.
					To run a command in this DM, simply use ${usage('command')} with no prefix. For example, ${usage('roll d20')}.

					**Available commands in ${message.server ? `${message.server}` : 'this DM'} (use ${usage('help <command>')} for more info):**

					${groups.filter(grp => grp.commands.some(cmd => isUsable(cmd, message))).map(grp => stripIndents`
						__${grp.name}__
						${grp.commands.filter(cmd => isUsable(cmd, message)).map(cmd => `**${cmd.name}:** ${cmd.description}`).join('\n')}
					`).join('\n\n')}
				`,
				reply: message.server ? 'Sent a DM to you with information.' : null
			};
		}
	}
};
