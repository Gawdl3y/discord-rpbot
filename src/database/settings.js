'use babel';
'use strict';

import Setting from './setting';
import storage from './local-storage';
import logger from '../util/logger';

export default class SettingsDatabase {
	static loadDatabase() {
		this.serversMap = JSON.parse(storage.getItem('settings'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		logger.debug('Saving settings database...', this.serversMap);
		storage.setItem('settings', JSON.stringify(this.serversMap));
	}

	static saveSetting(setting) {
		if(!setting) throw new Error('A setting must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[setting.server]) this.serversMap[setting.server] = {};
		this.serversMap[setting.server][setting.key] = setting.value;
		logger.info('Saved setting.', setting);
		this.saveDatabase();
		return true;
	}

	static getSetting(setting, server = null) {
		if(!(setting instanceof Setting) && (!setting || !server)) throw new Error('A setting or a key and server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!server) server = setting.server;
		if(server.id) server = server.id;
		if(!this.serversMap[server]) return null;
		const key = setting instanceof Setting ? setting.key : setting;
		return new Setting(server, key, this.serversMap[server][key]);
	}

	static getSettingValue(setting, defaultValue = null, server = null) {
		if(!(setting instanceof Setting) && (!setting || !server)) throw new Error('A setting or a key and server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!server) server = setting.server;
		if(server.id) server = server.id;
		if(!this.serversMap[server]) return defaultValue;
		const key = setting instanceof Setting ? setting.key : setting;
		return key in this.serversMap[server] ? this.serversMap[server][key] : defaultValue;
	}

	static deleteSetting(setting, server = null) {
		if(!(setting instanceof Setting) && (!setting || !server)) throw new Error('A setting or a key and server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!server) server = setting.server;
		if(server.id) server = server.id;
		if(!this.serversMap[server]) return false;
		const key = setting instanceof Setting ? setting.key : setting;
		if(typeof this.serversMap[server][key] === 'undefined') return false;
		delete this.serversMap[server][key];
		logger.info('Removed setting.', { key: key, server: server });
		this.saveDatabase();
		return true;
	}
}
