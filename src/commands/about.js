'use babel';
'use strict';

import version from '../version';

export default class AboutCommand {
	static get information() {
		return {
			label: 'about',
			description: 'Displays information about the bot.',
			usage: '!about'
		};
	}

	static get triggers() {
		return [
			/^!about(?:\s.*)?$/i
		];
	}

	static isRunnable() {
		return true;
	}

	static run(message) {
		message.client.reply(message, '**RPBot** v' + version + ' created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot');
	}
}
