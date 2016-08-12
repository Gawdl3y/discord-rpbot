'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import UsableChannel from '../../database/usable-channel';

export default {
	name: 'allowedchannels',
	aliases: ['allowedchans', 'channels', 'chans'],
	group: 'channels',
	groupName: 'list',
	description: 'Lists all channels command operation is allowed in.',
	serverOnly: true,

	async run(message) {
		const channels = UsableChannel.findInServer(message.server);
		if(channels.length > 0) {
			return stripIndents`
				__**Allowed channels:**__
				${channels.map(channel => `**-** ${channel}`).join('\n')}
			`;
		} else {
			return 'There are no channels specifically allowed, therefore operation is allowed in any channel.';
		}
	}
};
