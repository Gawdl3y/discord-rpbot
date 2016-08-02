'use babel';
'use strict';

import Character from '../../database/character';
import disambiguation from '../../util/disambiguation';
import * as usage from '../../util/command-usage';
import CommandFormatError from '../../util/errors/command-format';

export default {
	name: 'deletecharacter',
	aliases: ['removecharacter', 'delchar', 'rmchar'],
	group: 'characters',
	groupName: 'delete',
	description: 'Deletes a character from the database.',
	usage: 'deletecharacter <name>',
	details: 'The name can be the whole name of the character, or just a part of it. Only the owner of the character and administrators/moderators may delete it.',
	examples: ['deletecharacter Billy McBillface', 'deletecharacter bill'],
	singleArgument: true,

	isRunnable(message) {
		return !!message.server;
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const characters = await Character.findInServer(message.server, args[0]);
		if(characters.length === 1) {
			if(await Character.delete(characters[0])) {
				message.reply(`Deleted character "${characters[0].name}".`);
			} else {
				message.reply(`Unable to delete character "${characters[0].name}". You are not the owner.`);
			}
		} else if(characters.length > 1) {
			message.reply(disambiguation(characters, 'characters'));
		} else {
			message.reply(`Unable to find character. Use ${usage.long('characters', message.server)} to view the list of characters.`);
		}
	}
};
