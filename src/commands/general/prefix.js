'use babel';
'use strict';

import { serverCommandPatterns, client } from '../../rpbot';
import config from '../../config';
import buildCommandPattern from '../../util/command-pattern';
import * as permissions from '../../util/permissions';
import usage from '../../util/command-usage';
import Setting from '../../database/setting';

export default {
	name: 'prefix',
	group: 'general',
	groupName: 'prefix',
	description: 'Shows or sets the command prefix.',
	usage: 'prefix [prefix|"default"|"none"]',
	details: 'If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot\'s default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.',
	examples: ['prefix', 'prefix -', 'prefix rp!', 'prefix default', 'prefix none'],

	async run(message, args) {
		if(args[0] && message.server) {
			if(!permissions.isAdmin(message.server, message.author)) return 'Only administrators may change the command prefix.';

			// Save the prefix
			const lowercase = args[0].toLowerCase();
			const prefix = lowercase === 'none' ? '' : args[0];
			let response;
			if(lowercase === 'default') {
				Setting.delete('command-prefix', message.server);
				response = `Reset the command prefix to default (currently "${config.commandPrefix}").`;
			} else {
				Setting.save(new Setting(message.server, 'command-prefix', prefix));
				response = prefix ? `Set the command prefix to "${args[0]}".` : 'Removed the command prefix entirely.';
			}

			// Build the pattern
			const pattern = buildCommandPattern(message.server, client.user);
			serverCommandPatterns[message.server.id] = pattern;

			return `${response} To run commands, use ${usage('command', message.server)}.`;
		} else {
			const prefix = message.server ? Setting.getValue('command-prefix', config.commandPrefix, message.server) : config.commandPrefix;
			return `${prefix ? `The command prefix is "${prefix}".` : 'There is no command prefix.'} To run commands, use ${usage('command', message.server)}.`;
		}
	}
};
