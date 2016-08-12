'use babel';
'use strict';

import Channel from '../../database/channel';
import disambiguation from '../../util/disambiguation';
import usage from '../../util/command-usage';
import * as permissions from '../../util/permissions';
import CommandFormatError from '../../util/errors/command-format';

const pattern = /^(?:<#)?(.+?)>?$/;

export default {
	name: 'disallowchannel',
	aliases: ['disallowchan', 'deletechannel', 'deletechan', 'delchan', 'removechannel', 'removechan'],
	group: 'channels',
	groupName: 'disallow',
	description: 'Disallows command operation in a channel.',
	usage: 'disallowchannel <channel>',
	details: 'The channel must be the name or ID of a channel, or a channel mention. Only administrators may use this command.',
	examples: ['disallowchannel #CoolChannel', 'disallowchannel cool', 'disallowchannel 205536402341888001'],
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
		if(idChannel) channels = [idChannel]; else channels = Channel.findInServer(message.server, matches[1]);

		if(channels.length === 1) {
			if(Channel.delete(channels[0])) {
				return `Disallowed operation in ${channels[0]}.`;
			} else {
				return `Operation is already not allowed in ${channels[0]}.`;
			}
		} else if(channels.length > 1) {
			return disambiguation(channels, 'channels');
		} else {
			return `Unable to identify channel. Use ${usage('allowedchannels', message.server)} to view the allowed channels.`;
		}
	}
};
