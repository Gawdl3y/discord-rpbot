'use babel';
'use strict';

import Character from '../../database/character';
import database from '../../database/characters';

const mentionsPattern = /@everyone|@here|<@!?&?[0-9]+>/i;

export default {
	name: 'addcharacter',
	aliases: ['addchar'],
	group: 'characters',
	groupName: 'add',
	description: 'Adds a character to the database, or updates the existing one.',
	usage: 'addcharacter <name> <info>',
	details: 'The character name can be a maximum of 60 characters long. Both the name and information must be surrouned by quotes if they contain spaces. The information doesn\'t have to be a single line. Only the owner of the character and administrators/moderators may update it.',
	examples: ['!addcharacter "Billy McBillface" A really cool guy who enjoys his chicken tendies.'],

	isRunnable(message) {
		return !!message.server;
	},

	run(message, args) {
		if(!args[0] || !args[1]) return false;
		if(mentionsPattern.test(args[0]) || mentionsPattern.test(args[1])) {
			message.client.reply(message, 'Please do not use mentions in your character name or information.');
			return;
		}
		if(args[0].length > 60) {
			message.client.reply(message, 'A character\'s name may not be longer than 60 characters.');
			return;
		}
		if(args[0].includes('\n')) {
			message.client.reply(message, 'A character\'s name may not have multiple lines.');
			return;
		}

		const character = new Character(args[0], args[1], message.author.id, message.server.id);
		const permissionOverride = database.userCanModerateInServer(message.server, message.author);
		const result = database.saveCharacter(character, permissionOverride);
		if(result) {
			message.client.reply(message, `${result === 1 ? 'Added' : 'Updated'} character "${character.name}".`);
		} else {
			message.client.reply(message, `Unable to update character "${character.name}". You are not the owner.`);
		}
	}
};
