'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';

export default class DeleteCharacterCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'deletecharacter';
		this.aliases = ['removecharacter', 'delchar', 'rmchar'];
		this.group = 'characters';
		this.groupName = 'delete';
		this.description = 'Deletes a character from the database.';
		this.usage = 'deletecharacter <name>';
		this.details = 'The name can be the whole name of the character, or just a part of it. Only the owner of the character and administrators/moderators may delete it.';
		this.examples = ['deletecharacter Billy McBillface', 'deletecharacter bill'];
		this.serverOnly = true;
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const characters = await Character.findInServer(message.server, args[0]);
		if(characters.length === 1) {
			if(await Character.delete(characters[0])) {
				return `Deleted character "${characters[0].name}".`;
			} else {
				return `Unable to delete character "${characters[0].name}". You are not the owner.`;
			}
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.server)} to view the list of characters.`;
		}
	}
}
