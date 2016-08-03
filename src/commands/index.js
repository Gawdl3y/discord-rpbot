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

export const groups = [
	{ id: 'general', name: 'General', commands: [] },
	{ id: 'dice', name: 'Dice', commands: [] },
	{ id: 'characters', name: 'Characters', commands: [] },
	{ id: 'mod-roles', name: 'Mod roles', commands: [] }
];
for(const command of commands) groups.find(grp => grp.id === command.group).commands.push(command);

export function findCommands(searchString = null, message = null) {
	if(!searchString) return message ? commands.filter(cmd => cmd.isRunnable(message)) : commands;

	// Find all matches
	const lowercaseSearch = searchString.toLowerCase();
	const matchedCommands = commands.filter(cmd => cmd.name.includes(lowercaseSearch) || (cmd.aliases && cmd.aliases.some(ali => ali.includes(lowercaseSearch))));

	// See if there's an exact match
	for(const command of matchedCommands) {
		if(command.name === lowercaseSearch || (command.aliases && command.aliases.some(ali => ali === lowercaseSearch))) return [command];
	}

	return message ? matchedCommands.filter(cmd => cmd.isRunnable(message)) : matchedCommands;
}
