'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import ModRole from '../database/mod-role';

export function isModerator(server, user) {
	[server, user] = resolve(server, user);
	if(user.id === config.owner) return true;
	const userRoles = server.rolesOfUser(user);
	if(userRoles.some(role => role.hasPermission('administrator'))) return true;
	if(!ModRole.serverHasAny(server)) return userRoles.some(role => role.hasPermission('manageMessages'));
	return ModRole.findInServer(server).some(element => userRoles.some(element2 => element.id === element2.id));
}

export function isAdministrator(server, user) {
	[server, user] = resolve(server, user);
	if(user.id === config.owner) return true;
	return server.rolesOfUser(user).some(role => role.hasPermission('administrator'));
}

function resolve(server, user) {
	if(!server || !user) throw new Error('A server and a user must be specified.');
	if(typeof server === 'string') server = client.servers.get('id', server);
	if(!server || !server.id) throw new Error('Unable to identify server.');
	if(typeof user === 'string') user = server.members.get('id', user);
	if(!user || !user.id) throw new Error('Unable to identify user.');
	return [server, user];
}
