import { AuditLogEvent, Events, NonThreadGuildBasedChannel } from "discord.js";

import Listener from "../Listener.js";

class ChannelUpdate extends Listener {
	public constructor() {
		super(Events.ChannelUpdate);
	}

	public async execute(
		oldChannel: NonThreadGuildBasedChannel,
		newChannel: NonThreadGuildBasedChannel,
	) {
		const { managers, user } = this.client;
		const { voices, users } = managers;

		const auditLogs = await newChannel.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.ChannelUpdate,
		});

		if (auditLogs.entries.first()?.executor?.id === user.id) {
			return;
		}

		if (oldChannel.isVoiceBased() && newChannel.isVoiceBased()) {
			const data = await voices.get({ id: newChannel.id });

			if (data) {
				if (!(await users.get({ id: data.author_id }))) {
					await users.set({ id: data.author_id }, {});
				}

				await voices.configs.upd(
					{ id: data.author_id },
					{
						name: newChannel.name,
						nsfw: newChannel.nsfw,
					},
				);
			}
		}
	}
}

export default ChannelUpdate;
