'use babel';
'use strict';

import config from '../config';
import ModRolesDatabase from '../database/mod-roles';

export function isModerator(server, user) {
	if(!server || !user) throw new Error('A server and a user must be specified.');
	if(user.id === config.owner) return true;
	const userRoles = server.rolesOfUser(user);
	if(userRoles.some(role => role.hasPermission('administrator'))) return true;
	if(!ModRolesDatabase.serverHasRoles(server)) return userRoles.some(role => role.hasPermission('manageMessages'));
	return ModRolesDatabase.findRolesInServer(server).some(element => userRoles.some(element2 => element.id === element2.id));
}

export function isAdministrator(server, user) {
	if(!server || !user) throw new Error('A server and a user must be specified.');
	if(user.id === config.owner) return true;
	return server.rolesOfUser(user).some(role => role.hasPermission('administrator'));
}
