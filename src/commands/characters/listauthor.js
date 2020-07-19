'use babel';
'use strict';

import { Command } from 'discord-graf';
import { stripIndents, oneLine } from 'common-tags';
import Character from '../../database/character';
import config from '../../config';

export default class ListCharactersCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'authors',
			aliases: ['list-authors', 'list-auths'],
			module: 'characters',
			memberName: 'listauthors',
			description: 'Lists/searches characters in the database by author id.',
			usage: 'authors [search] [page]',
			details: oneLine`
				If no search string is specified, all characters will be listed.
			`,
			examples: ['authors', 'authors 244596062147313664'],
			guildOnly: true,
			argsType: 'multiple'
		});
	}

	async run(message, args) {
		const last = args.length >= 2 ? args.length - 1 : -1;
		const page = !isNaN(args[last]) ? parseInt(args.pop()) : 1;
		const search = args.join(' ');
		let characters = await Character.findAuthorInGuild(message.guild, search, false);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
			const paginated = this.bot.util.paginate(characters, page, Math.floor(config.paginationItems));
			characters = paginated.items;
			return stripIndents`
				__**Character${search ? `s ${search.length === 1 ? 'from authors beginning with' : 'from author'} "${search}"` : ' list'}, ${paginated.pageText}:**__
				${characters.map(char => `**-** ${char.name}`).join('\n')}
				${paginated.maxPage > 1 ? `\nUse ${this.bot.util.usage(`authors ${search ? `${search} ` : ''}<page>`, message.guild)} to view a specific page.` : ''}
				Use ${this.bot.util.usage('character <name>', message.guild)} to view information about a character.
			`;
		} else {
			return `There are no characters ${search ? `${search.length === 1 ? 'from authors beginning with' : 'from author'} "${search}"` : 'in the database'}.`;
		}
	}
}
