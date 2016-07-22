'use babel';
'use strict';

export const character = '\xa0';
const spacePattern = / /g;

export function convert(text) {
	return text && text.replace ? text.replace(spacePattern, character) : text;
}
export default convert;
