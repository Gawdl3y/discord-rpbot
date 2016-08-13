'use babel';
'use strict';

import DiceExpression from 'dice-expression-evaluator';
import CommandFormatError from '../../util/errors/command-format';

export default {
	name: 'minroll',
	group: 'dice',
	groupName: 'min',
	description: 'Calculates the minimum possible roll for a dice expression.',
	usage: 'minroll <dice expression>',
	details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
	examples: ['minroll 2d20', 'minroll 3d20 - d10 + 6'],

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		try {
			const minRoll = new DiceExpression(args[0]).min();
			return `The minimum possible roll is **${minRoll}**.`;
		} catch(err) {
			return 'Invalid dice expression specified.';
		}
	}
};
