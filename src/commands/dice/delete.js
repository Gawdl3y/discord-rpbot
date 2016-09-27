'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import { oneLine } from 'common-tags';
import Roll from '../../database/roll';
import * as transformers from '../../util/transformers';

export default class DeleteRollCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'delete-roll',
			aliases: ['remove-roll', 'del-roll', 'rm-roll'],
			module: 'rolls',
			memberName: 'delete',
			description: 'Deletes a roll from the database.',
			usage: 'delete-roll <name> [owner]',
			details: oneLine`
				The name can be the whole name of the roll, or just a part of it. Only the owner of the roll and administrators/moderators may delete it.
				If there are multiple rolls with the same name but different owners, the owner name should be specified after the roll name.
				If no owner is supplied, it will default to the current user.
			`,
			examples: ['delete-roll Percentage', 'delete-roll per', 'delete-roll Percentage user#1234'],
			guildOnly: true,
			argsType: 'multiple',
			argsCount: 2
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);

		// Get roll owner ID, or default to the message author
		const ownerId = args[1] ? transformers.ownerNameToId(message, args[1]) : message.author.id;
		const rolls = await Roll.findInGuildForOwner(message.guild, ownerId, args[0]);

		if(rolls.length === 1) {
			if(await Roll.delete(rolls[0], message.author.id)) {
				return `Deleted roll "${rolls[0].name}".`;
			} else {
				return `Unable to delete roll "${rolls[0].name}". You are not the owner.`;
			}
		} else if(rolls.length > 1) {
			return `${this.bot.util.disambiguation(rolls, 'rolls')}\nUse ${this.bot.util.usage('view-roll <name> [owner]', message.guild)} to view information about a roll.`;
		} else {
			return `Unable to find roll. Use ${this.bot.util.usage('rolls', message.guild)} to view the list of rolls.`;
		}
	}
}
