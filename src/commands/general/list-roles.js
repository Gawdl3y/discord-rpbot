'use babel';
'use strict';

import * as permissions from '../../util/permissions';

export default {
	name: 'roles',
	aliases: ['listroles'],
	group: 'general',
	groupName: 'list-roles',
	description: 'Lists all server roles.',
	details: 'Only administrators may use this command.',

	isRunnable(message) {
		return message.server && permissions.isAdministrator(message.server, message.author);
	},

	async run(message) {
		const roleList = message.server.roles.map(element => `${element.name} (ID: ${element.id})`).join('\n');
		message.reply(`Server roles:\n${roleList}`);
	}
};
