import { Client, Events } from "discord.js";

import Listener from "../Listener.js";

import Logger from "../../utils/Logger.js";

class Ready extends Listener {
	public constructor() {
		super(Events.ClientReady, true);
	}

	public async execute(client: Client<true>) {
		Logger.Info(`Successfully logged as '${client.user.tag}'.`);

		await client.application.commands.set(
			client.commands.map((command) => command.applicationCommands).flat(),
		);
	}
}

export default Ready;
