'use babel';
'use strict';

import database from '../../database/characters';
import disambiguation from '../../util/disambiguation';

export default {
	name: 'deletecharacter',
	aliases: ['removecharacter', 'delchar', 'rmchar'],
	group: 'characters',
	groupName: 'delete',
	description: 'Deletes a character from the database.',
	usage: '!deletecharacter <name>',
	details: 'The name can be the whole name of the character, or just a part of it. Only the owner of the character and administrators/moderators may delete it.',
	examples: ['!deletecharacter Billy McBillface', '!deletecharacter bill'],
	singleArgument: true,

	isRunnable(message) {
		return !!message.server;
	},

	run(message, args) {
		if(!args[0]) return false;
		const characters = database.findCharactersInServer(message.server, args[0]);
		if(characters.length === 1) {
			const permissionOverride = database.userCanModerateInServer(message.server, message.author);
			if(database.deleteCharacter(characters[0], permissionOverride)) {
				message.client.reply(message, `Deleted character "${characters[0].name}."`);
			} else {
				message.client.reply(message, `Unable to delete character "${characters[0].name}". You are not the owner.`);
			}
		} else if(characters.length > 1) {
			message.client.reply(message, disambiguation(characters, 'characters'));
		} else {
			message.client.reply(message, 'Unable to find character. Use `!characters` to see the list of characters.');
		}
	}
};
