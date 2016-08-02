'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import logger from '../../util/logger';
import CommandFormatError from '../../util/errors/command-format';

export default {
	name: 'maxroll',
	group: 'dice',
	groupName: 'max',
	description: 'Calculates the maximum possible roll for a dice expression.',
	usage: 'maxroll <dice expression>',
	details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
	examples: ['maxroll 2d20', 'maxroll 3d20 - d10 + 6'],
	singleArgument: true,

	isRunnable() {
		return true;
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		try {
			const maxRoll = new DiceExpression(args[0]).max();
			message.reply(`The maximum possible roll is **${maxRoll}**.`);
		} catch(e) {
			logger.error(e);
			message.reply('Invalid dice expression specified.');
			return;
		}
	}
};
