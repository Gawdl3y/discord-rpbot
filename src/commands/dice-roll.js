'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';

export default class DiceRollCommand {
	static information() {
		return {
			label: 'roll',
			description: 'Rolls specified dice.',
			usage: '!roll <dice expression>',
			details: 'Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is 2 20-sided dice), with addition and subtraction allowed. You may also use greater-than (>) or less-than (<) symbols at the end of the expression to add a target - if that target is met, a success message is displayed. Otherwise, a failure message is shown.',
			examples: ['!roll 2d20', '!roll 3d20 - 1d10 + 6', '!roll 1d20 > 10', 'Billy McBillFace attempts to slay the dragon. (Roll: 1d20 > 10)']
		};
	}

	static triggers() {
		return [
			/^!roll\s+([0-9d+ -]+)((>|<)\s*([0-9]+))?\s*$/i,
			/\(\s*roll:\s*([0-9d+ -]+)((>|<)\s*([0-9]+))?\s*\)/i
		];
	}

	static run(message, matches) {
		try {
			const rollResult = new DiceExpression(matches[1]).roll();
			console.log(rollResult);

			// Build the list of dice
			let diceList = '';
			for(const [index, diceResults] of rollResult.diceRaw.entries()) {
				if(diceList) diceList += ',   ';
				diceList += diceResults.join('\xa0+\xa0') + '\xa0=\xa0' + rollResult.diceSums[index];
			}

			const operator = matches[3];
			if(operator) {
				// Determine whether or not the target is met
				const target = parseInt(matches[4]);
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
				messageText += ' (Rolled ' + rollResult.roll + ', ' + targetMessage + (diceList ? ';   ' + diceList : '') + ')';
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
