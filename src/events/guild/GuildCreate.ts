import { Events, Guild } from "discord.js";
import Listener from "../Listener.js";
import i18next from "i18next";

class GuildCreate extends Listener {
	public constructor() {
		super(Events.GuildCreate);
	}

	public async execute(guild: Guild) {
		const { guilds } = this.client.managers;

		if (!(await guilds.get(guild.id))) {
			await guilds.set(guild.id, {
				language: i18next.store.data[guild.preferredLocale]
					? guild.preferredLocale
					: i18next.language,
			});
		}
	}
}

export default GuildCreate;
