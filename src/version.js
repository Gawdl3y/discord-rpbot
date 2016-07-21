'use babel';
'use strict';

import { readFileSync } from 'fs';

export const version = JSON.parse(readFileSync(__dirname + '/../package.json')).version;
export default version;
