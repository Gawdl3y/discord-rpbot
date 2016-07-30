'use babel';
'use strict';

import yargs from 'yargs';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

const config = yargs
	.usage('$0 [args]')

	// Authentication
	.option('token', {
		type: 'string',
		alias: 't',
		describe: 'API token for the bot account'
	})
	.option('email', {
		type: 'string',
		alias: 'e',
		describe: 'Email of the Discord account for the bot to use'
	})
	.option('password', {
		type: 'string',
		alias: 'p',
		describe: 'Password of the Discord account for the bot to use'
	})

	// Storage
	.option('storage', {
		type: 'string',
		default: 'rpbot-storage',
		alias: 's',
		describe: 'Path to storage directory'
	})

	// discord.js
	.option('auto-reconnect', {
		type: 'boolean',
		default: true,
		alias: ['reconnect', 'r', 'ar'],
		describe: 'Whether or not the bot should automatically reconnect when disconnected'
	})

	// General
	.option('owner', {
		type: 'string',
		describe: 'Discord user ID of the bot owner'
	})
	.option('pagination-items', {
		type: 'number',
		default: 15,
		describe: 'Number of items per page in paginated commands'
	})
	.option('update-check', {
		type: 'number',
		default: 60,
		describe: 'How frequently to check for an update (in minutes, use 0 to disable)'
	})
	.option('analytics', {
		type: 'boolean',
		default: true,
		describe: 'Whether or not to enable anonymous, non-unique, non-identifiable analytics'
	})

	// Logging
	.option('log', {
		type: 'string',
		default: 'rpbot.log',
		alias: 'l',
		describe: 'Path to log file'
	})
	.option('log-max-size', {
		type: 'number',
		default: 5242880,
		alias: 'lms',
		describe: 'Maximum size of single log file'
	})
	.option('log-max-files', {
		type: 'number',
		default: 5,
		alias: 'lmf',
		describe: 'Maximum amount of log files to keep'
	})
	.option('log-level', {
		type: 'string',
		default: 'info',
		alias: 'll',
		describe: 'Log level to output to the log file (error, warn, info, verbose, debug)'
	})
	.option('console-level', {
		type: 'string',
		default: 'info',
		alias: 'clv',
		describe: 'Log level to output to the console (error, warn, info, verbose, debug)'
	})

	// General yargs
	.config('config', (configFile) => {
		const extension = path.extname(configFile).toLowerCase();
		if(extension === '.json')
			return JSON.parse(fs.readFileSync(configFile));
		else if(extension === '.yml' || extension == '.yaml')
			return YAML.safeLoad(fs.readFileSync(configFile));
		throw new Error('Unknown config file type.');
	})
	.alias('config', 'c')
	.describe('config', 'Path to JSON/YAML config file')
	.help()
	.alias('help', 'h')
	.wrap(yargs.terminalWidth())
.argv;

export default config;
