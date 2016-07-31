'use babel';
'use strict';

import Character from './character';
import storage from './local-storage';
import search from '../util/search';
import logger from '../util/logger';
import * as permissions from '../util/permissions';

export default class CharacterDatabase {
	static loadDatabase() {
		this.serversMap = JSON.parse(storage.getItem('characters'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		logger.debug('Saving characters database...', this.serversMap);
		storage.setItem('characters', JSON.stringify(this.serversMap));
	}

	static saveCharacter(character) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) this.serversMap[character.server] = [];
		const serverCharacters = this.serversMap[character.server];

		const normalizedName = character.name.normalize('NFKD').toLowerCase();
		const characterIndex = serverCharacters.findIndex(element => element.name.normalize('NFKD').toLowerCase() === normalizedName);
		if(characterIndex >= 0) {
			if(character.owner === serverCharacters[characterIndex].owner || permissions.isModerator(character.server, character.owner)) {
				character.owner = serverCharacters[characterIndex].owner;
				serverCharacters[characterIndex] = character;
				logger.info('Updated existing character.', character);
				this.saveDatabase();
				return 2;
			} else {
				logger.info('Not updating existing character, because the owner isn\'t the original owner.', { character: character, original: serverCharacters[characterIndex] });
				return 0;
			}
		} else {
			serverCharacters.push(character);
			logger.info('Added new character.', character);
			this.saveDatabase();
			return 1;
		}
	}

	static deleteCharacter(character) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) return false;
		const serverCharacters = this.serversMap[character.server];

		const characterIndex = serverCharacters.findIndex(element => element.name === character.name);
		if(characterIndex >= 0) {
			if(character.owner === serverCharacters[characterIndex].owner || permissions.isModerator(character.server, character.owner)) {
				serverCharacters.splice(characterIndex, 1);
				logger.info('Removed character.', character);
			} else {
				logger.info('Not removing character, because the owner isn\'t the original owner.', { character: character, original: serverCharacters[characterIndex] });
				return false;
			}
		} else {
			logger.info('Not removing character, because it doesn\'t exist.', character);
			return false;
		}

		this.saveDatabase();
		return true;
	}

	static findCharactersInServer(server, searchString = null, searchExact = true) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server.id]) return [];

		const characters = search(this.serversMap[server.id], searchString, { useStartsWith: true, searchExact: searchExact });

		// Make sure they're all Character instances
		for(const [index, character] of characters.entries()) {
			if(!(character instanceof Character)) characters[index] = new Character(character.server, character.owner, character.name, character.info);
		}

		return characters;
	}
}
