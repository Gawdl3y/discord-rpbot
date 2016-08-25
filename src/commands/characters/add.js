'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import { oneLine } from 'common-tags';
import Character from '../../database/character';

export default class AddCharacterCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'add-character',
			aliases: ['add-char'],
			module: 'characters',
			memberName: 'add',
			description: 'Adds a character to the database, or updates the existing one.',
			usage: 'add-character <name> <info>',
			details: oneLine`
				The character name can be a maximum of 60 characters long, and must be surrounded by quotes if it contains spaces.
				The information doesn't have to be a single line.
				Only the owner of the character and administrators/moderators may update it.
			`,
			examples: ['add-character Bob Just your average guy.', 'add-character "Billy McBillface" A really cool guy who enjoys his chicken tendies.'],
			guildOnly: true,
			argsType: 'multiple',
			argsCount: 2,
			argsSingleQuotes: false
		});
	}

	async run(message, args) {
		const name = args[0], info = args[1];
		if(!name || !info) throw new CommandFormatError(this, message.guild);
		if(this.bot.util.patterns.anyUserMentions.test(name)
			|| this.bot.util.patterns.anyUserMentions.test(info)) return 'Please do not use mentions in your character name or information.';

		// Apply some restrictions
		if(name.length > 60) return 'A character\'s name may not be longer than 60 characters.';
		if(name.includes('\n')) return 'A character\'s name may not have multiple lines.';

		// Add or update the character
		const result = await Character.save(new Character(message.guild, message.author, name, info.replace(/(?:\s*\n\s*){3,}/g, '\n\n')));
		if(result) {
			return `${result.new ? 'Added' : 'Updated'} character "${name}".`;
		} else {
			return `Unable to update character "${name}". You are not the owner.`;
		}
	}
}
