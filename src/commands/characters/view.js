'use babel';
'use strict';

import Character from '../../database/character';
import disambiguation from '../../util/disambiguation';
import usage from '../../util/command-usage';
import CommandFormatError from '../../util/errors/command-format';

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

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const characters = await Character.findInServer(message.server, args[0]);
		if(characters.length === 1) {
			const owner = message.client.users.get('id', characters[0].owner);
			const ownerName = owner ? `${owner.name}#${owner.discriminator}` : 'Unknown';
			return `Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}`;
		} else if(characters.length > 1) {
			return disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${usage('characters', message.server)} to view the list of characters.`;
		}
	}
};
