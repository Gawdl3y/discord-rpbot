'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class DeleteCharacterCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'delete-character',
			aliases: ['remove-character', 'del-char', 'rm-char'],
			module: 'characters',
			memberName: 'delete',
			description: 'Deletes a character from the database.',
			usage: 'delete-character <name>',
			details: 'The name can be the whole name of the character, or just a part of it. Only the owner of the character and administrators/moderators may delete it.',
			examples: ['delete-character Billy McBillface', 'delete-character bill'],
			guildOnly: true
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const characters = await Character.findInGuild(message.guild, args[0]);
		if(characters.length === 1) {
			characters[0].owner = message.author.id;
			if(await Character.delete(characters[0])) {
				return `Deleted character "${characters[0].name}".`;
			} else {
				return `Unable to delete character "${characters[0].name}". You are not the owner.`;
			}
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.guild)} to view the list of characters.`;
		}
	}
}
