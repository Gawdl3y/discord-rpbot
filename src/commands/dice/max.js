'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import DiceExpression from 'dice-expression-evaluator';

export default class MaxRollCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'maxroll';
		this.group = 'dice';
		this.groupName = 'max';
		this.description = 'Calculates the maximum possible roll for a dice expression.';
		this.usage = 'maxroll <dice expression>';
		this.details = 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.';
		this.examples = ['maxroll 2d20', 'maxroll 3d20 - d10 + 6'];
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		try {
			const maxRoll = new DiceExpression(args[0]).max();
			return `The maximum possible roll is **${maxRoll}**.`;
		} catch(err) {
			return 'Invalid dice expression specified.';
		}
	}
}
