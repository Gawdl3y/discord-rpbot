'use babel';
'use strict';

import { VERSION } from '../rpbot';

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

	static run(message) {
		message.client.reply(message, '**RPBot** v' + VERSION.string + ' created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot');
	}
}
