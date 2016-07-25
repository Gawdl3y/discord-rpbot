'use babel';
'use strict';

import version from '../version';

export default {
	name: 'about',
	description: 'Displays information about the bot.',
	usage: '!about',

	triggers: [
		/^!about(?:\s.*)?$/i
	],

	isRunnable() {
		return true;
	},

	run(message) {
		message.client.reply(message, `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot`);
	}
};
