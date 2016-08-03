'use babel';
'use strict';

import yargs from 'yargs';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';
import version from './version';

const config = yargs
	.usage('$0 [command] [options]')
	.example('$0 --token SomeAPITokenGoesHere', 'Starts the bot using a token')
	.example('$0 --email SomeGuy@SomeSite.com --password SomeCrazyPassword123', 'Starts the bot using an email and password')
	.example('$0 --config settings.yml', 'Starts the bot using a config file')
	.example('$0 completion', 'Outputs Bash completion script')
	.epilogue(`RPBot v${version} by Schuyler Cebulskie (Gawdl3y): https://github.com/Gawdl3y/discord-rpbot/`)

	// Authentication
	.option('token', {
		type: 'string',
		alias: 't',
		describe: 'API token for the bot account',
		group: 'Authentication:'
	})
	.option('email', {
		type: 'string',
		alias: 'e',
		describe: 'Email of the Discord account for the bot to use',
		group: 'Authentication:'
	})
	.option('password', {
		type: 'string',
		alias: 'p',
		describe: 'Password of the Discord account for the bot to use',
		group: 'Authentication:'
	})
	.implies({ email: 'password', password: 'email' })

	// Database
	.option('database', {
		type: 'string',
		default: 'rpbot.sqlite3',
		alias: 'd',
		describe: 'Path to SQLite3 database file',
		group: 'Database:',
		normalize: true
	})
	.option('database-verbose', {
		type: 'boolean',
		alias: 'V',
		describe: 'Whether or not SQLite3 should be put into verbose mode',
		group: 'Database:'
	})
	.option('storage', {
		type: 'string',
		default: 'rpbot-storage',
		alias: 's',
		describe: 'Path to storage directory',
		group: 'Database:',
		normalize: true
	})

	// General
	.option('owner', {
		type: 'string',
		alias: 'o',
		describe: 'Discord user ID of the bot owner',
		group: 'General:'
	})
	.option('invite', {
		type: 'string',
		alias: 'i',
		describe: 'Discord instant invite to contact the owner',
		group: 'General:'
	})
	.option('playing-game', {
		type: 'string',
		alias: 'g',
		describe: 'Text to show in the "Playing..." status',
		group: 'General:'
	})
	.option('command-prefix', {
		type: 'string',
		default: '!',
		alias: 'P',
		describe: 'Default command prefix (blank to use only mentions)',
		group: 'General:'
	})
	.option('unknown-only-mention', {
		type: 'boolean',
		alias: 'M',
		describe: 'Whether or not to output unknown command response only for mentions',
		group: 'General:'
	})
	.option('pagination-items', {
		type: 'number',
		default: 10,
		alias: 'I',
		describe: 'Number of items per page in paginated commands',
		group: 'General:'
	})
	.option('update-check', {
		type: 'number',
		default: 60,
		alias: 'U',
		describe: 'How frequently to check for an update (in minutes, use 0 to disable)',
		group: 'General:'
	})
	.option('analytics', {
		type: 'boolean',
		default: true,
		alias: 'A',
		describe: 'Whether or not to enable anonymous, non-unique, non-identifiable analytics',
		group: 'General:'
	})
	.option('auto-reconnect', {
		type: 'boolean',
		default: true,
		alias: 'a',
		describe: 'Whether or not the bot should automatically reconnect when disconnected',
		group: 'General:'
	})

	// Logging
	.option('log', {
		type: 'string',
		default: 'rpbot.log',
		alias: 'l',
		describe: 'Path to log file',
		group: 'Logging:',
		normalize: true
	})
	.option('log-max-size', {
		type: 'number',
		default: 5242880,
		defaultDescription: '5MB',
		alias: 'S',
		describe: 'Maximum size of single log file (in bytes)',
		group: 'Logging:'
	})
	.option('log-max-files', {
		type: 'number',
		default: 5,
		alias: 'F',
		describe: 'Maximum amount of log files to keep',
		group: 'Logging:'
	})
	.option('log-level', {
		type: 'string',
		default: 'info',
		alias: 'L',
		describe: 'Log level to output to the log file (error, warn, info, verbose, debug)',
		group: 'Logging:'
	})
	.option('console-level', {
		type: 'string',
		default: 'info',
		alias: 'C',
		describe: 'Log level to output to the console (error, warn, info, verbose, debug)',
		group: 'Logging:'
	})

	// General yargs
	.option('config', {
		type: 'string',
		alias: 'c',
		describe: 'Path to JSON/YAML config file',
		group: 'Special:',
		normalize: true,
		config: true,
		configParser: configFile => {
			const extension = path.extname(configFile).toLowerCase();
			if(extension === '.json') {
				return JSON.parse(fs.readFileSync(configFile));
			} else if(extension === '.yml' || extension === '.yaml') {
				return YAML.safeLoad(fs.readFileSync(configFile));
			}
			throw new Error('Unknown config file type.');
		}
	})
	.help()
	.alias('help', 'h')
	.group('help', 'Special:')
	.version(version)
	.alias('version', 'v')
	.group('version', 'Special:')
	.completion('completion')
	.wrap(yargs.terminalWidth())
.argv;

export default config;
