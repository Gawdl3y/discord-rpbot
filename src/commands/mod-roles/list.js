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

	triggers: [
		/^!(?:modroles|listmodroles|mods)(?:\s.*)?$/i
	],

	isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	},

	run(message) {
		const roles = database.findRolesInServer(message.server);
		if(roles.length > 0) {
			message.client.reply(message, 'Moderator roles:\n' + roles.map(element => element.name + ' (ID ' + element.id + ')').join('\n'));
		} else {
			message.client.reply(message, 'There are no moderator roles.');
		}
	}
};
