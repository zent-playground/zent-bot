import {
	AuditLogEvent,
	Guild,
	GuildAuditLogsEntry,
	NonThreadGuildBasedChannel,
} from "discord.js";
import Listener from "../Listener.js";
import { TempVoiceConfig } from "../../types/database.js";

class GuildAuditLogEntryCreate extends Listener {
	public constructor() {
		super("guildAuditLogEntryCreate");
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async execute(entry: GuildAuditLogsEntry, guild: Guild) {
		const { managers, user } = this.client;
		const { voices, users } = managers;

		if (entry.executorId === user.id) {
			return;
		}

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

				const partialConfigs: Partial<TempVoiceConfig> = {
					name: channel.name,
					nsfw: channel.nsfw,
				};

				if (!(await users.get({ id: data.author_id }))) {
					await users.set({ id: data.author_id }, {});
				}

				await voices.configs[
					(await voices.configs.get({ id: data.author_id })) !== null ? "upd" : "set"
				](
					{
						id: data.author_id,
					},
					partialConfigs,
				);

				break;
			}
		}
	}
}

export default GuildAuditLogEntryCreate;
