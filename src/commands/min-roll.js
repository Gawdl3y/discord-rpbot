'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class MinDiceRollCommand {
	static information() {
		return {
			label: 'minroll',
			description: 'Calculates the minimum possible roll for a dice expression.',
			details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
			usage: '!minroll <dice expression>',
			examples: ['!minroll 2d20', '!minroll 3d20 - 1d10 + 6']
		};
	}

	static triggers() {
		return [
			/^!minroll\s+(.+?)\s*$/i
		];
	}

	static run(message, matches) {
		try {
			const minRoll = new DiceExpression(matches[1]).min();
			message.client.sendMessage(message, message.author + ', the minimum roll is ' + minRoll + '.');
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
