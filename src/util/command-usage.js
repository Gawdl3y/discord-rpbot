'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import Setting from '../database/setting';
import nbsp from './nbsp';

export function long(command, server = null) {
	const nbcmd = nbsp(command);
	let prefix = nbsp(server ? Setting.getValue('command-prefix', config.commandPrefix, server) : config.commandPrefix);
	if(prefix.length > 1) prefix += '\xa0';
	const prefixAddon = prefix ? `\`${prefix}${nbcmd}\` or ` : '';
	return `${prefixAddon}\`@${nbsp(client.user.name)}#${client.user.discriminator}\xa0${nbcmd}\``;
}
export default long;

export function short(command) {
	return `\`${nbsp(command)}\``;
}
