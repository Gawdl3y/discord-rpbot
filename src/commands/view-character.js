'use babel';
'use strict';

import database from '../database/characters';
import disambiguation from '../util/disambiguation';

export default class ViewCharacterCommand {
	static get information() {
		return {
			label: 'character',
			aliases: ['viewcharacter', 'char'],
			description: 'Views a character\'s information.',
			usage: '!character <name>',
			details: 'The name can be the whole name of the character, or just a part of it.',
			examples: ['!character Billy McBillface', '!character bill']
		};
	}

	static get triggers() {
		return [
			/^!(?:character|viewcharacter|char)\s+"?(.+?)"?\s*$/i
		];
	}

	static isRunnable(message) {
		return !!message.server;
	}

	static run(message, matches) {
		const characters = database.findCharactersInServer(message.server, matches[1]);
		if(characters.length === 1) {
			const owner = message.client.users.get('id', characters[0].owner);
			const ownerName = owner ? owner.name + '#' + owner.discriminator : 'Unknown';
			message.client.reply(message, 'Character **' + characters[0].name + '** (created by ' + ownerName + '):\n' + characters[0].info);
		} else if(characters.length > 1) {
			message.client.reply(message, disambiguation(characters, 'characters'));
		} else {
			message.client.reply(message, 'Unable to find character "' + matches[1] + '". Use !characters to see the list of characters.');
		}
	}
}
