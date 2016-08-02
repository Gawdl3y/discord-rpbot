'use babel';
'use strict';

import Character from '../../database/character';
import config from '../../config';
import paginate from '../../util/pagination';
import * as usage from '../../util/command-usage';

export default {
	name: 'characters',
	aliases: ['listcharacters', 'listchars', 'chars'],
	group: 'characters',
	groupName: 'list',
	description: 'Lists/searches characters in the database.',
	usage: 'characters [search] [page]',
	details: 'If no search string is specified, all characters will be listed. If the search string is only one letter long, characters that start with that character will be listed. If the search string is more than one letter, all characters that contain that string will be listed. If the search string contains spaces, it must be surrounded by quotes.',
	examples: ['characters', 'characters c', 'characters bill'],

	isRunnable(message) {
		return !!message.server;
	},

	async run(message, args) {
		const last = args.length >= 1 ? args.length - 1 : 0;
		const page = !isNaN(args[last]) ? parseInt(args.pop()) : 1;
		const search = args.join(' ');
		let characters = await Character.findInServer(message.server, search, false);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
			const paginated = paginate(characters, page, Math.floor(config.paginationItems));
			characters = paginated.items;

			let messageText = search ? (search.length === 1 ? 'Characters that begin with' : 'Characters that contain') + ' "' + search + '"' : 'Character list';
			messageText += ', ' + paginated.pageText + ' (Use ';
			if(paginated.maxPage > 1) messageText += usage.short('characters' + (search ? ' ' + search : '') + ' <page>') + ' to view a specific page, or ';
			messageText += usage.short('character <name>') + ' to view information about a character):';
			messageText += '\n\n' + characters.map(element => element.name).join('\n');
			message.reply(messageText);
		} else {
			const messageText = 'There are no characters ' + (search ? (search.length === 1 ? 'that begin with' : 'that contain') + ' "' + search + '".' : 'in the database.');
			message.reply(messageText);
		}
	}
};
