'use babel';
'use strict';

import yargs from 'yargs';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

const config = yargs
	.usage('$0 [options]')

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
	.implies({ email: 'password', password: 'email' })

	// General
	.option('owner', {
		type: 'string',
		alias: 'o',
		describe: 'Discord user ID of the bot owner'
	})
	.option('command-prefix', {
		type: 'string',
		default: '!',
		alias: 'P',
		describe: 'Default command prefix (blank to use only mentions)'
	})
	.option('unknown-only-mention', {
		type: 'boolean',
		alias: 'M',
		describe: 'Whether or not to output unknown command response only for mentions'
	})
	.option('pagination-items', {
		type: 'number',
		default: 15,
		alias: 'I',
		describe: 'Number of items per page in paginated commands'
	})
	.option('update-check', {
		type: 'number',
		default: 60,
		alias: 'U',
		describe: 'How frequently to check for an update (in minutes, use 0 to disable)'
	})
	.option('analytics', {
		type: 'boolean',
		default: true,
		alias: 'A',
		describe: 'Whether or not to enable anonymous, non-unique, non-identifiable analytics'
	})

	// discord.js
	.option('auto-reconnect', {
		type: 'boolean',
		default: true,
		alias: 'a',
		describe: 'Whether or not the bot should automatically reconnect when disconnected'
	})

	// Storage
	.option('storage', {
		type: 'string',
		default: 'rpbot-storage',
		alias: 's',
		describe: 'Path to storage directory',
		normalize: true
	})

	// Logging
	.option('log', {
		type: 'string',
		default: 'rpbot.log',
		alias: 'l',
		describe: 'Path to log file',
		normalize: true
	})
	.option('log-max-size', {
		type: 'number',
		default: 5242880,
		defaultDescription: '5MB',
		alias: 'F',
		describe: 'Maximum size of single log file (in bytes)'
	})
	.option('log-max-files', {
		type: 'number',
		default: 5,
		alias: 'S',
		describe: 'Maximum amount of log files to keep'
	})
	.option('log-level', {
		type: 'string',
		default: 'info',
		alias: 'L',
		describe: 'Log level to output to the log file (error, warn, info, verbose, debug)'
	})
	.option('console-level', {
		type: 'string',
		default: 'info',
		alias: 'C',
		describe: 'Log level to output to the console (error, warn, info, verbose, debug)'
	})

	// General yargs
	.option('config', {
		type: 'string',
		alias: 'c',
		describe: 'Path to JSON/YAML config file',
		normalize: true,
		config: true,
		configParser: (configFile) => {
			const extension = path.extname(configFile).toLowerCase();
			if(extension === '.json')
				return JSON.parse(fs.readFileSync(configFile));
			else if(extension === '.yml' || extension == '.yaml')
				return YAML.safeLoad(fs.readFileSync(configFile));
			throw new Error('Unknown config file type.');
		}
	})
	.help()
	.alias('help', 'h')
	.wrap(yargs.terminalWidth())
.argv;

export default config;
