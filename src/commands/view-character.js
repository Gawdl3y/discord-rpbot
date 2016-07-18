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
		const characters = database.findCharacters(matches[1], message.server.id);
		if(characters.length === 1) {
			message.client.reply(message, 'Character **' + characters[0].name + '**:' + (characters[0].info.indexOf('\n') >= 0 ? '\n' : ' ') + characters[0].info);
		} else if(characters.length > 1) {
			let characterList = '';
			for(const character of characters) characterList += (characterList ? ',   ' : '') + '"' + character.name.replace(/ /g, '\xa0') + '"';
			message.client.reply(message, 'Multiple characters found, please be more specific: ' + characterList);
		} else {
			message.client.reply(message, 'Unable to find character "' + matches[1] + '". Use !characters to see the list of characters.');
		}
	}
}
