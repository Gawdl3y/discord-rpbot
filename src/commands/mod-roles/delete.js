'use babel';
'use strict';

import database from '../../database/mod-roles';
import disambiguation from '../../util/disambiguation';
import * as usage from '../../util/command-usage';

const pattern = /^(?:<@&)?(.+?)>?$/;

export default {
	name: 'deletemodrole',
	aliases: ['removemodrole', 'delmodrole', 'removemod', 'deletemod', 'delmod'],
	group: 'mod-roles',
	groupName: 'delete',
	description: 'Deletes a moderator role.',
	usage: 'deletemodrole <role>',
	details: 'The role must be the ID of a role, or a role mention. Only administrators may use this command.',
	examples: ['!deletemodrole cool', '!deletemodrole 205536402341888001', '!deletemodrole @CoolPeopleRole'],
	singleArgument: true,

	isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	},

	run(message, args) {
		if(!args[0]) return false;
		const matches = pattern.exec(args[0]);
		let roles;
		const idRole = message.server.roles.get('id', matches[1]);
		if(idRole) roles = [idRole]; else roles = database.findRolesInServer(message.server, matches[1]);

		if(roles.length === 1) {
			if(database.deleteRole(roles[0])) {
				message.client.reply(message, `Removed "${roles[0].name}" from the moderator roles.`);
			} else {
				message.client.reply(message, `Unable to remove "${roles[0].name}" from the moderator roles. It isn\'t one.`);
			}
		} else if(roles.length > 1) {
			message.client.reply(message, disambiguation(roles, 'roles'));
		} else {
			message.client.reply(message, `Unable to identify role. Use ${usage.long('modroles')} to view the the moderator roles, and ${usage.long('roles')} to view all of the server roles.`);
		}
	}
};
