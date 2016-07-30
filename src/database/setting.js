export default class Setting {
	constructor(server, key, value) {
		if(!key || !server) throw new Error('Setting key and server must be specified.');
		this.key = key;
		this.value = value;
		this.server = server.id ? server.id : server;
	}
}
