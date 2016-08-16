#!/usr/bin/env node
'use babel';
'use strict';

import bot from './bot';
import config from './config'; // eslint-disable-line no-unused-vars
import version from './version';
import { init as initDatabase, close as closeDatabase } from './database';
import * as analytics from './util/analytics';

// import ListCharactersCommand from './commands/characters/list';
// import ViewCharacterCommand from './commands/characters/view';
// import AddCharacterCommand from './commands/characters/add';
// import DeleteCharacterCommand from './commands/characters/delete';
// import ClearCharactersCommand from './commands/characters/clear';
// import RollDiceCommand from './commands/dice/roll';
// import MaxRollCommand from './commands/dice/max';
// import MinRollCommand from './commands/dice/min';

bot.logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Create bot
export const client = bot.createClient();
bot.registerDefaultCommands();
bot.registerCommands([
	// ListCharactersCommand,
	// ViewCharacterCommand,
	// AddCharacterCommand,
	// DeleteCharacterCommand,
	// ClearCharactersCommand,
	// RollDiceCommand,
	// MaxRollCommand,
	// MinRollCommand
]);
bot.nameGroups([
	['characters', 'Characters'],
	['dice', 'Dice']
]);

// Set up database
initDatabase().catch(err => {
	bot.logger.error(err);
	process.exit(1);
});

// Exit on interrupt
let interruptCount = 0;
process.on('SIGINT', async () => {
	interruptCount++;
	if(interruptCount === 1) {
		bot.logger.info('Received interrupt signal; closing database, destroying client, and exiting...');
		await Promise.all([
			closeDatabase(),
			client.destroy()
		]).catch(err => {
			bot.logger.error(err);
		});
		process.exit(0);
	} else {
		bot.logger.info('Received another interrupt signal; immediately exiting.');
		process.exit(0);
	}
});
