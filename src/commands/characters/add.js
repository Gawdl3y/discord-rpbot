'use babel';
'use strict';

import Character from '../../database/character';
import database from '../../database/characters';

const mentionsPattern = /@everyone|@here|<@&?[0-9]+>/i;

export default class AddCharacterCommand {
	static get information() {
		return {
			label: 'addcharacter',
			aliases: ['addchar'],
			description: 'Adds a character to the database, or updates the existing one.',
			usage: '!addcharacter "<name>" <info>',
			details: 'The character name *must* be surrounded by quotes, and can be a maximum of 60 characters long. The information doesn\'t have to be a single line. Only the owner of the character and administrators/moderators may update it.',
			examples: ['!addcharacter "Billy McBillface" A really cool guy who enjoys his chicken tendies.']
		};
	}

	static get triggers() {
		return [
			/^!(?:addcharacter|addchar)\s+"\s*(.+?)\s*"\s+((?:.|\n)+?)\s*$/i
		];
	}

	static isRunnable(message) {
		return !!message.server;
	}

	static run(message, matches) {
		if(mentionsPattern.test(matches[1]) || mentionsPattern.test(matches[2])) {
			message.client.reply(message, 'Please do not use mentions in your character name or information.');
			return;
		}
		if(matches[1].length > 60) {
			message.client.reply(message, 'A character\'s name may not be longer than 60 characters.');
			return;
		}

		const character = new Character(matches[1], matches[2], message.author.id, message.server.id);
		const permissionOverride = database.userCanModerateInServer(message.server, message.author);
		const result = database.saveCharacter(character, permissionOverride);
		if(result) {
			message.client.reply(message, (result === 1 ? 'Added' : 'Updated') + ' character "' + character.name + '".');
		} else {
			message.client.reply(message, 'Unable to update character "' + character.name + '". You are not the owner.');
		}
	}
}
