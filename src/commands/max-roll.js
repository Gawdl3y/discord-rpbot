'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class MaxDiceRollCommand {
	constructor() {
		this.matches = [
			/^!maxroll\s+([0-9d+ -]+)\s*$/i
		];
	}

	run(message, matchResult) {
		try {
			const dice = new DiceExpression(matchResult[1]);
			const result = dice.max();
			message.client.sendMessage(message, message.author + ', the maximum roll is ' + result + '.');
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
