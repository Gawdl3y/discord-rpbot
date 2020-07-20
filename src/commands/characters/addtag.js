'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class AddTagCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'add-tag',
			aliases: ['tagchar', 'addtag', 'tag'],
			module: 'characters',
			memberName: 'addtag',
			description: 'Adds a tag to a character in the database.',
			usage: 'add-tag <character> <tag>',
			details: 'If a character name or tag contains spaces it must be enclosed by quotes. Only the owner of the character and administrators/moderators may tag it.',
			examples: ['add-tag Billy Human', 'add-tag dave kaiju'],
			guildOnly: true,
			argsType: 'multiple',
			argsCount: 2
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const characters = await Character.findInGuild(message.guild, args[0]);
		if(characters.length === 1) {
			characters[0].owner = message.author.id;
			if(args[1].includes(',')) {
				return `Tags cannot contains commas.`;
			}
			if(await Character.addtag(characters[0], args[1])) {
				return `Added tag to character "${characters[0].name}".`;
			} else {
				return `Unable to tag character "${characters[0].name}".`;
			}
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.guild)} to view the list of characters.`;
		}
	}
}
