'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import logger from '../logger';

export default class MinDiceRollCommand {
	static get information() {
		return {
			label: 'minroll',
			description: 'Calculates the minimum possible roll for a dice expression.',
			details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
			usage: '!minroll <dice expression>',
			examples: ['!minroll 2d20', '!minroll 3d20 - 1d10 + 6']
		};
	}

	static get triggers() {
		return [
			/^!minroll\s+(.+?)\s*$/i
		];
	}

	static run(message, matches) {
		try {
			const minRoll = new DiceExpression(matches[1]).min();
			message.client.reply(message, 'The minimum possible roll is ' + minRoll + '.');
		} catch(e) {
			logger.error(e);
			message.client.reply(message, 'Invalid dice expression specified.');
			return;
		}
	}
}
