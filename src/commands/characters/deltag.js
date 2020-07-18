'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class DelTagCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'del-tag',
			aliases: ['untagchar', 'deltag', 'untag'],
			module: 'characters',
			memberName: 'deltag',
			description: 'Removes a tag to a character in the database.',
			usage: 'del-tag <character> <tag>',
			details: 'If a character name or tag contains spaces it must be enclosed by quotes. Only the owner of the character and administrators/moderators may tag it.',
			examples: ['del-tag Billy Human', 'del-tag dave kaiju'],
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
			if(await Character.deltag(characters[0], args[1])) {
				return `Removed tag to character "${characters[0].name}".`;
			} else {
				return `Unable to remove tag from character "${characters[0].name}".`;
			}
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.guild)} to view the list of characters.`;
		}
	}
}
