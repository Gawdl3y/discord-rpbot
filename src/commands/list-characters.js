'use babel';
'use strict';

import database from '../database/characters';
import config from '../config';
import paginate from '../util/pagination';
import * as nbsp from '../util/nbsp';

export default class ListCharactersCommand {
	static get information() {
		return {
			label: 'characters',
			aliases: ['listcharacters', 'chars'],
			description: 'Lists/searches characters in the database.',
			usage: '!characters [search] [page]',
			details: 'If no search string is specified, all characters will be listed. If the search string is only one letter long, characters that start with that character will be listed. If the search string is more than one letter, all characters that contain that string will be listed.',
			examples: ['!characters', '!characters c', '!characters bill']
		};
	}

	static get triggers() {
		return [
			/^!(?:characters|listcharacters|chars)(?:\s+(.+?))??(?:\s+([0-9]+))?\s*$/i
		];
	}

	static isRunnable(message) {
		return !!message.server;
	}

	static run(message, matches) {
		let characters = database.findCharactersInServer(message.server, matches[1], false);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
			const paginated = paginate(characters, matches[2] ? parseInt(matches[2]) : 1, Math.floor(config.paginationItems));
			characters = paginated.items;

			let messageText = matches[1] ? (matches[1].length === 1 ? 'Characters that begin with' : 'Characters that contain') + ' "' + matches[1] + '"' : 'Character list';
			messageText += ', ' + paginated.pageText + ' (Use ';
			if(paginated.maxPage > 1) messageText += nbsp.convert('`!characters' + (matches[1] ? ' ' + matches[1] : '') + ' <page>`') + ' to view a specific page, or ';
			messageText += '`!character' + nbsp.character + '<name>` to view information about a character):';
			messageText += '\n\n' + characters.map(element => element.name).join('\n');
			message.client.reply(message, messageText);
		} else {
			const messageText = 'There are no characters ' + (matches[1] ? (matches[1].length === 1 ? 'that start with' : 'that contain') + ' "' + matches[1] + '".' : 'in the database.');
			message.client.reply(message, messageText);
		}
	}
}
