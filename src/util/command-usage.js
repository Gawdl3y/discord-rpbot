'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import Setting from '../database/setting';
import nbsp from './nbsp';

export function long(command, server = null) {
	if(!server) return short(command);
	const nbcmd = nbsp(command);
	let prefix = nbsp(Setting.getValue('command-prefix', config.commandPrefix, server));
	if(prefix.length > 1) prefix += '\xa0';
	const prefixAddon = prefix ? `\`${prefix}${nbcmd}\` or ` : '';
	return `${prefixAddon}\`@${nbsp(client.user.name)}#${client.user.discriminator}\xa0${nbcmd}\``;
}
export default long;

export function short(command) {
	return `\`${nbsp(command)}\``;
}
