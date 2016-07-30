'use babel';
'use strict';

import database from '../../database/mod-roles';

export default {
	name: 'modroles',
	aliases: ['listmodroles', 'mods'],
	group: 'mod-roles',
	groupName: 'list',
	description: 'Lists all moderator roles.',
	usage: '!modroles',
	details: 'Only administrators may use this command.',
	examples: ['!modroles'],

	isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	},

	run(message) {
		const roles = database.findRolesInServer(message.server);
		if(roles.length > 0) {
			message.client.reply(message, 'Moderator roles:\n' + roles.map(role => `${role.name} (ID: ${role.id})`).join('\n'));
		} else {
			message.client.reply(message, 'There are no moderator roles.');
		}
	}
};
