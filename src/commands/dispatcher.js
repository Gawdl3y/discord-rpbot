'use babel';
'use strict';

import stringArgv from 'string-argv';
import { stripIndents } from 'common-tags';
import commands from './';
import config from '../config';
import buildCommandPattern from '../util/command-pattern';
import usage from '../util/command-usage';
import logger from '../util/logger';
import * as analytics from '../util/analytics';
import FriendlyError from '../util/errors/friendly';

export const serverCommandPatterns = {};
export const unprefixedCommandPattern = /^([^\s]+)/i;
export const previousCommandMessages = new Map();

export async function handleMessage(message, oldMessage = null) {
	const [command, args, fromPattern, isCommandMessage] = parseMessage(message);
	const oldReply = oldMessage ? previousCommandMessages.get(oldMessage.id) : null;

	let result;
	if(command) {
		if(!oldMessage || oldReply) result = await run(command, args, fromPattern, message);
	} else if(isCommandMessage) {
		result = `Unknown command. Use ${usage('help', message.server)} to view the list of all commands.`;
	}

	if(result) {
		// Update old message or send a new one
		let reply;
		if(oldReply) {
			reply = await oldReply.update(result.content ? result.content : result);
		} else if(typeof result.reply === 'undefined' || result.reply) {
			reply = await message.reply(result.content ? result.content : result);
		} else {
			reply = await message.client.sendMessage(message, result.content ? result.content : result);
		}

		// Cache the reply message
		if(reply && !oldMessage) {
			previousCommandMessages.set(message.id, reply);
			setTimeout(() => { previousCommandMessages.delete(message.id); }, 30000);
		}
	}
}

export async function run(command, args, fromPattern, message) {
	const logInfo = {
		args: args.toString(),
		user: `${message.author.username}#${message.author.discriminator}`,
		userID: message.author.id,
		server: message.server ? message.server.name : null,
		serverID: message.server ? message.server.id : null
	};

	if(command.isRunnable(message)) {
		logger.info(`Running ${command.group}:${command.groupName}.`, logInfo);
		analytics.sendEvent('Command', 'run', `${command.group}:${command.groupName}`);
		try {
			return await command.run(message, args, fromPattern);
		} catch(err) {
			if(err instanceof FriendlyError) {
				return err.message;
			} else {
				logger.error(err);
				analytics.sendException(err);
				const owner = config.owner ? message.client.users.get('id', config.owner) : null;
				return stripIndents`
					An error occurred while running the command: \`${err.name}: ${err.message}\`
					${owner ? `Please contact ${owner.name}#${owner.discriminator}${config.invite ? ` in this server: ${config.invite}` : '.'}` : ''}
				`;
			}
		}
	} else {
		logger.info(`Not running ${command.group}:${command.groupName}; not runnable.`, logInfo);
		return `The \`${command.name}\` command is not currently usable in your context.`;
	}
}

export function parseMessage(message) {
	// Find the command to run by patterns
	for(const command of commands) {
		if(!command.patterns) continue;
		for(const pattern of command.patterns) {
			const matches = pattern.exec(message.content);
			if(matches) return [command, matches, true, true];
		}
	}

	// Find the command to run with default command handling
	const patternIndex = message.server ? message.server.id : '-';
	if(!serverCommandPatterns[patternIndex]) serverCommandPatterns[patternIndex] = buildCommandPattern(message.server, message.client.user);
	let [command, args] = matchDefault(message, serverCommandPatterns[patternIndex], 2);
	if(!command && !message.server) [command, args] = matchDefault(message, unprefixedCommandPattern);
	if(command) return [command, args, false, true];

	return [null, null, false, false];
}

// Find the command from a default matches pattern
function matchDefault(message, pattern, commandNameIndex = 1) {
	const matches = pattern.exec(message.content);
	if(matches) {
		const commandName = matches[commandNameIndex].toLowerCase();
		const command = commands.find(cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.some(alias => alias === commandName)));
		if(command && !command.disableDefault) {
			const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
			return [command, !command.singleArgument ? stringArgv(argString) : [argString.trim()]];
		}
	}
	return [null, null];
}
