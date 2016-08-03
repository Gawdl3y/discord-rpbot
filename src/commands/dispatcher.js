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
export const commandResults = {};

// Handle a raw message
export async function handleMessage(message, oldMessage = null) {
	const [command, args, fromPattern, isCommandMessage] = parseMessage(message);
	const oldResult = oldMessage ? commandResults[oldMessage.id] : null;

	if(!oldResult || oldResult.editable) {
		let result;
		if(command) {
			if(!oldMessage || oldResult) result = await run(command, args, fromPattern, message);
		} else if(isCommandMessage) {
			result = `Unknown command. Use ${usage('help', message.server)} to view the list of all commands.`;
		}

		if(result) {
			if(typeof result !== 'object') result = { reply: result };
			if(!('editable' in result)) result.editable = true;

			// Update old messages or send new ones
			if(oldResult) {
				await updateOldMessages(message, result, oldResult);
			} else {
				if(result.reply) result.replyMessage = await message.reply(result.reply);
				if(result.plain) result.plainMessage = await message.client.sendMessage(message, result.plain);
				if(result.direct) result.directMessage = await message.client.sendMessage(message.author, result.direct);
			}

			// Cache the result
			commandResults[message.id] = result;
			setTimeout(() => { delete commandResults[message.id]; }, config.commandEditable * 1000);
		}
	}
}

// Run a command
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

// Update old messages to reflect a new result
export async function updateOldMessages(message, result, oldResult) {
	// Regular message
	if(result.plain) {
		result.plainMessage = await oldResult[oldResult.plain ? 'plainMessage' : 'replyMessage'].update(result.plain);
	} else if(oldResult.plain && !result.reply) {
		oldResult.plainMessage.delete();
	}

	// Reply message
	if(result.reply) {
		result.replyMessage = await oldResult[oldResult.reply ? 'replyMessage' : 'plainMessage'].update(`${message.author}, ${result.reply}`);
	} else if(oldResult.reply && !result.plain) {
		oldResult.replyMessage.delete();
	}

	// Direct message
	if(result.direct) {
		result.directMessage = await oldResult.directMessage.update(result.direct);
	} else if(oldResult.direct) {
		oldResult.directMessage.delete();
	}
}

// Get an array of metadata for a command in a message
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
export function matchDefault(message, pattern, commandNameIndex = 1) {
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
