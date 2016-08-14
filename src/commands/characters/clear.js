'use babel';
'use strict';

import graf from 'discord-graf';
import Character from '../../database/character';

let lastUser;
let timeout;

export default {
	name: 'clearcharacters',
	aliases: ['clearchars'],
	group: 'characters',
	groupName: 'clear',
	description: 'Clears the character database.',
	details: 'Only administrators may use this command.',
	serverOnly: true,

	isRunnable(message) {
		return graf.permissions.isAdmin(message.server, message.author);
	},

	async run(message, args) {
		if(message.author.equals(lastUser) && args[0] && args[0].toLowerCase() === 'confirm') {
			Character.clearServer(message.server);
			clearTimeout(timeout);
			lastUser = null;
			timeout = null;
			return 'Cleared the character database.';
		} else {
			if(timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			lastUser = message.author;
			timeout = setTimeout(() => { lastUser = null; }, 30000);
			return `Are you sure you want to delete all characters? This cannot be undone. Use ${graf.usage('clearcharacters confirm', message.server)} to continue.`;
		}
	}
};
