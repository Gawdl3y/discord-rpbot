#!/usr/bin/env node
'use babel';
'use strict';

import graf from 'discord-graf';
import config from './config'; // eslint-disable-line no-unused-vars
import version from './version';
import { init as initDatabase, close as closeDatabase } from './database';
import * as analytics from './util/analytics';

import ListCharactersCommand from './commands/characters/list';
import ViewCharacterCommand from './commands/characters/view';
import AddCharacterCommand from './commands/characters/add';
import DeleteCharacterCommand from './commands/characters/delete';
import ClearCharactersCommand from './commands/characters/clear';
import RollDiceCommand from './commands/dice/roll';
import MaxRollCommand from './commands/dice/max';
import MinRollCommand from './commands/dice/min';

graf.createLogger();
graf.logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Set up database
initDatabase().catch(err => {
	graf.logger.error(err);
	process.exit(1);
});

// Create client
export const client = graf.createClient({
	botName: 'RPBot',
	botVersion: version,
	botAbout: `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y).\nSource code and information: https://github.com/Gawdl3y/discord-rpbot`
});
graf.checkForUpdate('https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json');
graf.registerDefaultCommands();
graf.registerCommands([
	ListCharactersCommand,
	ViewCharacterCommand,
	AddCharacterCommand,
	DeleteCharacterCommand,
	ClearCharactersCommand,
	RollDiceCommand,
	MaxRollCommand,
	MinRollCommand
]);
graf.nameGroups([
	['characters', 'Characters'],
	['dice', 'Dice']
]);

// Exit on interrupt
let interruptCount = 0;
process.on('SIGINT', async () => {
	interruptCount++;
	if(interruptCount === 1) {
		graf.logger.info('Received interrupt signal; closing database, destroying client, and exiting...');
		await Promise.all([
			closeDatabase(),
			client.destroy()
		]).catch(err => {
			graf.logger.error(err);
		});
		process.exit(0);
	} else {
		graf.logger.info('Received another interrupt signal; immediately exiting.');
		process.exit(0);
	}
});
