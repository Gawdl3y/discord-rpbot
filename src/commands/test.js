'use babel';
'use strict';

export default class TestCommand {
	static get information() {
		return {
			label: 'test',
			description: 'Does absolutely nothing useful.',
			usage: '!test'
		};
	}

	static get triggers() {
		return [
			/^!test(?:\s.*)?$/i
		];
	}

	static run(message) {
		message.client.reply(message, 'Oh boy, the test command is working!');
	}
}
