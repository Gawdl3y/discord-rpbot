'use babel';
'use strict';

import GrafBot from 'discord-graf';
import version from './version';

export default new GrafBot({
	botName: 'RPBot',
	botVersion: '0.1.0',
	botAbout: `**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y).\nSource code and information: https://github.com/Gawdl3y/discord-rpbot`,
	botUpdateURL: 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json'
});
