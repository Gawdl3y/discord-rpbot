'use babel';
'use strict';

import { Command } from 'discord-graf';
import { stripIndents, oneLine } from 'common-tags';
import Roll from '../../database/roll';
import config from '../../config';
import * as transformers from '../../util/transformers';

export default class ListCharactersCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'rolls',
			aliases: ['list-rolls'],
			module: 'rolls',
			memberName: 'list',
			description: 'Lists/searches rolls in the database.',
			usage: 'rolls [search] [page]',
			details: oneLine`
				If no search string is specified, all rolls will be listed.
				If the search string is only one letter long, rolls that start with that roll will be listed.
				If the search string is more than one letter, all rolls that contain that string will be listed.
				If the search string contains spaces, it must be surrounded by quotes.
			`,
			examples: ['rolls', 'rolls p', 'rolls percent'],
			guildOnly: true,
			argsType: 'multiple'
		});
	}

	async run(message, args) {
		const last = args.length >= 1 ? args.length - 1 : 0;
		const page = !isNaN(args[last]) ? parseInt(args.pop()) : 1;
		const search = args.join(' ');
		let rolls = await Roll.findInGuild(message.guild, search, false);
		if(rolls.length > 0) {
			// Add owner name to the Rolls to display alongside the Roll names
			for(const [index, roll] of rolls.entries()) rolls[index].ownerName = await transformers.ownerIdToName(message, roll.owner);
			rolls.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
			const paginated = this.bot.util.paginate(rolls, page, Math.floor(config.paginationItems));
			rolls = paginated.items;
			return stripIndents`
				__**Roll${search ? `s ${search.length === 1 ? 'that begin with' : 'that contain'} "${search}"` : ' list'}, ${paginated.pageText}:**__
				${rolls.map(roll => `**-** ${roll.name} (created by ${roll.ownerName})`).join('\n')}
				${paginated.maxPage > 1 ? `\nUse ${this.bot.util.usage(`rolls ${search ? `${search} ` : ''}<page>`, message.guild)} to view a specific page.` : ''}
				Use ${this.bot.util.usage('view-roll <name> [owner]', message.guild)} to view information about a roll.
			`;
		} else {
			return `There are no rolls ${search ? `${search.length === 1 ? 'that begin with' : 'that contain'} "${search}"` : 'in the database'}.`;
		}
	}
}
