'use babel';
'use strict';

import { Command } from 'discord-graf';
import Character from '../../database/character';

export default class ClearCharactersCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clearcharacters',
			aliases: ['clearchars'],
			module: 'characters',
			memberName: 'clear',
			description: 'Clears the character database.',
			details: 'Only administrators may use this command.',
			serverOnly: true
		});

		this.lastUser = null;
		this.timeout = null;
	}

	hasPermission(server, user) {
		return this.bot.permissions.isAdmin(server, user);
	}

	async run(message, args) {
		if(message.author.equals(this.lastUser) && args[0] && args[0].toLowerCase() === 'confirm') {
			Character.clearServer(message.server);
			clearTimeout(this.timeout);
			this.lastUser = null;
			this.timeout = null;
			return 'Cleared the character database.';
		} else {
			if(this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.lastUser = message.author;
			this.timeout = setTimeout(() => { this.lastUser = null; }, 30000);
			return `Are you sure you want to delete all characters? This cannot be undone. Use ${this.bot.util.usage('clearcharacters confirm', message.server)} to continue.`;
		}
	}
}
