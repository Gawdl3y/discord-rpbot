'use babel';
'use strict';

import database from '../database/mod-roles';
import search from '../util/search';
import disambiguation from '../util/disambiguation';

export default class AddModRoleCommand {
	static get information() {
		return {
			label: 'addmodrole',
			aliases: ['addmod'],
			description: 'Adds a moderator role.',
			usage: '!addmodrole <role>',
			details: 'The role must be the name or ID of a role, or a role mention. Only administrators may use this command.',
			examples: ['!addmodrole cool', '!addmodrole 205536402341888001', '!addmodrole @CoolPeopleRole']
		};
	}

	static get triggers() {
		return [
			/^!(?:addmodrole|addmod)\s+(?:(?:<@&)?(.+?)>?)\s*$/i
		];
	}

	static isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	}

	static run(message, matches) {
		let roles;
		const idRole = message.server.roles.get('id', matches[1]);
		if(idRole) roles = [idRole]; else roles = search(message.server.roles, matches[1]);

		if(roles.length === 1) {
			if(database.saveRole(roles[0])) {
				message.client.reply(message, 'Added "' + roles[0].name + '" to the moderator roles.');
			} else {
				message.client.reply(message, 'Unable to add "' + roles[0].name + '" to the moderator roles. It already is one.');
			}
		} else if(roles.length > 1) {
			message.client.reply(message, disambiguation(roles, 'roles'));
		} else {
			message.client.reply(message, 'Unable to identify role. Use `!roles` to view all of the server roles.');
		}
	}
}
