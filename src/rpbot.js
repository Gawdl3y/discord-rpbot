#!/usr/bin/env node
'use babel';
'use strict';

import config from './config';
import Discord from 'discord.js';
import version from './version';
import { init as initDatabase, close as closeDatabase } from './database';
import { handleMessage } from './commands/dispatcher';
import logger from './util/logger';
import checkForUpdate from './util/update-check';
import * as analytics from './util/analytics';

logger.info(`RPBot v${version} is starting...`);
analytics.sendEvent('Bot', 'started');

// Output safe config
const debugConfig = Object.assign({}, config);
if(debugConfig.email) debugConfig.email = '--snip--';
if(debugConfig.password) debugConfig.password = '--snip--';
if(debugConfig.token) debugConfig.token = '--snip--';
for(const key of Object.keys(debugConfig)) if(key.length === 1 || key.includes('-')) delete debugConfig[key];
logger.debug('Configuration:', debugConfig);

// Verify that the credentials are usable
if(!config.token && (!config.email || !config.password)) {
	logger.error('Invalid credentials; either "token" or both "email" and "password" must be specified.');
	process.exit(1);
}

// Set up database
initDatabase().catch(err => {
	logger.error(err);
	process.exit(1);
});

// Create client
const clientOptions = { autoReconnect: config.autoReconnect, forceFetchUsers: true, disableEveryone: true };
export const client = new Discord.Client(clientOptions);
logger.info('Client created.', clientOptions);
client.on('error', err => { logger.error(err); });
client.on('warn', err => { logger.warn(err); });
client.on('debug', err => { logger.debug(err); });
client.on('disconnected', () => { logger.error('Disconnected.'); });
client.on('ready', () => {
	logger.info(`Bot is ready; logged in as ${client.user.username}#${client.user.discriminator} (ID: ${client.user.id})`);
	checkForUpdate();
	if(config.updateCheck > 0) setInterval(checkForUpdate, config.updateCheck * 60 * 1000);
	if(config.playingGame) client.setPlayingGame(config.playingGame);
});

// Set up command handling
export const serverCommandPatterns = {};
export const unprefixedCommandPattern = /^([^\s]+)/i;
client.on('message', message => {
	if(message.author.equals(client.user)) return;
	handleMessage(message).catch(err => { logger.error(err); });
});
client.on('messageUpdated', (oldMessage, newMessage) => {
	if(newMessage.author.equals(client.user)) return;
	handleMessage(newMessage, oldMessage).catch(err => { logger.error(err); });
});

// Log in
const loginCallback = err => { if(err) logger.error('Failed to login.', err); };
if(config.token) {
	logger.info('Logging in with token...');
	client.loginWithToken(config.token, config.email, config.password, loginCallback);
} else {
	logger.info('Logging in with email and password...');
	client.login(config.email, config.password, loginCallback);
}

// Exit on interrupt
let interruptCount = 0;
process.on('SIGINT', async () => {
	interruptCount++;
	if(interruptCount === 1) {
		logger.info('Received interrupt signal; closing database, destroying client, and exiting...');
		await Promise.all([
			closeDatabase(),
			client.destroy()
		]).catch(err => {
			logger.error(err);
		});
		process.exit(0);
	} else {
		logger.info('Received another interrupt signal; immediately exiting.');
		process.exit(0);
	}
});
