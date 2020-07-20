'use babel';
'use strict';

import bot from '../bot';
import db from './';

const sqlFindByGuild = 'SELECT CAST(server_id AS TEXT) AS server_id, name, info, CAST(user_id AS TEXT) AS user_id, tags FROM characters WHERE server_id = ?';
const sqlFindByGuildAndName = 'SELECT CAST(server_id AS TEXT) AS server_id, name, info, CAST(user_id AS TEXT) AS user_id, tags FROM characters WHERE server_id = ? AND name = ?';
const sqlFindByGuildAndNameLike = 'SELECT CAST(server_id AS TEXT) AS server_id, name, info, CAST(user_id AS TEXT) AS user_id, tags FROM characters WHERE server_id = ? AND name LIKE ?';
const sqlFindByGuildAndTagLike = 'SELECT CAST(server_id AS TEXT) AS server_id, name, info, CAST(user_id AS TEXT) AS user_id, tags FROM characters WHERE server_id = ? AND tags LIKE ?';
const sqlFindByGuildAndAuthor = 'SELECT CAST(server_id AS TEXT) AS server_id, name, info, CAST(user_id AS TEXT) AS user_id, tags FROM characters WHERE server_id = ? AND user_id = ?';
const sqlInsert = 'INSERT INTO characters VALUES(?, ?, ?, ?, ?)';
const sqlUpdate = 'UPDATE characters SET name = ?, info = ? WHERE server_id = ? AND name = ?';
const sqlDelete = 'DELETE FROM characters WHERE server_id = ? AND name = ?';
const sqlClear = 'DELETE FROM characters WHERE server_id = ?';
const sqlGetTags = 'SELECT tags FROM characters WHERE server_id = ? AND name = ?';
const sqlUpdateTags = 'UPDATE characters SET tags = ? WHERE server_id = ? AND name = ?';

export default class Character {
	constructor(guild, owner, name, info, tags) {
		if(!guild || !owner || !name) throw new Error('Character name, owner, and guild must be specified.');
		this.guild = guild.id || guild;
		this.owner = owner.id || owner;
		this.name = name;
		this.info = info;
		this.tags = tags;
	}

