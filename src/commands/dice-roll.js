'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class DiceRollCommand {
	constructor() {
		this.matches = [
			/^!roll\s+([0-9d+ -]+)(>\s*([0-9]+))?\s*$/i,
			/\(\s*roll:\s*([0-9d+ -]+)(>\s*([0-9]+))?\s*\)/i
		];
	}

	run(message, matchResult) {
		try {
			const dice = new DiceExpression(matchResult[1]);
			const result = dice.roll();
			console.log(result);
			if(matchResult.length >= 4 && matchResult[3]) {
				const target = parseInt(matchResult[3]);
				message.client.sendMessage(message, message.author + (target <= result.roll ? ' has succeeded. ' : ' has failed. ') + ' (Rolled ' + result.roll + ', target ' + target + ')');
			} else {
				message.client.sendMessage(message, message.author + ' rolled ' + result.roll + '.');
			}
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
