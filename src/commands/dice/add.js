'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import { oneLine } from 'common-tags';
import Roll from '../../database/roll';

export default class AddRollCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'add-roll',
			aliases: ['save-roll'],
			module: 'rolls',
			memberName: 'add',
			description: 'Adds a roll to the database, or updates the existing one.',
			usage: 'add-roll <name> <expression>',
			details: oneLine`
				The roll name can be a maximum of 60 characters long, and must be surrounded by quotes if it contains spaces.
				The expression must be a valid dice expression.
				Only the owner of the roll and administrators/moderators may update it.
			`,
			examples: ['add-roll Percent 1d100', 'add-roll "Coin flip" 1d2'],
			guildOnly: false,
			argsType: 'multiple',
			argsCount: 2,
			argsSingleQuotes: false
		});
	}

	async run(message, args) {
		const name = args[0], expression = args[1];
		if(!name || !expression) throw new CommandFormatError(this, message.guild);
		if(this.bot.util.patterns.anyUserMentions.test(name)
			|| this.bot.util.patterns.anyUserMentions.test(expression)) return 'Please do not use mentions in your roll name or expression.';

		// Apply some restrictions
		if(name.length > 60) return 'A roll\'s name may not be longer than 60 characters.';
		if(name.includes('\n')) return 'A roll\'s name may not have multiple lines.';

		// Add or update the roll
		const result = await Roll.save(new Roll(message.guild, message.author, name, expression.replace(/(?:\s*\n\s*){3,}/g, '\n\n')));
		if(result) {
			return `${result.new ? 'Added' : 'Updated'} roll "${name}".`;
		} else {
			return `Unable to update roll "${name}". You are not the owner.`;
		}
	}
}
