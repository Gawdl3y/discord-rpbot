'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import nbsp from '../../util/nbsp';
import logger from '../../util/logger';

export default class DiceRollCommand {
	static get information() {
		return {
			label: 'roll',
			aliases: ['rolldice', 'diceroll', '(roll: xxxx)'],
			description: 'Rolls specified dice.',
			usage: '!roll <dice expression>',
			details: 'Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed. You may also use a single greater-than (>) or less-than (<) symbol at the end of the expression to add a target - if that target is met, a success message is displayed. Otherwise, a failure message is shown.',
			examples: ['!roll 2d20', '!roll 3d20 - d10 + 6', '!roll d20 > 10', 'Billy McBillface attempts to slay the dragon. (Roll: d20 > 10)']
		};
	}

	static get triggers() {
		return [
			/^!(?:roll|rolldice|diceroll)\s+(.+?)(?:(>|<)\s*([0-9]+?))?\s*$/i,
			/\(\s*(?:roll|rolldice|diceroll):\s*(.+?)(?:(>|<)\s*([0-9]+?))?\s*\)/i
		];
	}

	static isRunnable() {
		return true;
	}

	static run(message, matches) {
		try {
			const rollResult = new DiceExpression(matches[1]).roll();
			logger.debug(rollResult);

			// Build the list of dice
			let diceList = '';
			if(rollResult.diceRaw.length > 1 || (rollResult.diceRaw.length > 0 && rollResult.diceRaw[0].length > 1)) {
				diceList = rollResult.diceRaw.map((r, i) => nbsp(r.length > 1 ? r.join(' + ') + ' = ' + rollResult.diceSums[i] : r[0])).join(',   ');
			}

			if(matches[2]) {
				// Determine whether or not the target is met
				const target = parseInt(matches[3]);
				let success = false;
				let targetMessage;
				if(matches[2] === '>') {
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
			logger.error(e);
			message.client.sendMessage(message, message.author + ' specified an invalid dice expression.');
			return;
		}
	}
}
