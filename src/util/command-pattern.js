'use babel';
'use strict';

import escapeRegex from 'escape-string-regexp';
import config from '../config';
import Setting from '../database/setting';
import logger from './logger';

export function buildCommandPattern(server, user) {
	let prefix = server ? Setting.getValue('command-prefix', config.commandPrefix, server) : config.commandPrefix;
	if(prefix === 'none') prefix = '';
	const escapedPrefix = escapeRegex(prefix);
	const prefixPatternPiece = prefix ? escapedPrefix + '\\s*|' : '';
	const pattern = new RegExp(`^(${prefixPatternPiece}<@!?${user.id}>\\s+(?:${escapedPrefix})?)([^\\s]+)`, 'i');
	logger.info(`Server command pattern built.`, { server: server ? server.name : null, serverID: server ? server.id : null, prefix: prefix, pattern: pattern.source });
	return pattern;
}
export default buildCommandPattern;
