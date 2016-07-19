'use babel';
'use strict';

import database from '../characters/database';

export default class ListCharactersCommand {
	static get information() {
		return {
			label: 'characters',
			description: 'Lists all of the characters in the database.',
			usage: '!characters'
		};
	}

	static get triggers() {
		return [
			/^!characters(?:\s.*)?$/i
		];
	}

	static run(message) {
		const characters = database.findCharactersInServer(message.server.id);
		if(characters.length > 0) {
			characters.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
			const characterList = characters.map(element => element.name).join('\n');
			message.client.reply(message, 'Character list (use "!character <name>" to view information about one):\n' + characterList);
		} else {
			message.client.reply(message, 'There are no characters in the database.');
		}
	}
}