	static async save(character) {
		if(!character) throw new Error('A character must be specified.');
		const findStmt = await db.prepare(sqlFindByGuildAndName);
		const existingCharacters = await findStmt.all(character.guild, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || bot.permissions.isMod(character.guild, character.owner)) {
				const updateStmt = await db.prepare(sqlUpdate);
				await updateStmt.run(character.name, character.info, character.guild, existingCharacters[0].name);
				updateStmt.finalize();
				bot.logger.info('Updated existing character.', character);
				return { character: new Character(character.guild, existingCharacters[0].user_id, character.name, character.info, existingCharacters[0].tags), new: false };
			} else {
				return false;
			}
		} else {
			const insertStmt = await db.prepare(sqlInsert);
			const test = [''];
			await insertStmt.run(character.guild, character.name, character.info, character.owner, `,${test.join()},`);
			insertStmt.finalize();
			bot.logger.info('Added new character.', character);
			return { character: character, new: true };
		}
	}

	static async delete(character) {
		if(!character) throw new Error('A character must be specified.');
		const findStmt = await db.prepare(sqlFindByGuildAndName);
		const existingCharacters = await findStmt.all(character.guild, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || bot.permissions.isMod(character.guild, character.owner)) {
				const deleteStmt = await db.prepare(sqlDelete);
				await deleteStmt.run(character.guild, character.name);
				deleteStmt.finalize();
				bot.logger.info('Deleted character.', character);
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	static async addtag(character, tag) {
		if(!character) throw new Error('A character must be specified.');
		if(!tag) throw new Error('A tag must be specified.');
		const findStmt = await db.prepare(sqlFindByGuildAndName);
		const existingCharacters = await findStmt.all(character.guild, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || bot.permissions.isMod(character.guild, character.owner)) {
				const tagsStmt = await db.prepare(sqlGetTags);
				const characters = await tagsStmt.get(character.guild, existingCharacters[0].name);
				tagsStmt.finalize();
				let tagslist;
				if(characters.tags) {
					tagslist = characters.tags.split(',');
				} else {
					tagslist = [];
				}
				if(!tagslist.includes(tag)) {
					tagslist.push(tag);
					const preptag = `,${tagslist.join()},`.replace(/,+/g, ',');
					const updateStmt = await db.prepare(sqlUpdateTags);
					await updateStmt.run(preptag, character.guild, existingCharacters[0].name);
					updateStmt.finalize();
					bot.logger.info('Added tag to character.', character);
					return true;
				} else {
					bot.logger.info('Tag already exists on character.', character);
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	static async deltag(character, tag) {
		if(!character) throw new Error('A character must be specified.');
		if(!tag) throw new Error('A tag must be specified.');
		const findStmt = await db.prepare(sqlFindByGuildAndName);
		const existingCharacters = await findStmt.all(character.guild, character.name);
		findStmt.finalize();
		if(existingCharacters.length > 1) throw new Error('Multiple existing characters found.');
		if(existingCharacters.length === 1) {
			if(existingCharacters[0].user_id === character.owner || bot.permissions.isMod(character.guild, character.owner)) {
				const tagsStmt = await db.prepare(sqlGetTags);
				const characters = await tagsStmt.get(character.guild, existingCharacters[0].name);
				tagsStmt.finalize();
				const tagslist = characters.tags.split(',');
				if(tagslist.includes(tag)) {
					delete tagslist[tagslist.indexOf(tag)];
					tagslist.filter(item => !!item);
					// commas need to be added to start and end to make sure tags can be cearched on a per tag basis
					const preptag = `,${tagslist.join()},`.replace(/,+/g, ',');
					const updateStmt = await db.prepare(sqlUpdateTags);
					await updateStmt.run(preptag, character.guild, existingCharacters[0].name);
					updateStmt.finalize();
					bot.logger.info('Removed tag to character.', character);
					return true;
				} else {
					bot.logger.info('Tag does not exists on character.', character);
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	static async clearGuild(guild) {
		if(!guild) throw new Error('A guild must be specified.');
		const clearStmt = await db.prepare(sqlClear);
		await clearStmt.run(guild.id);
		clearStmt.finalize();
		bot.logger.info('Cleared characters.', { guild: guild.name, guildID: guild.id });
	}

	static async findInGuild(guild, searchString = null, searchExact = true) {
		if(!guild) throw new Error('A guild must be specified.');
		guild = guild.id ? guild.id : guild;
		const findStmt = await db.prepare(searchString ? sqlFindByGuildAndNameLike : sqlFindByGuild);
		const characters = await findStmt.all(guild, searchString ? searchString.length > 1 ? `%${searchString}%` : `${searchString}%` : undefined);
		findStmt.finalize();
		for(const [index, character] of characters.entries()) characters[index] = new Character(character.server_id, character.user_id, character.name, character.info, character.tags);
		return searchExact ? bot.util.search(characters, searchString, { searchInexact: false }) : characters;
	}

	static async findInGuildViaTags(guild, searchString = null, searchExact = true) {
		if(!guild) throw new Error('A guild must be specified.');
		guild = guild.id ? guild.id : guild;
		const findStmt = await db.prepare(searchString ? sqlFindByGuildAndTagLike : sqlFindByGuild);
		const characters = await findStmt.all(guild, searchString ? searchString.length > 1 ? `%${searchString}%` : `${searchString}%` : undefined);
		findStmt.finalize();
		for(const [index, character] of characters.entries()) characters[index] = new Character(character.server_id, character.user_id, character.name, character.info, character.tags);
		return searchExact ? bot.util.search(characters, searchString, { searchInexact: false }) : characters;
	}

	static async findAuthorInGuild(guild, searchString = null, searchExact = true) {
		if(!guild) throw new Error('A guild must be specified.');
		guild = guild.id ? guild.id : guild;
		const findStmt = await db.prepare(searchString ? sqlFindByGuildAndAuthor : sqlFindByGuild);
		const characters = await findStmt.all(guild, searchString ? searchString : undefined);
		findStmt.finalize();
		for(const [index, character] of characters.entries()) characters[index] = new Character(character.server_id, character.user_id, character.name, character.info, character.tags);
		return searchExact ? bot.util.search(characters, searchString, { searchInexact: false }) : characters;
	}

	static async convertStorage() {
		const storageEntry = bot.localStorage.getItem('characters');
		if(!storageEntry) return;
		const baseMap = JSON.parse(storageEntry);
		if(!baseMap) return;
		const keys = Object.keys(baseMap);
		if(keys.length === 0) return;
		const characters = [];
		for(const key of keys) {
			const guildCharacters = baseMap[key];
			if(!guildCharacters || guildCharacters.length === 0) continue;
			characters.push(...guildCharacters);
		}
		if(characters.length > 0) {
			const stmt = await db.prepare(sqlInsert);
			for(const character of characters) {
				stmt.run(character.guild, character.name, character.info, character.owner);
			}
			stmt.finalize();
		}
		bot.localStorage.removeItem('characters');
		bot.logger.info('Converted characters from local storage to database.', { count: characters.length });
	}
}
