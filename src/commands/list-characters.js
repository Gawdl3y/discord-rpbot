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
			let characterList = '';
			for(const character of characters) characterList += (characterList ? '\n' : '') + character.name;
			message.client.reply(message, 'Character list (use "!character <name>" to view information about one):\n' + characterList);
		} else {
			message.client.reply(message, 'There are no characters in the database.');
		}
	}
}
