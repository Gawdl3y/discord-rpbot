'use babel';
'use strict';

import db from './';
import storage from './local-storage';
import search from '../util/search';
import logger from '../util/logger';
import * as permissions from '../util/permissions';

const sqlFindByServer = 'SELECT * FROM characters WHERE server_id = ?';
const sqlFindByServerAndName = 'SELECT * FROM characters WHERE server_id = ? AND name = ?';
const sqlFindByServerAndNameLike = 'SELECT * FROM characters WHERE server_id = ? AND name LIKE ?';
const sqlInsert = 'INSERT INTO characters VALUES(?, ?, ?, ?)';
const sqlUpdate = 'UPDATE characters SET name = ?, info = ? WHERE server_id = ? AND name = ?';
const sqlDelete = 'DELETE FROM characters WHERE server_id = ? AND name = ?';

export default class Character {
	constructor(server, owner, name, info) {
		if(!server || !owner || !name) throw new Error('Character name, owner, and server must be specified.');
		this.server = server.id ? server.id : server;
		this.owner = owner.id ? owner.id : owner;
		this.name = name;
		this.info = info;
	}

	static async save(character) {
		if(!character) throw new Error('A character must be specified.');
		const findStmt = await db.prepare(sqlFindByServerAndName);
		const existingCharacters = await findStmt.all(character.server, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || permissions.isMod(character.server, character.owner)) {
				const updateStmt = await db.prepare(sqlUpdate);
				await updateStmt.run(character.name, character.info, character.server, existingCharacters[0].name);
				updateStmt.finalize();
				logger.info('Updated existing character.', character);
				return { character: new Character(character.server, existingCharacters[0].user_id, character.name, character.info), new: false };
			} else {
				throw new Error('Character already exists, and the owners don\'t match.');
			}
		} else {
			const insertStmt = await db.prepare(sqlInsert);
			await insertStmt.run(character.server, character.name, character.info, character.owner);
			insertStmt.finalize();
			logger.info('Added new character.', character);
			return { character: character, new: true };
		}
	}

	static async delete(character) {
		if(!character) throw new Error('A character must be specified.');
		const findStmt = await db.prepare(sqlFindByServerAndName);
		const existingCharacters = await findStmt.all(character.server, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || permissions.isMod(character.server, character.owner)) {
				const deleteStmt = await db.prepare(sqlDelete);
				await deleteStmt.run(character.server, character.name);
				deleteStmt.finalize();
				logger.info('Deleted character.', character);
				return true;
			} else {
				throw new Error('Existing character is not owned by the specified character owner.');
			}
		} else {
			throw new Error('Character doesn\'t exist.');
		}
	}

	static async findInServer(server, searchString = null, searchExact = true) {
		if(!server) throw new Error('A server must be specified.');
		server = server.id ? server.id : server;
		const findStmt = await db.prepare(searchString ? sqlFindByServerAndNameLike : sqlFindByServer);
		const characters = await findStmt.all(server, searchString ? searchString.length > 1 ? `%${searchString}%` : `${searchString}%` : undefined);
		findStmt.finalize();
		for(const [index, character] of characters.entries()) characters[index] = new Character(character.server_id, character.user_id, character.name, character.info);
		return searchExact ? search(characters, searchString, { searchInexact: false }) : characters;
	}

	static async convertStorage() {
		const storageEntry = storage.getItem('characters');
		if(!storageEntry) return;
		const baseMap = JSON.parse(storageEntry);
		if(!baseMap) return;
		const keys = Object.keys(baseMap);
		if(keys.length === 0) return;
		const characters = [];
		for(const key of keys) {
			const serverCharacters = baseMap[key];
			if(!serverCharacters || serverCharacters.length === 0) continue;
			characters.push(...serverCharacters);
		}
		if(characters.length > 0) {
			const stmt = await db.prepare(sqlInsert);
			for(const character of characters) {
				stmt.run(character.server, character.name, character.info, character.owner);
			}
			stmt.finalize();
		}
		storage.removeItem('characters');
		logger.info('Converted characters from local storage to database.', { count: characters.length });
	}
}
