'use babel';
'use strict';

import request from 'request';
import semver from 'semver';
import logger from './logger';
import { client } from '../rpbot';
import config from '../config';
import version from '../version';
import Setting from '../database/setting';

const packageURL = 'https://raw.githubusercontent.com/Gawdl3y/discord-rpbot/master/package.json';

export default function checkForUpdate() {
	request(packageURL, (error, response, body) => {
		if(!error && response.statusCode == 200) {
			const masterVersion = JSON.parse(body).version;
			if(semver.gt(masterVersion, version)) {
				const message = `An RPBot update is available! Current version is ${version}, latest available is ${masterVersion}.`;
				logger.warn(message);
				const savedVersion = Setting.getValue('notified-version');
				if(savedVersion != masterVersion && client && config.owner) {
					client.sendMessage(config.owner, message);
					Setting.save(new Setting(null, 'notified-version', masterVersion));
				}
			}
		}
	});
}
