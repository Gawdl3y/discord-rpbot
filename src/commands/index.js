'use babel';
'use strict';

import HelpCommand from './general/help';
import AboutCommand from './general/about';
import ListRolesCommand from './general/list-roles';
import PrefixCommand from './general/prefix';
import EvalCommand from './general/eval';

import DiceRollCommand from './dice/roll';
import MaxDiceRollCommand from './dice/max';
import MinDiceRollCommand from './dice/min';

import ViewCharacterCommand from './characters/view';
import ListCharactersCommand from './characters/list';
import AddCharacterCommand from './characters/add';
import DeleteCharacterCommand from './characters/delete';

import ListModRolesCommand from './mod-roles/list';
import AddModRoleCommand from './mod-roles/add';
import DeleteModRoleCommand from './mod-roles/delete';

export const commands = [
	HelpCommand,
	AboutCommand,
	ListRolesCommand,
	PrefixCommand,
	EvalCommand,

	DiceRollCommand,
	MaxDiceRollCommand,
	MinDiceRollCommand,

	ViewCharacterCommand,
	ListCharactersCommand,
	AddCharacterCommand,
	DeleteCharacterCommand,

	ListModRolesCommand,
	AddModRoleCommand,
	DeleteModRoleCommand
];
export default commands;

export function findCommands(searchString = null, message = null) {
	if(!searchString) return message ? commands.filter(c => c.isRunnable(message)) : commands;

	// Find all matches
	const lowercaseSearch = searchString.toLowerCase();
	const matchedCommands = commands.filter(c => c.name.includes(lowercaseSearch) || (c.aliases && c.aliases.some(a => a.includes(lowercaseSearch))));

	// See if there's an exact match
	for(const command of matchedCommands) {
		if(command.name === lowercaseSearch || (command.aliases && command.aliases.some(a => a === lowercaseSearch))) return [command];
	}

	return message ? matchedCommands.filter(c => c.isRunnable(message)) : matchedCommands;
}
