'use babel';
'use strict';

import { Command } from 'discord-graf';
import { stripIndents, oneLine } from 'common-tags';
import Character from '../../database/character';
import config from '../../config';

export default class ListCharactersCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'characters',
			aliases: ['list-characters', 'list-chars', 'chars'],
			module: 'characters',
			memberName: 'list',
			description: 'Lists/searches characters in the database.',
			usage: 'characters [search] [page]',
			details: oneLine`
				If no search string is specified, all characters will be listed.
				If the search string is only one letter long, characters that start with that character will be listed.
				If the search string is more than one letter, all characters that contain that string will be listed.
				If the search string contains spaces, it must be surrounded by quotes.
			`,
			examples: ['characters', 'characters c', 'characters bill'],
			guildOnly: true,
			argsType: 'multiple'
		});
	}

	async run(message, args) {
		const last = args.length >= 1 ? args.length - 1 : 0;
		const page = !isNaN(args[last]) ? parseInt(args.pop()) : 1;
		const search = args.join(' ');
		let characters = await Character.findInGuild(message.guild, search, false);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
			const paginated = this.bot.util.paginate(characters, page, Math.floor(config.paginationItems));
			characters = paginated.items;
			return stripIndents`
				__**Character${search ? `s ${search.length === 1 ? 'that begin with' : 'that contain'} "${search}"` : ' list'}, ${paginated.pageText}:**__
				${characters.map(char => `**-** ${char.name}`).join('\n')}
				${paginated.maxPage > 1 ? `\nUse ${this.bot.util.usage(`characters ${search ? `${search} ` : ''}<page>`, message.guild)} to view a specific page.` : ''}
				Use ${this.bot.util.usage('character <name>', message.guild)} to view information about a character.
			`;
		} else {
			return `There are no characters ${search ? `${search.length === 1 ? 'that begin with' : 'that contain'} "${search}"` : 'in the database'}.`;
		}
	}
}
