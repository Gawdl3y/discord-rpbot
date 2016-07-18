'use babel';
'use strict';

import database from '../characters/database';

export default class ViewCharacterCommand {
	static get information() {
		return {
			label: 'character',
			description: 'Views a character\'s information.',
			usage: '!character <name>',
			examples: ['!character Billy McBillface']
		};
	}

	static get triggers() {
		return [
			/^!character\s+"?(.+?)"?\s*$/i
		];
	}

	static run(message, matches) {
		const character = database.findCharacter(matches[1], message.server.id);
		if(character) {
			message.client.reply(message, 'Character **' + character.name + '**:' + (character.info.indexOf('\n') >= 0 ? '\n' : ' ') + character.info);
		} else {
			message.client.reply(message, 'Unable to find character "' + matches[1] + '". Use !characters to see the list of characters.');
		}
	}
}
