'use babel';
'use strict';

import database from '../../database/characters';
import config from '../../config';
import paginate from '../../util/pagination';
import * as nbsp from '../../util/nbsp';

export default {
	name: 'characters',
	aliases: ['listcharacters', 'listchars', 'chars'],
	group: 'characters',
	groupName: 'list',
	description: 'Lists/searches characters in the database.',
	usage: '!characters [search] [page]',
	details: 'If no search string is specified, all characters will be listed. If the search string is only one letter long, characters that start with that character will be listed. If the search string is more than one letter, all characters that contain that string will be listed. If the search string contains spaces, it must be surrounded by quotes.',
	examples: ['!characters', '!characters c', '!characters bill'],

	isRunnable(message) {
		return !!message.server;
	},

	run(message, args) {
		const search = args.length >= 2 || isNaN(args[0]) ? args[0] : '';
		const page = args.length >= 2 ? parseInt(args[1]) : (!isNaN(args[0]) ? parseInt(args[0]) : 1);
		let characters = database.findCharactersInServer(message.server, search, false);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
			const paginated = paginate(characters, page, Math.floor(config.paginationItems));
			characters = paginated.items;

			let messageText = search ? (search.length === 1 ? 'Characters that begin with' : 'Characters that contain') + ' "' + search + '"' : 'Character list';
			messageText += ', ' + paginated.pageText + ' (Use ';
			if(paginated.maxPage > 1) messageText += nbsp.convert('`!characters' + (search ? ' ' + search : '') + ' <page>`') + ' to view a specific page, or ';
			messageText += '`!character' + nbsp.character + '<name>` to view information about a character):';
			messageText += '\n\n' + characters.map(element => element.name).join('\n');
			message.client.reply(message, messageText);
		} else {
			const messageText = 'There are no characters ' + (search ? (search.length === 1 ? 'that begin with' : 'that contain') + ' "' + search + '".' : 'in the database.');
			message.client.reply(message, messageText);
		}
	}
};
