'use babel';
'use strict';

import database from '../../database/characters';
import disambiguation from '../../util/disambiguation';

export default {
	name: 'character',
	aliases: ['viewcharacter', 'char'],
	group: 'characters',
	groupName: 'view',
	description: 'Views a character\'s information.',
	usage: '!character <name>',
	details: 'The name can be the whole name of the character, or just a part of it.',
	examples: ['!character Billy McBillface', '!character bill'],
	singleArgument: true,

	isRunnable(message) {
		return !!message.server;
	},

	run(message, args) {
		if(!args[0]) return false;
		const characters = database.findCharactersInServer(message.server, args[0]);
		if(characters.length === 1) {
			const owner = message.client.users.get('id', characters[0].owner);
			const ownerName = owner ? owner.name + '#' + owner.discriminator : 'Unknown';
			message.client.reply(message, `Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}`);
		} else if(characters.length > 1) {
			message.client.reply(message, disambiguation(characters, 'characters'));
		} else {
			message.client.reply(message, 'Unable to find character. Use `!characters` to view the list of characters.');
		}
	}
};
