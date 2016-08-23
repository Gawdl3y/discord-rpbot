'use babel';
'use strict';

import GrafBot from 'discord-graf';
import version from './version';

export default new GrafBot({
	name: 'RPBot',
	version: version,
	about: `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y).\nSource code and information: https://github.com/Gawdl3y/discord-rpbot`,
	updateURL: 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json',
	clientOptions: { disableEveryone: true }
});
