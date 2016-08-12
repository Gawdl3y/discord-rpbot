'use babel';
'use strict';

import storage from './local-storage';
import search from '../util/search';
import logger from '../util/logger';

export default class Channel {
	static loadDatabase() {
		this.serversMap = JSON.parse(storage.getItem('channels'));
		if(!this.serversMap) this.serversMap = {};
	}

	static saveDatabase() {
		logger.debug('Saving channels storage...', this.serversMap);
		storage.setItem('channels', JSON.stringify(this.serversMap));
	}

	static save(channel) {
		if(!channel) throw new Error('A channel must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[channel.server.id]) this.serversMap[channel.server.id] = [];
		const serverChannels = this.serversMap[channel.server.id];

		if(!serverChannels.includes(channel.id)) {
			serverChannels.push(channel.id);
			logger.info('Added new channel.', this.basicInfo(channel));
			this.saveDatabase();
			return true;
		} else {
			logger.info('Not adding channel, because it already exists.', this.basicInfo(channel));
			return false;
		}
	}

	static delete(channel) {
		if(!channel) throw new Error('A channel must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[channel.server.id]) return false;
		const serverChannels = this.serversMap[channel.server.id];

		const roleIndex = serverChannels.findIndex(element => element === channel.id);
		if(roleIndex >= 0) {
			serverChannels.splice(roleIndex, 1);
			logger.info('Deleted channel.', this.basicInfo(channel));
			this.saveDatabase();
			return true;
		} else {
			logger.info('Not deleting channel, because it doesn\'t exist.', this.basicInfo(channel));
			return false;
		}
	}

	static clearServer(server) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		delete this.serversMap[server.id];
		logger.info('Cleared channels.', { server: server.name, serverID: server.id });
		this.saveDatabase();
	}

	static findInServer(server, searchString = null) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		if(!this.serversMap[server.id]) return [];

		// Find all of the server's channels that match, and filter them to ones that are usable channels
		const channels = search(server.channels.getAll('type', 'text'), searchString, { searchExact: false }).filter(channel => this.serversMap[server.id].includes(channel.id));
		return search(channels, searchString, { searchInexact: false });
	}

	static serverHasAny(server) {
		if(!server) throw new Error('A server must be specified.');
		if(!this.serversMap) this.loadDatabase();
		return this.serversMap[server.id] && this.serversMap[server.id].length > 0;
	}

	static serverHas(server, channel) {
		if(!server || !channel) throw new Error('A server and channel must be specified.');
		if(!this.serversMap) this.loadDatabase();
		return this.serversMap[server.id] && this.serversMap[server.id].includes(channel.id);
	}

	static basicInfo(channel) {
		return { id: channel.id, name: channel.name, server: channel.server.name, serverID: channel.server.id };
	}
}
