'use babel';
'use strict';

import { serverCommandPatterns, client } from '../../rpbot';
import config from '../../config';
import buildCommandPattern from '../../util/command-pattern';
import * as permissions from '../../util/permissions';
import * as usage from '../../util/command-usage';
import SettingsDatabase from '../../database/settings';
import Setting from '../../database/setting';

export default {
	name: 'prefix',
	group: 'general',
	groupName: 'prefix',
	description: 'Shows or sets the command prefix.',
	usage: 'prefix [prefix|"default"|"none"]',
	details: 'If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot\'s default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.',
	examples: ['prefix', 'prefix -', 'prefix rp!', 'prefix default', 'prefix none'],
	singleArgument: true,

	isRunnable() {
		return true;
	},

	run(message, args) {
		if(args[0] && message.server) {
			// Only allow administrators
			if(!permissions.isAdministrator(message.server, message.author)) {
				message.reply('Only administrators may change the command prefix.');
				return;
			}

			// Save the prefix
			const lowercase = args[0].toLowerCase();
			const prefix = lowercase === 'none' ? '' : args[0];
			let response;
			if(lowercase === 'default') {
				SettingsDatabase.deleteSetting('command-prefix', message.server);
				response = `Reset the command prefix to default (currently "${config.commandPrefix}").`;
			} else {
				SettingsDatabase.saveSetting(new Setting(message.server, 'command-prefix', prefix));
				response = prefix ? `Set the command prefix to "${args[0]}".` : 'Removed the command prefix entirely.';
			}

			// Build the pattern
			const pattern = buildCommandPattern(message.server, client.user);
			serverCommandPatterns[message.server.id] = pattern;

			message.reply(`${response} To run commands, use ${usage.long('command', message.server)}.`);
		} else {
			const prefix = message.server ? SettingsDatabase.getSettingValue('command-prefix', config.commandPrefix, message.server) : config.commandPrefix;
			const response = prefix ? `The command prefix is "${prefix}".` : 'There is no command prefix.';
			message.reply(response + ` To run commands, use ${usage.long('command', message.server)}`);
		}
	}
};
