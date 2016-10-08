'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import { oneLine } from 'common-tags';
import Roll from '../../database/roll';
import * as transformers from '../../util/transformers';

export default class ViewRollCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'view-roll',
			aliases: ['show-roll'],
			module: 'rolls',
			memberName: 'view',
			description: 'Views a roll\'s information.',
			usage: 'roll <name> [owner]',
			details: oneLine`
				The name can be the whole name of the roll, or just a part of it.
				If there are multiple rolls with the same name but different owners, the owner name should be specified after the roll name.
			`,
			examples: ['view-roll Percentage', 'view-roll per', 'view-roll Spot user#1234'],
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
			const ownerName = await transformers.ownerIdToName(message, rolls[0].owner);
			return `Roll **${rolls[0].name}** (created by ${ownerName}):\n${rolls[0].expression}`;
		} else if(rolls.length > 1) {
			return `${this.bot.util.disambiguation(rolls, 'rolls')}\nUse ${this.bot.util.usage('view-roll <name> [owner]', message.guild)} to view information about a roll.`;
		} else {
			return `Unable to find roll. Use ${this.bot.util.usage('view-rolls', message.guild)} to view the list of rolls.`;
		}
	}
}
