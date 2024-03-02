import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildCreate extends Listener {
	public constructor() {
		super(Events.GuildCreate);
	}

	public override async execute(guild: Guild) {
		const { guilds } = this.client.database;

		if (!(await guilds.get(guild.id))) {
			await guilds.set(guild.id);
		}
	}
}

export default GuildCreate;
