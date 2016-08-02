'use babel';
'use strict';

export default class FriendlyError extends Error {
	constructor(message) {
		super(message);
		this.name = 'FriendlyError';
	}
}
