'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import SettingsDatabase from '../database/settings';
import nbsp from './nbsp';

export function long(command, server = null) {
	const nbcmd = nbsp(command);
	const prefix = nbsp(server ? SettingsDatabase.getSettingValue('command-prefix', config.commandPrefix, server) : config.commandPrefix);
	const prefixAddon = prefix ? `\`${prefix}${nbcmd}\` or ` : '';
	return `${prefixAddon}\`@${nbsp(client.user.name)}#${client.user.discriminator}\xa0${nbcmd}\``;
}
export default long;

export function short(command) {
	return `\`${nbsp(command)}\``;
}
