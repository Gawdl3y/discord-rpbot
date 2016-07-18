'use babel';
'use strict';

import winston from 'winston';
import config from './config';

const logger = new winston.Logger({
	transports: [
		new (winston.transports.Console)({
			level: config.consoleLevel,
			colorize: true,
			timestamp: true
		})
	]
});

if(config.log) {
	logger.add(winston.transports.File, {
		level: config.logLevel,
		filename: config.log,
		json: false
	});
}

export default logger;
