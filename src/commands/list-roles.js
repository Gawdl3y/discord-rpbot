'use babel';
'use strict';

export default class ListRolesCommand {
	static get information() {
		return {
			label: 'roles',
			aliases: ['listroles'],
			description: 'Lists all server roles.',
			usage: '!roles',
			details: 'Only administrators may use this command.',
			examples: ['!roles']
		};
	}

	static get triggers() {
		return [
			/^!(?:roles|listroles)(?:\s.*)?$/i
		];
	}

	static isRunnable(message) {
		return message.server && message.server.rolesOfUser(message.author).some(role => role.hasPermission('administrator'));
	}

	static run(message) {
		const roleList = message.server.roles.map(element => element.name + ' (' + element.id + ')').join('\n');
		message.client.reply(message, 'Server roles:\n' + roleList);
	}
}
