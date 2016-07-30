'use babel';
'use strict';

import escapeRegex from 'escape-string-regexp';
import config from '../config';
import SettingsDatabase from '../database/settings';
import logger from './logger';

export function buildCommandPattern(server, user) {
	const prefix = server ? SettingsDatabase.getSettingValue('command-prefix', config.commandPrefix, server) : config.commandPrefix;
	const escapedPrefix = escapeRegex(prefix);
	const prefixPatternPiece = escapedPrefix ? escapedPrefix + '(?:\\s*)?|' : '';
	const pattern = new RegExp(`^(${prefixPatternPiece}<@!?${user.id}>\\s+(?:${escapedPrefix})?)([^\\s]+)`, 'i');
	logger.info(`Server command pattern built.`, { server: server ? server.name : null, serverID: server ? server.id : null, prefix: prefix, commandPattern: pattern });
	return pattern;
}
export default buildCommandPattern;