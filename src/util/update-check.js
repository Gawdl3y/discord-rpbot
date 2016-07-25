'use babel';
'use strict';

import request from 'request';
import semver from 'semver';
import logger from './logger';
import version from '../version';

const packageURL = 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json';

export default function checkForUpdate() {
	request(packageURL, (error, response, body) => {
		if(!error && response.statusCode == 200) {
			const masterVersion = JSON.parse(body).version;
			if(semver.gt(masterVersion, version)) {
				logger.warn(`An RPBot update is available! Current version is ${version}, latest available is ${masterVersion}.`);
			}
		}
	});
}
