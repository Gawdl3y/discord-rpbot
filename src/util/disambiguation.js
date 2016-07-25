'use babel';
'use strict';

import nbsp from './nbsp';

export default function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${nbsp(property ? item[property] : item)}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}
