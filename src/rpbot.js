#!/usr/bin/env node
'use babel';
'use strict';

import { FriendlyError } from 'discord-graf';
import bot from './bot';
import config from './config';
import version from './version';
import * as db from './database';
import Character from './database/character';
import * as analytics from './util/analytics';
import DiceExpression from 'dice-expression-evaluator';
import Roll from './database/roll';

import ListCharactersCommand from './commands/characters/list';
import ViewCharacterCommand from './commands/characters/view';
import AddCharacterCommand from './commands/characters/add';
import DeleteCharacterCommand from './commands/characters/delete';
import ClearCharactersCommand from './commands/characters/clear';

import RollDiceCommand from './commands/dice/roll';
import MaxRollCommand from './commands/dice/max';
import MinRollCommand from './commands/dice/min';
import AddRollCommand from './commands/dice/add';
import ViewRollCommand from './commands/dice/view';
import ListRollsCommand from './commands/dice/list';
import DeleteRollCommand from './commands/dice/delete';
import ClearRollsCommand from './commands/dice/clear';

bot.logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Create bot
export const client = bot
	.registerDefaults()
	.registerModules([
		['characters', 'Characters'],
		['dice', 'Dice'],
		['rolls', 'Rolls']
	])
	.registerCommands([
		ListCharactersCommand,
		ViewCharacterCommand,
		AddCharacterCommand,
		DeleteCharacterCommand,
		ClearCharactersCommand,
		RollDiceCommand,
		MaxRollCommand,
		MinRollCommand,
		AddRollCommand,
		ViewRollCommand,
		ListRollsCommand,
		DeleteRollCommand,
		ClearRollsCommand
	])
	.registerEvalObjects({
		db: db,
		Character: Character,
		Roll: Roll,
		config: config,
		version: version,
		dice: DiceExpression
	})
.createClient();

// Set up command analytics
bot.dispatcher.on('commandRun', command => {
	analytics.sendEvent('Command', 'run', `${command.module}:${command.memberName}`);
}).on('commandError', (command, err) => {
	if(!(err instanceof FriendlyError)) analytics.sendException(err);
});

// Set up database
db.init().catch(err => {
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
			db.close(),
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
