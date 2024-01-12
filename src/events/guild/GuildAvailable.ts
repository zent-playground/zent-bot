import { Events, Guild } from "discord.js";
import Listener from "../Listener.js";

class GuildCreate extends Listener {
	public constructor() {
		super(Events.GuildAvailable);
	}

	public async execute(guild: Guild) {
		const { guilds } = this.client.managers;

		if (!(await guilds.get(guild.id))) {
			await guilds.set(guild.id, { language: /^(en|vi|fr)$/.test(guild.preferredLocale) ? guild.preferredLocale : "en" });
		}
	}
}

export default GuildCreate;
