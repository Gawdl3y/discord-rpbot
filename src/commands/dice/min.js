'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import DiceExpression from 'dice-expression-evaluator';

export default class MinRollCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'minroll';
		this.group = 'dice';
		this.groupName = 'min';
		this.description = 'Calculates the minimum possible roll for a dice expression.';
		this.usage = 'minroll <dice expression>';
		this.details = 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.';
		this.examples = ['minroll 2d20', 'minroll 3d20 - d10 + 6'];
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		try {
			const minRoll = new DiceExpression(args[0]).min();
			return `The minimum possible roll is **${minRoll}**.`;
		} catch(err) {
			return 'Invalid dice expression specified.';
		}
	}
}
