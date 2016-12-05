'use babel';
'use strict';

import { Bot } from 'discord-graf';
import { stripIndents } from 'common-tags';
import version from './version';

export default new Bot({
	name: 'RPBot',
	version: version,
	about: stripIndents`
		**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y).
		Source code and information: https://github.com/Gawdl3y/discord-rpbot
	`,
	updateURL: 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json',
	clientOptions: {
		disableEveryone: true,
		messageCacheLifetime: 120,
		messageSweepInterval: 60
	}
});
