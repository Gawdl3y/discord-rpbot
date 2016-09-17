'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class ViewCharacterCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'character',
			aliases: ['view-character', 'show-character', 'char'],
			module: 'characters',
			memberName: 'view',
			description: 'Views a character\'s information.',
			usage: 'character <name>',
			details: 'The name can be the whole name of the character, or just a part of it.',
			examples: ['character Billy McBillface', 'character bill'],
			guildOnly: true
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const characters = await Character.findInGuild(message.guild, args[0]);
		if(characters.length === 1) {
			let ownerName;
			try {
				const owner = await message.client.fetchUser(characters[0].owner);
				ownerName = `${owner.username}#${owner.discriminator}`;
				try {
					const member = await message.guild.fetchMember(owner);
					if(member.nickname) ownerName = `${member.nickname} (${ownerName})`;
				} catch(err2) {
					// do nothing
				}
				ownerName = this.bot.util.escapeMarkdown(ownerName);
			} catch(err) {
				ownerName = 'Unknown';
			}

			return `Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}`;
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.guild)} to view the list of characters.`;
		}
	}
}
