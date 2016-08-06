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

	// Get the result for the message
	let result;
	if(command) {
		if(!oldMessage || oldResult) result = await run(command, args, fromPattern, message);
	} else if(isCommandMessage) {
		result = `Unknown command. Use ${usage('help', message.server)} to view the list of all commands.`;
	} else if(config.nonCommandEdit) {
		result = {};
	}

	if(result) {
		if(typeof result !== 'object') result = { reply: result };
		if(!('editable' in result)) result.editable = true;
		if(result.reply && result.plain) throw new Error('The command result may contain either "plain" or "reply", not both.');

		// Update old messages or send new ones
		if(oldResult && (oldResult.plain || oldResult.reply || oldResult.direct)) {
			await updateOldMessages(message, result, oldResult);
		} else {
			if(result.plain) result.plainMessage = await message.client.sendMessage(message, result.plain);
			if(result.reply) result.replyMessage = await message.reply(result.reply);
			if(result.direct) result.directMessage = await message.client.sendMessage(message.author, result.direct);
		}

		// Cache the result
		if(config.commandEditable > 0 && result.editable) {
			result.timeout = oldResult && oldResult.timeout ? oldResult.timeout : setTimeout(() => { delete commandResults[message.id]; }, config.commandEditable * 1000);
			commandResults[message.id] = result;
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
	// Update the messages
	const allUpdatable = [];
	if(result.plain) result.plainMessage = await updatableMessage('plain', oldResult, allUpdatable).update(result.plain);
	if(result.reply) result.replyMessage = await updatableMessage('reply', oldResult, allUpdatable).update(`${message.author}, ${result.reply}`);
	if(result.direct) {
		if(!oldResult.direct) {
			result.directMessage = await message.client.sendMessage(message.author, result.direct);
		} else {
			result.directMessage = await updatableMessage('direct', oldResult, allUpdatable).update(result.direct);
		}
	}

	// Delete old messages if we're not using them
	if(oldResult.plain && !allUpdatable.includes('plain')) oldResult.plainMessage.delete();
	if(oldResult.reply && !allUpdatable.includes('reply')) oldResult.replyMessage.delete();
	if(oldResult.direct && !allUpdatable.includes('direct')) oldResult.directMessage.delete();
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

// Get the message to update
export function updatableMessage(type, result, all = null) {
	if(result[type]) {
		if(all) all.push(type);
		return result[`${type}Message`];
	}
	if(result.plain) {
		if(all) all.push('plain');
		return result.plainMessage;
	}
	if(result.reply) {
		if(all) all.push('reply');
		return result.replyMessage;
	}
	if(result.direct) {
		if(all) all.push('direct');
		return result.directMessage;
	}
	return null;
}
