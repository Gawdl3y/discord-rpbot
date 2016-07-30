'use babel';
'use strict';

import nbsp from './nbsp';
import { client } from '../rpbot';

export function long(command) {
	const nbcmd = nbsp(command);
	return `\`!${nbcmd}\` or \`@${client.user.name}#${client.user.discriminator}\xa0${nbcmd}\``;
}
export default long;

export function short(command) {
	return `\`${nbsp(command)}\``;
}
