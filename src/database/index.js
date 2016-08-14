'use babel';
'use strict';

import graf from 'discord-graf';
import { join as pathJoin } from 'path';
import sqlite from 'sqlite';
import Character from './character';
import config from '../config';

export const db = sqlite;
export default db;

export async function init() {
	graf.logger.info('Initializing database...', { file: config.database, verbose: config.databaseVerbose });
	await db.open(config.database, { verbose: config.databaseVerbose });
	await db.migrate({ migrationsPath: pathJoin(__dirname, '../../migrations') });
	await Promise.all([
		Character.convertStorage()
	]);
	graf.logger.info('Database initialized.');
}

export async function close() {
	graf.logger.info('Closing database...');
	await db.close();
	graf.logger.info('Database closed.');
}
