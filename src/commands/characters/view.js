'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class ViewCharacterCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'character',
			aliases: ['viewcharacter', 'char'],
			module: 'characters',
			memberName: 'view',
			description: 'Views a character\'s information.',
			usage: 'character <name>',
			details: 'The name can be the whole name of the character, or just a part of it.',
			examples: ['character Billy McBillface', 'character bill'],
			serverOnly: true
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const characters = await Character.findInServer(message.server, args[0]);
		if(characters.length === 1) {
			const owner = message.client.users.get('id', characters[0].owner);
			const ownerName = owner ? `${owner.name}#${owner.discriminator}` : 'Unknown';
			return `Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}`;
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.server)} to view the list of characters.`;
		}
	}
}
