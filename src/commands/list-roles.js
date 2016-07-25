'use babel';
'use strict';

export default {
	information: {
		name: 'roles',
		aliases: ['listroles'],
		description: 'Lists all server roles.',
		usage: '!roles',
		details: 'Only administrators may use this command.',
		examples: ['!roles']
	},

	triggers: [
		/^!(?:roles|listroles)(?:\s.*)?$/i
	],

	isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	},

	run(message) {
		const roleList = message.server.roles.map(element => `${element.name} (ID ${element.id})`).join('\n');
		message.client.reply(message, `Server roles:\n${roleList}`);
	}
};
