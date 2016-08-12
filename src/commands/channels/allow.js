'use babel';
'use strict';

import UsableChannel from '../../database/usable-channel';
import search from '../../util/search';
import disambiguation from '../../util/disambiguation';
import * as permissions from '../../util/permissions';
import CommandFormatError from '../../util/errors/command-format';

const pattern = /^(?:<#)?(.+?)>?$/;

export default {
	name: 'allowchannel',
	aliases: ['allowchan', 'addchannel', 'addchan'],
	group: 'channels',
	groupName: 'add',
	description: 'Allows command operation in a channel.',
	usage: 'allowchannel <channel>',
	details: 'The channel must be the name or ID of a channel, or a channel mention. Only administrators may use this command.',
	examples: ['allowchannel #CoolChannel', 'allowchannel cool', 'allowchannel 205536402341888001'],
	serverOnly: true,
	singleArgument: true,

	isRunnable(message) {
		return permissions.isAdmin(message.server, message.author);
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const matches = pattern.exec(args[0]);
		let channels;
		const idChannel = message.server.channels.get('id', matches[1]);
		if(idChannel) channels = [idChannel]; else channels = search(message.server.channels.getAll('type', 'text'), matches[1]);

		if(channels.length === 1) {
			if(UsableChannel.save(channels[0])) {
				return `Allowed operation in ${channels[0]}.`;
			} else {
				return `Operation is already allowed in ${channels[0]}.`;
			}
		} else if(channels.length > 1) {
			return disambiguation(channels, 'channels');
		} else {
			return 'Unable to identify channel.';
		}
	}
};
