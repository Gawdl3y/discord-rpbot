'use babel';
'use strict';

import FriendlyError from './friendly';
import * as usage from '../command-usage';

export default class CommandFormatError extends FriendlyError {
	constructor(command) {
		super(`Invalid command format. Use \`${usage.short(`help ${command.name}`)}\` for information.`);
		this.name = 'CommandFormatError';
	}
}
