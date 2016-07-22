'use babel';
'use strict';

import Character from './character';
import ModRolesDatabase from './mod-roles';
import storage from './local-storage';
import search from '../util/search';
import logger from '../util/logger';

export default class CharacterDatabase {
	static loadDatabase() {
		this.serversMap = JSON.parse(storage.getItem('characters'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		logger.debug('Saving characters database...', this.serversMap);
		storage.setItem('characters', JSON.stringify(this.serversMap));
	}

	static saveCharacter(character, allowNonOwner = false) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) this.serversMap[character.server] = [];
		const serverCharacters = this.serversMap[character.server];

		const normalizedName = character.name.normalize('NFKD').toLowerCase();
		logger.debug(normalizedName);
		const characterIndex = serverCharacters.findIndex(element => element.name.normalize('NFKD').toLowerCase() === normalizedName);
		if(characterIndex >= 0) {
			if(allowNonOwner || character.owner === serverCharacters[characterIndex].owner) {
				character.owner = serverCharacters[characterIndex].owner;
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

	static deleteCharacter(character, allowNonOwner = false) {
		if(!character) throw new Error('A character must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[character.server]) return false;
		const serverCharacters = this.serversMap[character.server];

		const characterIndex = serverCharacters.findIndex(element => element.name === character.name);
		if(characterIndex >= 0) {
			if(allowNonOwner || character.owner === serverCharacters[characterIndex].owner) {
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

	static findCharactersInServer(server, searchString = null) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server.id]) return [];
		let characters;

		if(search) {
			characters = search(this.serversMap[server.id], searchString, true);
		} else {
			characters = this.serversMap[server.id];
		}

		// Make sure they're all Character instances
		for(const [index, character] of characters.entries()) {
			if(!(character instanceof Character)) characters[index] = new Character(character.name, character.info, character.owner, character.server);
		}

		return characters;
	}

	static userCanModerateInServer(server, user) {
		if(!user) throw new Error('A user must be specified.');
		const userRoles = server.rolesOfUser(user);
		if(userRoles.some(role => role.hasPermission('administrator'))) return true;
		if(!ModRolesDatabase.serverHasRoles(server)) return userRoles.some(role => role.hasPermission('manageMessages'));
		return ModRolesDatabase.findRolesInServer(server).some(element => userRoles.some(element2 => element.id === element2.id));
	}
}
