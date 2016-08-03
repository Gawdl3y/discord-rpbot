'use babel';
'use strict';

import winston from 'winston';
import config from '../config';
import * as analytics from './analytics';

export const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			level: config.consoleLevel,
			colorize: true,
			timestamp: true,
			handleExceptions: true,
			humanReadableUnhandledException: true
		})
	],
	exitOnError: err => {
		analytics.sendException(err);
		return true;
	}
});

if(config.log) {
	logger.add(winston.transports.File, {
		level: config.logLevel,
		filename: config.log,
		maxsize: config.logMaxSize,
		maxFiles: config.logMaxFiles,
		tailable: true,
		json: false,
		handleExceptions: true,
		humanReadableUnhandledException: true
	});
}

export default logger;
