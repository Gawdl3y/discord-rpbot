'use babel';
'use strict';

export default function paginate(items, page, pageLength = 15) {
	const maxPage = Math.ceil(items.length / pageLength);
	if(page < 1) page = 1;
	if(page > maxPage) page = maxPage;
	let startIndex = (page - 1) * pageLength;
	return {
		items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
		page: page,
		maxPage: maxPage,
		pageLength: 20,
		pageText: `page ${page} of ${maxPage}`
	};
}
