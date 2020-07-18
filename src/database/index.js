'use babel';
'use strict';

import { join as pathJoin } from 'path';
import sqlite from 'sqlite';
import bot from '../bot';
import config from '../config';
import Character from './character';

export const db = sqlite;
export default db;

export async function init() {
	bot.logger.info('Initializing database...', { file: config.database, verbose: config.databaseVerbose });
	await db.open(config.database, { verbose: config.databaseVerbose });
	// add tags to database if it dosn't exist
	await db.prepare('SELECT tags FROM characters').catch((error) => {
		if(error) {
			db.exec('ALTER TABLE characters ADD tags TEXT COLLATE NOCASE');
		}
	});
	await db.migrate({ migrationsPath: pathJoin(__dirname, '../../migrations') });
	await Promise.all([
		Character.convertStorage()
	]);
	bot.logger.info('Database initialized.');
}

export async function close() {
	bot.logger.info('Closing database...');
	await db.close();
	bot.logger.info('Database closed.');
}
