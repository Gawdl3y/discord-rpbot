'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import ModRole from '../../database/mod-role';
import * as permissions from '../../util/permissions';

export default {
	name: 'modroles',
	aliases: ['listmodroles', 'mods'],
	group: 'mod-roles',
	groupName: 'list',
	description: 'Lists all moderator roles.',
	details: 'Only administrators may use this command.',
	serverOnly: true,

	isRunnable(message) {
		return permissions.isAdministrator(message.server, message.author);
	},

	async run(message) {
		const roles = ModRole.findInServer(message.server);
		if(roles.length > 0) {
			return stripIndents`
				__**Moderator roles:**__
				${roles.map(role => `**-** ${role.name} (ID: ${role.id})`).join('\n')}
			`;
		} else {
			return 'There are no moderator roles.';
		}
	}
};
