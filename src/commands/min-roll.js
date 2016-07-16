'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class MinDiceRollCommand {
	constructor() {
		this.matches = [
			/^!minroll\s+([0-9d+ -]+)\s*$/i
		];
	}

	run(message, matchResult) {
		try {
			const dice = new DiceExpression(matchResult[1]);
			const result = dice.min();
			message.client.sendMessage(message, message.author + ', the minimum roll is ' + result + '.');
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
