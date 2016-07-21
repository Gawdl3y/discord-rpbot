'use babel';
'use strict';

import { LocalStorage } from 'node-localstorage';
import config from '../config';

export const storage = new LocalStorage(config.storage);
export default storage;
