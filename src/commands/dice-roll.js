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
			const rollResult = new DiceExpression(matchResult[1]).roll();
			console.log(rollResult);

			// Build the list of dice
			let diceList = '';
			for(const [index, diceResults] of rollResult.diceRaw.entries()) {
				if(diceList) diceList += ',  ';
				diceList += diceResults.join(' + ') + ' = ' + rollResult.diceSums[index];
			}

			const operator = matchResult[3];
			if(operator) {
				// Determine whether or not the target is met
				const target = parseInt(matchResult[4]);
				let success = false;
				let targetMessage = '';
				if(operator === '>') {
					success = rollResult.roll > target;
					targetMessage = (!success ? 'not ' : '') + 'greater than ' + target;
				} else {
					success = rollResult.roll < target;
					targetMessage = (!success ? 'not ' : '') + 'less than ' + target;
				}

				// Send message
				let messageText = success ? ' has **succeeded**.' : ' has **failed**.';
				messageText += ' (Rolled ' + rollResult.roll + ', ' + targetMessage + (diceList ? '; ' + diceList : '') + ')';
				message.client.sendMessage(message, message.author + messageText);
			} else {
				message.client.sendMessage(message, message.author + ' rolled **' + rollResult.roll + '**.' + (diceList ? ' (' + diceList + ')' : ''));
			}
		} catch(e) {
			console.log(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
