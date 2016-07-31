'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import logger from '../../util/logger';

export default {
	name: 'minroll',
	group: 'dice',
	groupName: 'min',
	description: 'Calculates the minimum possible roll for a dice expression.',
	usage: 'minroll <dice expression>',
	details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
	examples: ['minroll 2d20', 'minroll 3d20 - d10 + 6'],
	singleArgument: true,

	isRunnable() {
		return true;
	},

	run(message, args) {
		if(!args[0]) return false;
		try {
			const minRoll = new DiceExpression(args[0]).min();
			message.reply(`The minimum possible roll is **${minRoll}**.`);
		} catch(e) {
			logger.error(e);
			message.reply('Invalid dice expression specified.');
			return;
		}
	}
};
