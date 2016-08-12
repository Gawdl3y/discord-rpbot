'use babel';
'use strict';

import stringArgv from 'string-argv';
import { stripIndents } from 'common-tags';
import commands from './';
import config from '../config';
import Channel from '../database/channel';
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
	// Make sure the bot is allowed to run in the channel
	if(message.server && Channel.serverHasAny(message.server) && !Channel.serverHas(message.server, message.channel)) return;

	// Parse the message, and get the old result if it exists
	const [command, args, fromPattern, isCommandMessage] = parseMessage(message);
	const oldResult = oldMessage ? commandResults[oldMessage.id] : null;

	// Run the command, or make an error message result
	let result;
	if(command) {
		if(!oldMessage || oldResult) result = makeResultObject(await run(command, args, fromPattern, message));
	} else if(isCommandMessage) {
		result = { reply: `Unknown command. Use ${usage('help', message.server)} to view the list of all commands.`, editable: true };
	} else if(config.nonCommandEdit) {
		result = {};
	}

	if(result) {
		// Change a plain or reply response into direct if there isn't a server
		if(!message.server) {
			if(!result.direct) result.direct = result.plain || result.reply;
			delete result.plain;
			delete result.reply;
		}

		// Update old messages or send new ones
		if(oldResult && (oldResult.plain || oldResult.reply || oldResult.direct)) {
			await updateMessages(message, result, oldResult);
		} else {
			await sendMessages(message, result);
		}

		// Cache the result
		if(config.commandEditable > 0) {
			if(result.editable) {
				result.timeout = oldResult && oldResult.timeout ? oldResult.timeout : setTimeout(() => { delete commandResults[message.id]; }, config.commandEditable * 1000);
				commandResults[message.id] = result;
			} else {
				delete commandResults[message.id];
			}
		}
	}
}

// Run a command
export async function run(command, args, fromPattern, message) {
	const logInfo = {
		args: String(args),
		user: `${message.author.username}#${message.author.discriminator}`,
		userID: message.author.id,
		server: message.server ? message.server.name : null,
		serverID: message.server ? message.server.id : null
	};

	// Make sure the command is usable
	if(command.serverOnly && !message.server) {
		logger.info(`Not running ${command.group}:${command.groupName}; server only.`, logInfo);
		return `The \`${command.name}\` command must be used in a server channel.`;
	}
	if(command.isRunnable && !command.isRunnable(message)) {
		logger.info(`Not running ${command.group}:${command.groupName}; not runnable.`, logInfo);
		return `You do not have permission to use the \`${command.name}\` command.`;
	}

	// Run the command
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
}

// Get a result object from running a command
export function makeResultObject(result) {
	if(typeof result !== 'object') result = { reply: result };
	if(!('editable' in result)) result.editable = true;
	if(result.plain && result.reply) throw new Error('The command result may contain either "plain" or "reply", not both.');
	return result;
}

// Send messages for a result
export async function sendMessages(message, result) {
	const messages = await Promise.all([
		result.plain ? message.client.sendMessage(message, result.plain) : null,
		result.reply ? message.reply(result.reply) : null,
		result.direct ? message.client.sendMessage(message.author, result.direct) : null
	]);
	if(result.plain) result.normalMessage = messages[0];
	else if(result.reply) result.normalMessage = messages[1];
	if(result.direct) result.directMessage = messages[2];
}

// Update old messages to reflect a new result
export async function updateMessages(message, result, oldResult) {
	// Update the messages
	const messages = await Promise.all([
		result.plain || result.reply ? oldResult.normalMessage.update(result.plain ? result.plain : `${message.author}, ${result.reply}`) : null,
		result.direct ? oldResult.direct ? oldResult.directMessage.update(result.direct) : message.client.sendMessage(message.author, result.direct) : null
	]);
	if(result.plain || result.reply) result.normalMessage = messages[0];
	if(result.direct) result.directMessage = messages[1];

	// Delete old messages if we're not using them
	if(!result.plain && !result.reply && (oldResult.plain || oldResult.reply)) oldResult.normalMessage.delete();
	if(!result.direct && oldResult.direct) oldResult.directMessage.delete();
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
	let [command, args, isCommandMessage] = matchDefault(message, serverCommandPatterns[patternIndex], 2);
	if(!command && !message.server) [command, args, isCommandMessage] = matchDefault(message, unprefixedCommandPattern);
	if(command) return [command, args, false, true];

	return [null, null, false, isCommandMessage];
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
		return [null, null, true];
	}
	return [null, null, false];
}
