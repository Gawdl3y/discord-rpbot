'use babel';
'use strict';

import Character from '../characters/character';
import database from '../characters/database';

export default class AddCharacterCommand {
	static get information() {
		return {
			label: 'addcharacter',
			description: 'Adds a character to the database, or updates the existing one.',
			usage: '!addcharacter "<name>" <info>',
			details: 'The character name *must* be surrounded by quotes. The information doesn\'t have to be a single line.',
			examples: ['!addcharacter "Billy McBillface" A really cool guy who enjoys his chicken tendies.']
		};
	}

	static get triggers() {
		return [
			/^!addcharacter\s+"(.+?)"\s+((?:.|\n)+?)\s*$/i
		];
	}

	static run(message, matches) {
		const character = new Character(matches[1], matches[2], message.author.id, message.server.id);
		if(database.saveCharacter(character)) {
			message.client.reply(message, 'Added/updated character "' + character.name + '".');
		} else {
			message.client.reply(message, 'Unable to update character "' + character.name + '". You are not the owner.');
		}
	}
}
