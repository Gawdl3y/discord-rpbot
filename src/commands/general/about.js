'use babel';
'use strict';

import config from '../../config';
import version from '../../version';

export default {
	name: 'about',
	group: 'general',
	groupName: 'about',
	description: 'Displays information about the bot.',

	isRunnable() {
		return true;
	},

	run(message) {
		const owner = message.client.users.get('id', config.owner);
		const ownerAddon = owner ? `is owned by ${owner.name}#${owner.discriminator}, and ` : '';
		const serverCount = message.client.servers.length;
		const userCount = message.client.users.length;
		const serverLabel = 'server' + (serverCount > 1 || serverCount === 0 ? 's' : '');
		const userLabel = 'user' + (userCount > 1 || userCount === 0 ? 's' : '');
		const general = `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot`;
		const usage = `This bot ${ownerAddon}is serving ${userCount} ${userLabel} across ${serverCount} ${serverLabel}.`;
		message.client.reply(message, `${general}\n${usage}`);
	}
};
