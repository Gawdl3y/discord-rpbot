'use babel';
'use strict';

export const character = '\xa0';
const spacePattern = / /g;

export function convert(text) {
	return String(text).replace(spacePattern, character);
}
export default convert;
