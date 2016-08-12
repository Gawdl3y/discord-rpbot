'use babel';
'use strict';

export default function search(items, searchString, { property = 'name', searchInexact = true, searchExact = true, useStartsWith = false } = {}) {
	if(!items || items.length === 0) return [];
	if(!searchString) return items;

	const lowercaseSearch = searchString.toLowerCase();
	let matchedItems;

	// Find all items that start with or include the search string
	if(searchInexact) {
		if(useStartsWith && searchString.length === 1) {
			matchedItems = items.filter(element => String(property ? element[property] : element)
				.normalize('NFKD')
				.toLowerCase()
				.startsWith(lowercaseSearch)
			);
		} else {
			matchedItems = items.filter(element => String(property ? element[property] : element)
				.normalize('NFKD')
				.toLowerCase()
				.includes(lowercaseSearch)
			);
		}
	} else {
		matchedItems = items;
	}

	// See if any are an exact match
	if(searchExact && matchedItems.length > 1) {
		const exactItems = matchedItems.filter(element => String(property ? element[property] : element).normalize('NFKD').toLowerCase() === lowercaseSearch);
		if(exactItems.length > 0) return exactItems;
	}

	return matchedItems;
}
