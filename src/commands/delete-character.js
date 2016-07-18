'use babel';
'use strict';

import database from '../characters/database';

export default class DeleteCharacterCommand {
	static get information() {
		return {
			label: 'deletecharacter',
			description: 'Deletes a character from the database.',
			usage: '!deletecharacter <name>',
			details: 'The name can be the whole name of the character, or just a part of it.',
			examples: ['!deletecharacter Billy McBillface']
		};
	}

	static get triggers() {
		return [
			/^!deletecharacter\s+"?(.+?)"?\s*$/i
		];
	}

	static run(message, matches) {
		const characters = database.findCharacters(matches[1], message.server.id);
		if(characters.length === 1) {
			if(database.deleteCharacter(characters[0], message)) {
				message.client.reply(message, 'Deleted character "' + characters[0].name + '".');
			} else {
				message.client.reply(message, 'Unable to delete character "' + characters[0].name + '". You are not the owner.');
			}
		} else if(characters.length > 1) {
			let characterList = '';
			for(const character of characters) characterList += (characterList ? ',   ' : '') + '"' + character.name.replace(/ /g, '\xa0') + '"';
			message.client.reply(message, 'Multiple characters found, please be more specific: ' + characterList);
		} else {
			message.client.reply(message, 'Unable to find character "' + matches[1] + '". Use !characters to see the list of characters.');
		}
	}
}
