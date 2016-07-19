'use babel';
'use strict';

import database from '../characters/database';

export default class ListCharactersCommand {
	static get information() {
		return {
			label: 'characters',
			aliases: ['listcharacters', 'chars'],
			description: 'Lists characters in the database.',
			usage: '!characters <search (optional)>',
			details: 'If no search string is specified, all characters will be listed. If the search string is only one letter long, characters that start with that character will be listed. If the search string is more than one letter, all characters that contain that string will be listed.',
			examples: ['!characters', '!characters c', '!characters bill']
		};
	}

	static get triggers() {
		return [
			/^!(?:characters|listcharacters|chars)(?:\s+(.+?))?\s*$/i
		];
	}

	static run(message, matches) {
		const characters = database.findCharactersInServer(message.server.id, matches[1]);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
			const characterList = characters.map(element => element.name).join('\n');
			if(matches[1]) {
				if(matches[1].length === 1) {
					message.client.reply(message, 'Characters that begin with "' + matches[1] + '" (use "!character <name>" to view information about one):\n' + characterList);
				} else {
					message.client.reply(message, 'Characters that contain "' + matches[1] + '" (use "!character <name>" to view information about one):\n' + characterList);
				}
			} else {
				message.client.reply(message, 'Character list (use "!character <name>" to view information about one):\n' + characterList);
			}
		} else {
			if(matches[1]) {
				if(matches[1].length === 1) {
					message.client.reply(message, 'There are no characters that start with "' + matches[1] + '".');
				} else {
					message.client.reply(message, 'There are no characters that contain "' + matches[1] + '".');
				}
			} else {
				message.client.reply(message, 'There are no characters in the database.');
			}
		}
	}
}
