'use babel';
'use strict';

export default function sendCharacterDisambiguation(characters, message) {
	let characterList = '';
	for(const character of characters) characterList += (characterList ? ',   ' : '') + '"' + character.name.replace(/ /g, '\xa0') + '"';
	message.client.reply(message, 'Multiple characters found, please be more specific: ' + characterList);
}
