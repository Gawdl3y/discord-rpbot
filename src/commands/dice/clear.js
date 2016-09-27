'use babel';
'use strict';

import { Command } from 'discord-graf';
import Roll from '../../database/roll';

export default class ClearRollsCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clear-rolls',
			module: 'rolls',
			memberName: 'clear',
			description: 'Clears the rolls database.',
			details: 'Only administrators may use this command.',
			guildOnly: true
		});

		this.lastUser = null;
		this.timeout = null;
	}

	hasPermission(guild, user) {
		return this.bot.permissions.isAdmin(guild, user);
	}

	async run(message, args) {
		if(this.lastUser && message.author.id === this.lastUser.id && args[0] && args[0].toLowerCase() === 'confirm') {
			Roll.clearGuild(message.guild);
			clearTimeout(this.timeout);
			this.lastUser = null;
			this.timeout = null;
			return 'Cleared the roll database.';
		} else {
			if(this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.lastUser = message.author;
			this.timeout = setTimeout(() => { this.lastUser = null; }, 30000);
			return `Are you sure you want to delete all rolls? This cannot be undone. Use ${this.bot.util.usage('clear-rolls confirm', message.guild)} to continue.`;
		}
	}
}
