import { ActivityType, Client, Events } from "discord.js";

import Listener from "../Listener.js";

import Logger from "../../utils/others/Logger.js";
import { startApp } from "../../api/app.js";

class Ready extends Listener {
	public constructor() {
		super(Events.ClientReady, true);
	}

	public override async execute(client: Client<true>) {
		Logger.info(`Successfully logged as '${client.user.tag}'.`);

		client.user.setPresence({
			status: "online",
			activities: [
				{
					name: "bot.zent.lol - /help",
					type: ActivityType.Custom,
				},
			],
		});

		await startApp(client);

		await client.application.commands.set(
			client.commands.map((command) => command.applicationCommands).flat(),
		);
	}
}

export default Ready;
