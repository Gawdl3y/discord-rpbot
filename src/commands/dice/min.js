'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import DiceExpression from 'dice-expression-evaluator';

export default class MinRollCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'min-roll',
			module: 'dice',
			memberName: 'min',
			description: 'Calculates the minimum possible roll for a dice expression.',
			usage: 'min-roll <dice expression>',
			details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
			examples: ['min-roll 2d20', 'min-roll 3d20 - d10 + 6']
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		try {
			const minRoll = new DiceExpression(args[0]).min();
			return `The minimum possible roll is **${minRoll}**.`;
		} catch(err) {
			return 'Invalid dice expression specified.';
		}
	}
}
