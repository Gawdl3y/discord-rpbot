'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import Setting from '../database/setting';
import nbsp from './nbsp';

export function long(command, server = null, onlyMention = false) {
	if(!server && !onlyMention) return short(command);
	const nbcmd = nbsp(command);
	let prefixAddon;
	if(!onlyMention) {
		let prefix = nbsp(Setting.getValue('command-prefix', config.commandPrefix, server));
		if(prefix.length > 1) prefix += '\xa0';
		prefixAddon = prefix ? `\`${prefix}${nbcmd}\` or ` : '';
	}
	return `${prefixAddon ? prefixAddon : ''}\`@${nbsp(client.user.name)}#${client.user.discriminator}\xa0${nbcmd}\``;
}
export default long;

export function short(command) {
	return `\`${nbsp(command)}\``;
}
