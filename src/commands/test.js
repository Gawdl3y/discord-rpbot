'use babel';
'use strict';

export default class TestCommand {
	static information() {
		return {
			label: 'test',
			description: 'Does absolutely nothing useful.',
			usage: '!test'
		};
	}

	static triggers() {
		return [
			/^!test(?:\s.*)?$/i
		];
	}

	static run(message) {
		message.client.sendMessage(message, 'Oh boy, the test command is working!');
	}
}
