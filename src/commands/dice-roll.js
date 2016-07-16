'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class DiceRollCommand {
	constructor() {
		this.matches = [
			/^!roll\s+([0-9d+ -]+)((>|<)\s*([0-9]+))?\s*$/i,
			/\(\s*roll:\s*([0-9d+ -]+)((>|<)\s*([0-9]+))?\s*\)/i
		];
	}

	run(message, matchResult) {
		try {
			const dice = new DiceExpression(matchResult[1]);
			const result = dice.roll();
			console.log(result);

			let diceList = '';
			for(const [index, diceResults] of result.diceRaw.entries()) {
				if(diceList) diceList += ', ';
				diceList += diceResults.join(' + ') + ' = ' + result.diceSums[index];
			}

			if(matchResult[3]) {
				const operator = matchResult[3];
				const target = parseInt(matchResult[4]);
				let success = false;
				let targetMessage = '';
				if(operator === '>') {
					success = result.roll > target;
					targetMessage = (!success ? 'not ' : '') + 'greater than ' + target;
				} else {
					success = result.roll < target;
					targetMessage = (!success ? 'not ' : '') + 'less than ' + target;
				}
				let messageText = success ? ' has **succeeded**.' : ' has **failed**.';
				messageText += ' (Rolled ' + result.roll + ', ' + targetMessage + (diceList ? '; ' + diceList : '') + ')';
				message.client.sendMessage(message, message.author + messageText);
			} else {
				message.client.sendMessage(message, message.author + ' rolled **' + result.roll + '**.' + (diceList ? ' (' + diceList + ')' : ''));
			}
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
