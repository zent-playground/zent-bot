import {
	AuditLogEvent,
	EmbedBuilder,
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
		const {
			config,
			managers: { voices, users },
			user,
		} = this.client;

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

				const creator = (await voices.creators.get({ id: data.creator_channel_id }))!;

				if (!creator.allow_custom_name) {
					await channel.setName(
						entry.changes.filter((change) => change.key == "name")[0].old as string,
					);

					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${config.emojis.warn} Disallowed Change!`)
								.setDescription(`${entry.executor} channel name changes are not allowed!`)
								.setColor(config.colors.warn),
						],
					});

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
