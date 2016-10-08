'use babel';
'use strict';

import bot from '../bot';
import db from './';

const sqlFindByGuild = 'SELECT CAST(server_id AS TEXT) AS server_id, name, expression, CAST(user_id AS TEXT) AS user_id FROM rolls WHERE server_id = ?';
const sqlFindByGuildAndNameAndOwner = 'SELECT CAST(server_id AS TEXT) AS server_id, name, expression, CAST(user_id AS TEXT) AS user_id FROM rolls WHERE server_id = ? AND name = ? AND user_id = ?';
const sqlFindByGuildAndNameLike = 'SELECT CAST(server_id AS TEXT) AS server_id, name, expression, CAST(user_id AS TEXT) AS user_id FROM rolls WHERE server_id = ? AND name LIKE ?';
const sqlFindByGuildAndNameLikeAndOwner = 'SELECT CAST(server_id AS TEXT) AS server_id, name, expression, CAST(user_id AS TEXT) AS user_id FROM rolls WHERE server_id = ? AND name LIKE ? AND user_id = ?';
const sqlInsert = 'INSERT INTO rolls VALUES(?, ?, ?, ?)';
const sqlUpdate = 'UPDATE rolls SET name = ?, expression = ? WHERE server_id = ? AND name = ?';
const sqlDelete = 'DELETE FROM rolls WHERE server_id = ? AND name = ? AND user_id = ?';
const sqlClear = 'DELETE FROM rolls WHERE server_id = ?';

export default class Roll {
	constructor(guild, owner, name, expression) {
		if(!owner || !name) throw new Error('Roll name, owner, and guild must be specified.');
		this.guild = (guild && guild.id) || guild || '';
		this.owner = owner.id || owner;
		this.name = name;
		this.expression = expression;
	}

	static async save(roll) {
		if(!roll) throw new Error('A roll must be specified.');
		const findStmt = await db.prepare(sqlFindByGuildAndNameAndOwner);
		const existingRolls = await findStmt.all(roll.guild, roll.name, roll.owner);
		findStmt.finalize();
		if(existingRolls.length > 1) throw new Error('Multiple existing rolls found.');
		if(existingRolls.length === 1) {
			if(existingRolls[0].user_id === roll.owner || bot.permissions.isMod(roll.guild, roll.owner)) {
				const updateStmt = await db.prepare(sqlUpdate);
				await updateStmt.run(roll.name, roll.expression, roll.guild, existingRolls[0].name);
				updateStmt.finalize();
				bot.logger.info('Updated existing roll.', roll);
				return { roll: new Roll(roll.guild, existingRolls[0].user_id, roll.name, roll.expression), new: false };
			} else {
				return false;
			}
		} else {
			const insertStmt = await db.prepare(sqlInsert);
			await insertStmt.run(roll.guild, roll.name, roll.expression, roll.owner);
			insertStmt.finalize();
			bot.logger.info('Added new roll.', roll);
			return { roll: roll, new: true };
		}
	}

	// As Rolls are both Guild and User specific, we have to be passed the command caller to be able to check for Mod permissions correctly
	static async delete(roll, caller) {
		if(!roll) throw new Error('A roll must be specified.');
		if(!caller) caller = roll.owner;
		const findStmt = await db.prepare(sqlFindByGuildAndNameAndOwner);
		const existingRolls = await findStmt.all(roll.guild, roll.name, roll.owner);
		findStmt.finalize();
		if(existingRolls.length > 1) throw new Error('Multiple existing rolls found.');
		if(existingRolls.length === 1) {
			if(existingRolls[0].user_id === caller || bot.permissions.isMod(roll.guild, caller)) {
				const deleteStmt = await db.prepare(sqlDelete);
				await deleteStmt.run(roll.guild, roll.name, roll.owner);
				deleteStmt.finalize();
				bot.logger.info('Deleted roll.', roll);
				return true;
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
		bot.logger.info('Cleared rolls.', { guild: guild.name, guildID: guild.id });
	}

	static async findInGuild(guild, searchString = null, searchExact = true) {
		if(!guild) throw new Error('A guild must be specified.');
		guild = guild.id ? guild.id : guild;
		const findStmt = await db.prepare(searchString ? sqlFindByGuildAndNameLike : sqlFindByGuild);
		const rolls = await findStmt.all(guild, searchString ? searchString.length > 1 ? `%${searchString}%` : `${searchString}%` : undefined);
		findStmt.finalize();
		for(const [index, roll] of rolls.entries()) rolls[index] = new Roll(roll.server_id, roll.user_id, roll.name, roll.expression);
		return searchExact ? bot.util.search(rolls, searchString, { searchInexact: false }) : rolls;
	}

	static async findInGuildForOwner(guild, owner, searchString = null, searchExact = true) {
		if(!guild) throw new Error('A guild must be specified.');
		guild = guild.id ? guild.id : guild;
		owner = owner.id ? owner.id : owner;
		const findStmt = await db.prepare(searchString ? sqlFindByGuildAndNameLikeAndOwner : sqlFindByGuild);
		const rolls = await findStmt.all(guild, searchString ? searchString.length > 1 ? `%${searchString}%` : `${searchString}%` : undefined, owner);
		findStmt.finalize();
		for(const [index, roll] of rolls.entries()) rolls[index] = new Roll(roll.server_id, roll.user_id, roll.name, roll.expression);
		return searchExact ? bot.util.search(rolls, searchString, { searchInexact: false }) : rolls;
	}

	static async convertStorage() {
		bot.logger.info('Converting storage for rolls');
		const storageEntry = bot.localStorage.getItem('rolls');
		if(!storageEntry) return;
		const baseMap = JSON.parse(storageEntry);
		if(!baseMap) return;
		const keys = Object.keys(baseMap);
		if(keys.length === 0) return;
		const rolls = [];
		for(const key of keys) {
			const guildRolls = baseMap[key];
			if(!guildRolls || guildRolls.length === 0) continue;
			rolls.push(...guildRolls);
		}
		if(rolls.length > 0) {
			const stmt = await db.prepare(sqlInsert);
			for(const roll of rolls) {
				stmt.run(roll.guild, roll.name, roll.expression, roll.owner);
			}
			stmt.finalize();
		}
		bot.localStorage.removeItem('rolls');
		bot.logger.info('Converted rolls from local storage to database.', { count: rolls.length });
	}
}
