import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildCreate extends Listener {
	public constructor() {
		super(Events.GuildAvailable);
	}

	public override async execute(guild: Guild) {
		const { guilds } = this.client.database;

		if (!(await guilds.get({ id: guild.id }))) {
			await guilds.set({ id: guild.id }, {});
		}
	}
}

export default GuildCreate;
