'use babel';
'use strict';

import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

export const version = JSON.parse(readFileSync(pathJoin(__dirname, '../package.json'))).version;
export default version;
