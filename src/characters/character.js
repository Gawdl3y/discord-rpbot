'use babel';
'use strict';

export default class Character {
	constructor(name, info, owner, server) {
		if(!name || !owner || !server) throw new Error('Character name, owner, and server must be specified.');
		this.name = name;
		this.info = info;
		this.owner = owner;
		this.server = server;
	}
}
