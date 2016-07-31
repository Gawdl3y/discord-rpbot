'use babel';
'use strict';

export default class Character {
	constructor(server, owner, name, info) {
		if(!server || !owner || !name) throw new Error('Character name, owner, and server must be specified.');
		this.server = server.id ? server.id : server;
		this.owner = owner.id ? owner.id : owner;
		this.name = name;
		this.info = info;
	}
}
