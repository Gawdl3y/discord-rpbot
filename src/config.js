'use babel';
'use strict';

import yargs from 'yargs';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

const config = yargs
	.usage('$0 [args]')
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
	.option('auto-reconnect', {
		type: 'boolean',
		describe: 'Whether or not the bot should automatically reconnect when disconnected'
	})
	.option('log', {
		type: 'string',
		default: 'rpbot.log',
		describe: 'Path to log file'
	})
	.option('log-level', {
		type: 'string',
		default: 'info',
		describe: 'Log level to output to the log file (error, warn, info, verbose, debug)'
	})
	.config('config', (configFile) => {
		const extension = path.extname(configFile).toLowerCase();
		if(extension === '.json')
			return JSON.parse(fs.readFileSync(configFile));
		else if(extension === '.yml' || extension == '.yaml')
			return YAML.safeLoad(fs.readFileSync(configFile));
		throw new Error('Unknown config file type');
	})
	.alias('config', 'c')
	.describe('config', 'Path to JSON/YAML config file')
	.help()
	.alias('help', 'h')
	.argv;

export default config;
