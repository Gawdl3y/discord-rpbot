#!/usr/bin/env node
'use babel';
'use strict';

import bot from './bot';
import config from './config';
import version from './version';
import * as db from './database';
import Character from './database/character';
import * as analytics from './util/analytics';
import DiceExpression from 'dice-expression-evaluator';

import ListCharactersCommand from './commands/characters/list';
import ViewCharacterCommand from './commands/characters/view';
import AddCharacterCommand from './commands/characters/add';
import DeleteCharacterCommand from './commands/characters/delete';
import ClearCharactersCommand from './commands/characters/clear';
import RollDiceCommand from './commands/dice/roll';
import MaxRollCommand from './commands/dice/max';
import MinRollCommand from './commands/dice/min';

bot.logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Create bot
export const client = bot
	.registerDefaults()
	.registerModules([
		['characters', 'Characters'],
		['dice', 'Dice']
	])
	.registerCommands([
		ListCharactersCommand,
		ViewCharacterCommand,
		AddCharacterCommand,
		DeleteCharacterCommand,
		ClearCharactersCommand,
		RollDiceCommand,
		MaxRollCommand,
		MinRollCommand
	])
	.registerEvalObjects({
		db: db,
		Character: Character,
		config: config,
		version: version,
		dice: DiceExpression
	})
.createClient();

// Set up database
db.init().catch(err => {
	bot.logger.error(err);
	process.exit(1);
});

// Set up Carbonitex guild count updates
if(config.carbonURL) {
	const request = require('request-promise-native');
	const sendCarbon = () => {
		request({
			method: 'POST',
			uri: config.carbonURL,
			body: {
				key: config.carbonKey,
				servercount: client.guilds.size
			},
			json: true
		}).then(() => {
			bot.logger.info(`Sent guild count to Carbon with ${client.guilds.size} guilds.`);
		}).catch(err => {
			bot.logger.error('Error while sending guild count to Carbon.', err);
		});
	};
	client.once('ready', sendCarbon);
	client.on('guildCreate', sendCarbon);
	client.on('guildDelete', sendCarbon);
}

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
