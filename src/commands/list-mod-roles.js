'use babel';
'use strict';

import database from '../database/mod-roles';

export default class ListModRolesCommand {
	static get information() {
		return {
			label: 'modroles',
			aliases: ['listmodroles', 'mods'],
			description: 'Lists all moderator roles.',
			usage: '!modroles',
			details: 'Only administrators may use this command.',
			examples: ['!modroles']
		};
	}

	static get triggers() {
		return [
			/^!(?:modroles|listmodroles|mods)(?:\s.*)?$/i
		];
	}

	static isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	}

	static run(message) {
		const roles = database.findRolesInServer(message.server);
		if(roles.length > 0) {
			message.client.reply(message, 'Moderator roles:\n' + roles.map(element => element.name + ' (' + element.id + ')').join('\n'));
		} else {
			message.client.reply(message, 'There are no moderator roles.');
		}
	}
}
