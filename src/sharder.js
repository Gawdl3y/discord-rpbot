#!/usr/bin/env node
'use babel';
'use strict';

import path from 'path';
import { ShardingManager } from 'discord.js';
import config from './config';

/* eslint-disable no-console */

const manager = new ShardingManager(path.join(__dirname, 'rpbot.js'), {
	token: config.token,
	totalShards: config.shardCount || 'auto',
	shardArgs: process.argv.slice(2)
});
manager.on('launch', shard => {
	console.log(`----- SHARD ${shard.id} LAUNCHED -----`);
});
manager.spawn().catch(console.error);
