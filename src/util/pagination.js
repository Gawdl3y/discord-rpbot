'use babel';
'use strict';

export default function paginate(items, page, pageLength = 15) {
	if(page < 1) page = 1;
	let startIndex = (page - 1) * pageLength;
	if(startIndex > items.length) { startIndex = 0; page = 1; }
	const maxPage = Math.ceil(items.length / pageLength);
	return {
		items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
		page: page,
		maxPage: maxPage,
		pageLength: 20,
		pageText: 'page ' + page + ' of ' + maxPage
	};
}
