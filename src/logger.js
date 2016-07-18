'use babel';
'use strict';

import winston from 'winston';
import config from './config';

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			timestamp: true
		})
	]
});

if(config.log) {
	logger.add(new winston.transports.File({
		filename: config.log,
		level: config.logLevel,
		json: false
	}));
}

export default logger;
