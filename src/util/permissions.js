'use babel';
'use strict';

import { client } from '../rpbot';
import config from '../config';
import ModRolesDatabase from '../database/mod-roles';

export function isModerator(server, user) {
	[server, user] = resolve(server, user);
	if(user.id === config.owner) return true;
	const userRoles = server.rolesOfUser(user);
	if(userRoles.some(role => role.hasPermission('administrator'))) return true;
	if(!ModRolesDatabase.serverHasRoles(server)) return userRoles.some(role => role.hasPermission('manageMessages'));
	return ModRolesDatabase.findRolesInServer(server).some(element => userRoles.some(element2 => element.id === element2.id));
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
