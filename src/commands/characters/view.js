'use babel';
'use strict';

import database from '../../database/characters';
import disambiguation from '../../util/disambiguation';
import * as usage from '../../util/command-usage';

export default {
	name: 'character',
	aliases: ['viewcharacter', 'char'],
	group: 'characters',
	groupName: 'view',
	description: 'Views a character\'s information.',
	usage: 'character <name>',
	details: 'The name can be the whole name of the character, or just a part of it.',
	examples: ['character Billy McBillface', 'character bill'],
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
			message.reply(`Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}`);
		} else if(characters.length > 1) {
			message.reply(disambiguation(characters, 'characters'));
		} else {
			message.reply(`Unable to find character. Use ${usage.long('characters', message.server)} to view the list of characters.`);
		}
	}
};
