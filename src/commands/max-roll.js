'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import logger from '../logger';

export default class MaxDiceRollCommand {
	static information() {
		return {
			label: 'maxroll',
			description: 'Calculates the maximum possible roll for a dice expression.',
			details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
			usage: '!maxroll <dice expression>',
			examples: ['!maxroll 2d20', '!maxroll 3d20 - 1d10 + 6']
		};
	}

	static triggers() {
		return [
			/^!maxroll\s+(.+?)\s*$/i
		];
	}

	static run(message, matches) {
		try {
			const maxRoll = new DiceExpression(matches[1]).max();
			message.client.reply(message, 'The maximum possible roll is ' + maxRoll + '.');
		} catch(e) {
			logger.error(e);
			message.client.reply(message, 'Invalid dice expression specified.');
			return;
		}
	}
}
