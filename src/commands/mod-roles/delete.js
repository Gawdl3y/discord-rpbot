'use babel';
'use strict';

import ModRole from '../../database/mod-role';
import disambiguation from '../../util/disambiguation';
import * as usage from '../../util/command-usage';
import * as permissions from '../../util/permissions';
import CommandFormatError from '../../util/errors/command-format';

const pattern = /^(?:<@&)?(.+?)>?$/;

export default {
	name: 'deletemodrole',
	aliases: ['removemodrole', 'delmodrole', 'removemod', 'deletemod', 'delmod'],
	group: 'mod-roles',
	groupName: 'delete',
	description: 'Deletes a moderator role.',
	usage: 'deletemodrole <role>',
	details: 'The role must be the ID of a role, or a role mention. Only administrators may use this command.',
	examples: ['deletemodrole cool', 'deletemodrole 205536402341888001', 'deletemodrole @CoolPeopleRole'],
	singleArgument: true,

	isRunnable(message) {
		return message.server && permissions.isAdministrator(message.server, message.author);
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this);
		const matches = pattern.exec(args[0]);
		let roles;
		const idRole = message.server.roles.get('id', matches[1]);
		if(idRole) roles = [idRole]; else roles = ModRole.findInServer(message.server, matches[1]);

		if(roles.length === 1) {
			if(ModRole.delete(roles[0])) {
				message.reply(`Removed "${roles[0].name}" from the moderator roles.`);
			} else {
				message.reply(`Unable to remove "${roles[0].name}" from the moderator roles. It isn\'t one.`);
			}
		} else if(roles.length > 1) {
			message.reply(disambiguation(roles, 'roles'));
		} else {
			message.reply(`Unable to identify role. Use ${usage.long('modroles', message.server)} to view the the moderator roles, and ${usage.long('roles', message.server)} to view all of the server roles.`);
		}
	}
};
