'use babel';
'use strict';

import { stripIndents } from 'common-tags';
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
		return stripIndents`
			__**Server roles:**__
			${message.server.roles.map(role => `**-** ${role.name} (ID: ${role.id})`).join('\n')}
		`;
	}
};
