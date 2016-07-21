'use babel';
'use strict';

export default function sendDisambiguationMessage(message, label, items, property = 'name') {
	let objectList = '';
	for(const item of items) objectList += (objectList ? ',   ' : '') + '"' + (property ? item[property] : item.toString()).replace(/ /g, '\xa0') + '"';
	message.client.reply(message, 'Multiple ' + label + ' found, please be more specific: ' + objectList);
}
