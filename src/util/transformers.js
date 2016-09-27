import bot from '../bot';

export async function ownerIdToName(message, ownerId) {
	let ownerName;
	try {
		const owner = await message.client.fetchUser(ownerId);
		ownerName = `${owner.username}#${owner.discriminator}`;
		try {
			const member = await message.guild.fetchMember(owner);
			if(member.nickname) ownerName = `${member.nickname} (${ownerName})`;
		} catch(err2) {
			// do nothing
		}
		ownerName = bot.util.escapeMarkdown(ownerName);
	} catch(err) {
		ownerName = 'Unknown';
	}
	return ownerName;
}

export function ownerNameToId(message, ownerName) {
	if(bot.util.patterns.anyUserMentions.test(ownerName)) {
		return /<@!?([0-9]*)>/.exec(ownerName)[1];
	}

	ownerName = ownerName.split('#');
	try {
		const owner = message.client.users.find((user) => user.username === ownerName[0] && user.discriminator === ownerName[1]);
		return owner.id;
	} catch(err) {
		throw new Error('Unable to find a user with that username and discriminator combination.');
	}
}
