'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import DiceExpression from 'dice-expression-evaluator';
import { oneLine } from 'common-tags';

const pattern = /^(.+?)(?:(>|<)\s*([0-9]+?))?\s*$/;

export default class RollDiceCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'roll';
		this.aliases = ['dice', 'rolldice', 'diceroll', '(roll: xxxx)'];
		this.group = 'dice';
		this.groupName = 'roll';
		this.description = 'Rolls specified dice.';
		this.usage = 'roll <dice expression>';
		this.details = oneLine`
			Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed.
			You may also use a single greater-than (>) or less-than (<) symbol at the end of the expression to add a target - if that target is met, a success message is displayed.
			Otherwise, a failure message is shown.
		`;
		this.examples = ['roll 2d20', 'roll 3d20 - d10 + 6', 'roll d20 > 10', 'Billy McBillface attempts to slay the dragon. (Roll: d20 > 10)'];
		this.patterns = [/\(\s*(?:roll|dice|rolldice|diceroll):\s*(.+?)(?:(>|<)\s*([0-9]+?))?\s*\)/i];
	}

	async run(message, args, fromPattern) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		try {
			const matches = fromPattern ? args : pattern.exec(args[0]);
			const dice = new DiceExpression(matches[1]);

			// Restrict the maximum dice count
			const totalDice = dice.dice.reduce((prev, die) => prev + die.diceCount, 0);
			if(totalDice > 1000) return { plain: `${message.author} might hurt themselves by rolling that many dice at once!` };

			// Roll the dice
			const rollResult = dice.roll();
			this.bot.logger.debug(rollResult);

			// Build the list of dice
			let diceList = '';
			if(totalDice <= 100 && (rollResult.diceRaw.length > 1 || (rollResult.diceRaw.length > 0 && rollResult.diceRaw[0].length > 1))) {
				diceList = rollResult.diceRaw.map((res, i) => this.bot.util.nbsp(res.length > 1 ? `${res.join(' + ')} = ${rollResult.diceSums[i]}` : res[0])).join(',   ');
			}

			if(matches[2]) {
				// Determine whether or not the target is met
				const target = parseInt(matches[3]);
				let success = false;
				let targetMessage;
				if(matches[2] === '>') {
					success = rollResult.roll > target;
					targetMessage = `${!success ? 'not' : ''} greater than ${target}`;
				} else {
					success = rollResult.roll < target;
					targetMessage = `${!success ? 'not' : ''} less than ${target}`;
				}

				const diceInfo = diceList ? `;   ${diceList}` : '';
				return {
					plain: `${message.author} has **${success ? 'succeeded' : 'failed'}**. (Rolled ${rollResult.roll}, ${targetMessage}${diceInfo})`,
					editable: false
				};
			} else {
				const diceInfo = diceList ? ` (${diceList})` : '';
				return {
					plain: `${message.author} rolled **${rollResult.roll}**.${diceInfo}`,
					editable: false
				};
			}
		} catch(err) {
			return { plain: `${message.author} specified an invalid dice expression.` };
		}
	}
}
