'use babel';
'use strict';

export default function disambiguation(items, label, property = 'name') {
	let objectList = '';
	for(const item of items) objectList += (objectList ? ',   ' : '') + '"' + (property ? item[property] : item.toString()).replace(/ /g, '\xa0') + '"';
	return 'Multiple ' + label + ' found, please be more specific: ' + objectList;
}
