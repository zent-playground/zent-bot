import { Message } from "discord.js";

import Listener from "./Listener.js";
import { BasedHybridContext, HybridContext } from "../commands/HybridContext.js";

class MessageCreate extends Listener {
	public constructor() {
		super("messageCreate");
	}

	public async execute(message: Message<true>) {
		if (message.author.bot || !message.guild) return;

		const prefixes = ["z", this.client.user.toString()];
		const prefix = prefixes.find((p) => message.content.toLowerCase().startsWith(p));

		if (!prefix) return;

		const [name, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		let command;

		if (name) {
			command =
				this.client.commands.get(name.toLowerCase()) ||
				this.client.commands.find((command) => command.aliases.includes(name));
		} else if (message.content === this.client.user.toString()) {
			command = this.client.commands.get("help");
		}

		if (!command) return;

		command.executeMessage?.(message, args);
		command.executeHybrid?.(new BasedHybridContext(message) as HybridContext, args);
	}
}

export default MessageCreate;
