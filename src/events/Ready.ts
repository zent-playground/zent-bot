import { Client } from "discord.js";
import Listener from "./Listener.js";

class Ready extends Listener {
	public constructor() {
		super("ready", true);
	}

	public async execute(client: Client<true>) {
		console.log(`Successfully logged as '${client.user.tag}'.`);
		
		client.application.commands.set(
			client.commands.map((command) => command.applicationCommands).flat(),
		);
	}
}

export default Ready;
