import { ActivityType, Client, Events } from "discord.js";

import Listener from "../Listener.js";

import Logger from "../../utils/others/Logger";
import { startApp } from "../../api/app.js";

class Ready extends Listener {
	public constructor() {
		super(Events.ClientReady, true);
	}

	public async execute(client: Client<true>) {
		startApp(client);

		Logger.info(`Successfully logged as '${client.user.tag}'.`);

		client.application.commands.set(
			client.commands.map((command) => command.applicationCommands).flat(),
		);

		client.user.setPresence({
			status: "online",
			activities: [
				{
					name: "bot.zent.lol - /help",
					type: ActivityType.Custom,
				},
			],
		});
	}
}

export default Ready;
