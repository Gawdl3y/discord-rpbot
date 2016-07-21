'use babel';
'use strict';

export default function search(items, search, startsWith = false, property = 'name') {
	if(!items || items.length === 0) return [];
	if(!search) return items;

	// Find all items that match the search string
	const lowercaseSearch = search.toLowerCase();
	let matchedItems;
	if(startsWith && search.length === 1) {
		matchedItems = items.filter(element => (property ? element[property] : element.toString()).toLowerCase().startsWith(lowercaseSearch));
	} else {
		matchedItems = items.filter(element => (property ? element[property] : element.toString()).toLowerCase().includes(lowercaseSearch));
	}

	// See if any are an exact match
	if(matchedItems.length > 1) {
		const exactItems = matchedItems.filter(element => (property ? element[property] : element.toString()).toLowerCase() === lowercaseSearch);
		if(exactItems.length > 0) return exactItems;
	}

	return matchedItems;
}
