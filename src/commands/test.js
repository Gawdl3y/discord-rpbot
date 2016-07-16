'use babel';
'use strict';

export default class TestCommand {
	constructor() {
		this.matches = [
			/^!test(\s.*)?$/i
		];
	}

	run(message) {
		message.client.sendMessage(message, 'Oh boy, the test command is working!');
	}
}
