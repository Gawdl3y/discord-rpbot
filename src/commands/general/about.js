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

	async run(message) {
		const owner = message.client.users.get('id', config.owner);
		const servers = message.client.servers.length.toLocaleString(), users = message.client.users.length.toLocaleString();
		const serversLabel = servers != 1 ? 'servers' : 'server', usersLabel = users != 1 ? 'users' : 'user';
		const uptime = process.uptime();
		const days = Math.floor(uptime / 60 / 60 / 24), hours = Math.floor(uptime / 60 / 60 % 24), minutes = Math.floor(uptime / 60 % 60);
		const daysLabel = days != 1 ? 'days' : 'day', hoursLabel = hours != 1 ? 'hours' : 'hour', minutesLabel = minutes != 1 ? 'minutes' : 'minute';
		const daysStr = `${days.toLocaleString()} ${daysLabel}`, hoursStr = `${hours.toLocaleString()} ${hoursLabel}`, minutesStr = `${minutes.toLocaleString()} ${minutesLabel}`;
		message.client.sendMessage(message.author, stripIndents`
			**RPBot** v${version} created by Schuyler Cebulskie (Gawdl3y).
			Source code and information: https://github.com/Gawdl3y/discord-rpbot

			This bot ${owner ? `is owned by ${owner.name}#${owner.discriminator}, and ` : ''}is serving ${users} ${usersLabel} across ${servers} ${serversLabel}.
			It has been running without interruption for ${days > 0 ? `${daysStr} ` : '' }${hours > 0 ? `${hoursStr} ` : '' }${minutesStr}.
			${config.invite ? `For bot feedback/help, use this invite: ${config.invite}` : ''}
		`);
		if(message.server) message.reply('Sent a DM to you with information.');
	}
};
