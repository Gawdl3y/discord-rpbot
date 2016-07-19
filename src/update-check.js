'use babel';
'use strict';

import request from 'request';
import semver from 'semver';
import logger from './logger';

const packageURL = 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json';

export default function checkForUpdate(currentVersion) {
	request(packageURL, (error, response, body) => {
		if(!error && response.statusCode == 200) {
			const masterVersion = JSON.parse(body).version;
			if(semver.gt(masterVersion, currentVersion)) {
				logger.warn('An RPBot update is available! Current version is ' + currentVersion + ', latest available is ' + masterVersion + '.');
			}
		}
	});
}
