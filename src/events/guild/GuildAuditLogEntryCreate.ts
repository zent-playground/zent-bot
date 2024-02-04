import {
	AuditLogEvent,
	Guild,
	GuildAuditLogsEntry,
	NonThreadGuildBasedChannel,
} from "discord.js";
import Listener from "../Listener.js";

class GuildAuditLogEntryCreate extends Listener {
	public constructor() {
		super("guildAuditLogEntryCreate");
	}

	public async execute(entry: GuildAuditLogsEntry, guild: Guild) {
		const { managers, user } = this.client;
		const { voices, users } = managers;

		if (entry.executorId === user.id) {
			return;
		}

		guild; // used to remove eslint error;

		switch (entry.action) {
			case AuditLogEvent.ChannelUpdate: {
				const channel = entry.target as NonThreadGuildBasedChannel;

				if (!channel.isVoiceBased()) {
					return;
				}

				const data = await voices.get({ id: channel.id });

				if (!data) {
					return;
				}

				if (!(await users.get({ id: data.author_id }))) {
					await users.set({ id: data.author_id }, {});
				}

				await voices.configs.upd(
					{
						id: data.author_id,
					},
					{
						name: channel.name,
						nsfw: channel.nsfw,
					},
				);

				break;
			}
		}
	}
}

export default GuildAuditLogEntryCreate;
