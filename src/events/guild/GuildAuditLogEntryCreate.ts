import { Guild, GuildAuditLogsEntry } from "discord.js";

import Listener from "../Listener.js";

class GuildAuditLogEntryCreate extends Listener {
	public constructor() {
		super("guildAuditLogEntryCreate");
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async execute(entry: GuildAuditLogsEntry, guild: Guild) {
		const { user } = this.client;

		if (entry.executorId === user.id) {
			return;
		}
	}
}

export default GuildAuditLogEntryCreate;
