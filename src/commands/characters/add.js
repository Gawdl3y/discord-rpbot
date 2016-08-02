'use babel';
'use strict';

import stringArgv from 'string-argv';
import Character from '../../database/character';
import CommandFormatError from '../../util/errors/command-format';

const newlinesPattern = /\n/g;
const newlinesReplacement = '{!~NL~!}';
const newlinesReplacementPattern = new RegExp(newlinesReplacement, 'g');
const extraNewlinesPattern = /\n{3,}/g;
const mentionsPattern = /@everyone|@here|<@!?&?[0-9]+>/i;

export default {
	name: 'addcharacter',
	aliases: ['addchar'],
	group: 'characters',
	groupName: 'add',
	description: 'Adds a character to the database, or updates the existing one.',
	usage: 'addcharacter <name> <info>',
	details: 'The character name can be a maximum of 60 characters long, and must be surrounded by quotes if it contains spaces. The information doesn\'t have to be a single line. Only the owner of the character and administrators/moderators may update it.',
	examples: ['addcharacter Bob Just your average guy.', 'addcharacter "Billy McBillface" A really cool guy who enjoys his chicken tendies.'],
	singleArgument: true,

	isRunnable(message) {
		return !!message.server;
	},

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this);
		if(mentionsPattern.test(args[0])) {
			message.reply('Please do not use mentions in your character name or information.');
			return;
		}

		// Extract the name and info
		const newlinesReplaced = args[0].replace(newlinesPattern, newlinesReplacement);
		const argv = stringArgv(newlinesReplaced);
		const name = argv.shift().trim();
		const info = argv.join(' ').replace(newlinesReplacementPattern, '\n').replace(extraNewlinesPattern, '\n\n');

		// Apply some restrictions
		if(!info) throw new CommandFormatError(this);
		if(name.length > 60) {
			message.reply('A character\'s name may not be longer than 60 characters.');
			return;
		}
		if(name.includes('\n')) {
			message.reply('A character\'s name may not have multiple lines.');
			return;
		}

		// Add or update the character
		const result = await Character.save(new Character(message.server, message.author, name, info));
		if(result) {
			message.reply(`${result.new ? 'Added' : 'Updated'} character "${name}".`);
		} else {
			message.reply(`Unable to update character "${name}". You are not the owner.`);
		}
	}
};
