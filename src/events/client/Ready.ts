import { Client, Events } from "discord.js";

import Listener from "../Listener.js";

import Logger from "../../utils/Logger.js";
import { startApp } from "../../api/app.js";

class Ready extends Listener {
	public constructor() {
		super(Events.ClientReady, true);
	}

	public async execute(client: Client<true>) {
		Logger.info(`Successfully logged as '${client.user.tag}'.`);

		await client.application.commands.set(
			client.commands.map((command) => command.applicationCommands).flat(),
		);

		await startApp(client);
	}
}

export default Ready;
