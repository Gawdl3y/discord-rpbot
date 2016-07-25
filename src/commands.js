'use babel';
'use strict';

import HelpCommand from './commands/help';
import AboutCommand from './commands/about';
import ListRolesCommand from './commands/list-roles';

import DiceRollCommand from './commands/dice/roll';
import MaxDiceRollCommand from './commands/dice/max';
import MinDiceRollCommand from './commands/dice/min';

import ViewCharacterCommand from './commands/characters/view';
import ListCharactersCommand from './commands/characters/list';
import AddCharacterCommand from './commands/characters/add';
import DeleteCharacterCommand from './commands/characters/delete';

import ListModRolesCommand from './commands/mod-roles/list';
import AddModRoleCommand from './commands/mod-roles/add';
import DeleteModRoleCommand from './commands/mod-roles/delete';

export const commands = [
	HelpCommand,
	AboutCommand,
	ListRolesCommand,

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
