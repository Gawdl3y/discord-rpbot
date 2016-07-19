'use babel';
'use strict';

import { LocalStorage } from 'node-localstorage';
import Character from './character';
import config from '../config';
import logger from '../logger';

export const storage = new LocalStorage(config.storage);

export default class CharacterDatabase {
	static loadDatabase() {
		this.serversMap = JSON.parse(storage.getItem('characters'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		logger.debug('Saving database...', this.serversMap);
		storage.setItem('characters', JSON.stringify(this.serversMap));
	}

	static saveCharacter(character) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) this.serversMap[character.server] = [];
		const serverCharacters = this.serversMap[character.server];

		const characterIndex = serverCharacters.findIndex(element => element.name === character.name);
		if(characterIndex >= 0) {
			if(character.owner === serverCharacters[characterIndex].owner) {
				serverCharacters[characterIndex] = character;
				logger.info('Updated existing character.', { character: character });
			} else {
				logger.info('Not updating existing character, because the owner isn\'t the original owner.', { character: character, original: serverCharacters[characterIndex] });
				return false;
			}
		} else {
			serverCharacters.push(character);
			logger.info('Added new character.', { character: character });
		}

		this.saveDatabase();
		return true;
	}

	static deleteCharacter(character) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) return false;
		const serverCharacters = this.serversMap[character.server];

		const characterIndex = serverCharacters.findIndex(element => element.name === character.name);
		if(characterIndex >= 0) {
			if(character.owner === serverCharacters[characterIndex].owner) {
				serverCharacters.splice(characterIndex, 1);
				logger.info('Removed character.', { character: character });
			} else {
				logger.info('Not removing character, because the owner isn\'t the original owner.', { character: character, original: serverCharacters[characterIndex] });
				return false;
			}
		} else {
			logger.info('Not removing character, because it doesn\'t exist.', { character: character });
			return false;
		}

		this.saveDatabase();
		return true;
	}

	static findCharactersInServer(server, search = null) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server]) return [];
		let characters;

		if(search) {
			const lowercaseSearch = search.toLowerCase();

			// Find all characters that match the search string
			if(search.length === 1) {
				characters = this.serversMap[server].filter(element => element.name.toLowerCase().startsWith(lowercaseSearch));
			} else {
				characters = this.serversMap[server].filter(element => element.name.toLowerCase().includes(lowercaseSearch));
			}

			// See if one of the characters is an exact match
			if(characters.length > 1) {
				const character = characters.find(element => element.name.toLowerCase() === lowercaseSearch);
				if(character) characters = [character];
			}
		} else {
			characters = this.serversMap[server];
		}

		// Make sure they're all Character instances
		for(const [index, character] of characters.entries()) {
			if(!(character instanceof Character)) characters[index] = new Character(character.name, character.info, character.owner, character.server);
		}

		return characters;
	}

	static findCharacterInServer(server, search) {
		const characters = this.findCharacters(server, search);
		return characters.length > 0 ? characters[0] : null;
	}
}
