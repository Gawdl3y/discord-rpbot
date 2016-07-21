'use babel';
'use strict';

import Character from '../characters/character';
import database from '../characters/database';

const disallowedPattern = /@everyone|@here|<@&?[0-9]+>/i;

export default class AddCharacterCommand {
	static get information() {
		return {
			label: 'addcharacter',
			aliases: ['addchar'],
			description: 'Adds a character to the database, or updates the existing one.',
			usage: '!addcharacter "<name>" <info>',
			details: 'The character name *must* be surrounded by quotes. The information doesn\'t have to be a single line. Only the owner of the character and users with the "manage messages" permission may update it.',
			examples: ['!addcharacter "Billy McBillface" A really cool guy who enjoys his chicken tendies.']
		};
	}

	static get triggers() {
		return [
			/^!(?:addcharacter|addchar)\s+"(.+?)"\s+((?:.|\n)+?)\s*$/i
		];
	}

	static isRunnable(message) {
		return !!message.server;
	}

	static run(message, matches) {
		if(disallowedPattern.test(matches[1]) || disallowedPattern.test(matches[2])) {
			message.client.reply(message, 'Please do not use mentions in your character name or information.');
			return;
		}

		const character = new Character(matches[1], matches[2], message.author.id, message.server.id);
		const permissionOverride = message.server.rolesOfUser(message.author).some(role => role.hasPermission('manageMessages') || role.hasPermission('administrator'));
		if(database.saveCharacter(character, permissionOverride)) {
			message.client.reply(message, 'Saved character "' + character.name + '".');
		} else {
			message.client.reply(message, 'Unable to update character "' + character.name + '". You are not the owner.');
		}
	}
}
