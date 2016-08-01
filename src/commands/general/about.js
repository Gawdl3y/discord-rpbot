'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import config from '../../config';
import version from '../../version';

export default {
	name: 'about',
	group: 'general',
	groupName: 'about',
	description: 'Displays information about the bot.',

	isRunnable() {
		return true;
	},

	run(message) {
		const owner = message.client.users.get('id', config.owner);
		const servers = message.client.servers.length.toLocaleString(), users = message.client.users.length.toLocaleString();
		const serversLabel = servers != 1 ? 'servers' : 'server', usersLabel = users != 1 ? 'users' : 'user';
		const uptime = process.uptime();
		const days = Math.floor(uptime / 60 / 60 / 24).toLocaleString(), hours = Math.floor(uptime / 60 / 60), minutes = Math.floor(uptime / 60);
		const daysLabel = days != 1 ? 'days' : 'day', hoursLabel = hours != 1 ? 'hours' : 'hour', minutesLabel = minutes != 1 ? 'minutes' : 'minute';
		message.reply(stripIndents`
			**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y). https://github.com/Gawdl3y/discord-rpbot
			This bot ${owner ? `is owned by ${owner.name}#${owner.discriminator}, and ` : ''}is serving ${users} ${usersLabel} across ${servers} ${serversLabel}.
			It has been running without interruption for ${days} ${daysLabel} ${hours} ${hoursLabel} ${minutes} ${minutesLabel}.
		`);
	}
};
