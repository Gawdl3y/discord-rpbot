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

	static findCharactersInServer(server) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		return this.serversMap[server];
	}

	static findCharacters(name, server) {
		if(!name) throw new Error('A name must be specified.');
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server]) return null;
		const lowercaseName = name.toLowerCase();
		const characters = this.serversMap[server].filter(element => element.name.toLowerCase().indexOf(lowercaseName) >= 0);
		for(const [index, character] of characters.entries()) {
			if(!(character instanceof Character)) characters[index] = new Character(character.name, character.info, character.owner, character.server);
		}
		return characters;
	}

	static findCharacter(name, server) {
		return this.findCharacters(name, server)[0];
	}
}
