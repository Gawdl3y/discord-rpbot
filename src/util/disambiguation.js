'use babel';
'use strict';

import nbsp from './nbsp';

export default function disambiguation(items, label, property = 'name') {
	let objectList = '';
	for(const item of items) objectList += (objectList ? ',   ' : '') + '"' + nbsp(property ? item[property] : item.toString()) + '"';
	return 'Multiple ' + label + ' found, please be more specific: ' + objectList;
}
