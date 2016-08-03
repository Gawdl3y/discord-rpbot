'use babel';
'use strict';

import { join as pathJoin } from 'path';
import sqlite from 'sqlite';
import Character from './character';
import config from '../config';
import logger from '../util/logger';

export const db = sqlite;
export default db;

export async function init() {
	logger.info('Initializing database...', { file: config.database, verbose: config.databaseVerbose });
	await db.open(config.database, { verbose: config.databaseVerbose });
	await db.migrate({ migrationsPath: pathJoin(__dirname, '../../migrations') });
	await Promise.all([
		Character.convertStorage()
	]);
	logger.info('Database initialized.');
}

export async function close() {
	logger.info('Closing database...');
	await db.close();
	logger.info('Database closed.');
}
