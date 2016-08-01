'use babel';
'use strict';

/* eslint-disable no-unused-vars */
import util from 'util';
import request from 'request';
import semver from 'semver';
import DiceExpression from 'dice-expression-evaluator';
import stringArgv from 'string-argv';
import * as rpbot from '../../rpbot';
import config from '../../config';
import version from '../../version';
import * as commands from '..';
import storage from '../../database/local-storage';
import Character from '../../database/character';
import Setting from '../../database/setting';
import CharDB from '../../database/characters';
import SettingDB from '../../database/settings';
import ModRolesDB from '../../database/mod-roles';
import search from '../../util/search';
import disambiguation from '../../util/disambiguation';
import pagination from '../../util/pagination';
import buildCommandPattern from '../../util/command-pattern';
import logger from '../../util/logger';
import checkForUpdate from '../../util/update-check';
import * as permissions from '../../util/permissions';
import * as usage from '../../util/command-usage';
import * as nbsp from '../../util/nbsp';
/* eslint-enable no-unused-vars */

export default {
	name: 'eval',
	group: 'general',
	groupName: 'eval',
	description: 'Evaluates input as JavaScript.',
	usage: 'eval <script>',
	details: 'Only the bot owner may use this command.',
	singleArgument: true,

	isRunnable(message) {
		return message.author.id === config.owner;
	},

	run(msg, args) {
		if(!args[0]) return false;
		try {
			msg.reply(`Result: \`${util.inspect(eval(args[0]), {depth: 1})}\``);
		} catch(e) {
			msg.reply(`Error while evaluating: ${e}`);
		}
	}
};
