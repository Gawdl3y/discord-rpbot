'use babel';
'use strict';

import Character from '../characters/character';
import database from '../characters/database';

export default class DeleteCharacterCommand {
	static get information() {
		return {
			label: 'deletecharacter',
			description: 'Deletes a character from the database.',
			usage: '!deletecharacter <name>',
			examples: ['!deletecharacter Billy McBillface']
		};
	}

	static get triggers() {
		return [
			/^!deletecharacter\s+"?(.+?)"?\s*$/i
		];
	}

	static run(message, matches) {
		const character = new Character(matches[1], null, message.author.id, message.server.id);
		if(database.deleteCharacter(character, message)) {
			message.client.reply(message, 'Deleted character "' + character.name + '".');
		} else {
			message.client.reply(message, 'Unable to delete character "' + character.name + '". It may not exist, or you may not be the owner.');
		}
	}
}
