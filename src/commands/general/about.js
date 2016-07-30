'use babel';
'use strict';

import config from '../../config';
import version from '../../version';

export default {
	name: 'about',
	group: 'general',
	groupName: 'about',
	description: 'Displays information about the bot.',
	usage: '!about',

	isRunnable() {
		return true;
	},

	run(message) {
		const owner = message.client.users.get('id', config.owner);
		const ownerAddon = owner ? `\n**Bot owner:** ${owner.name}#${owner.discriminator}` : '';
		message.client.reply(message, `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot${ownerAddon}`);
	}
};
