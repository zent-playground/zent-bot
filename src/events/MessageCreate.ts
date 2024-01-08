import { Message } from "discord.js";

import Listener from "./Listener.js";
import { BasedHybridContext, HybridContext } from "../commands/HybridContext.js";
import Args from "../commands/Args.js";
import Command from "../commands/Command.js";

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

		const commandArgs = new Args(args);

		command.executeMessage?.(message, commandArgs);
		command.executeHybrid?.(new BasedHybridContext(message) as HybridContext, commandArgs);
		this.handleSubcommand(message, command, commandArgs);
	}

	public async handleSubcommand(message: Message<true>, command: Command, commandArgs: Args) {
		let [subcommand, subcommandGroup] = commandArgs.entries;

		subcommand = subcommand?.toLowerCase();
		subcommandGroup = subcommandGroup?.toLowerCase();

		const parsed =
			this.client.utils.parseSubcommand(command, { subcommand, subcommandGroup }) ||
			this.client.utils.parseSubcommand(command, { subcommand });

		if (!parsed) {
			return;
		}

		const { entry, parent, args } = parsed;

		args.entries = commandArgs.entries;

		if (subcommand === entry.name) {
			args.entries = args.entries.slice(1);
		}

		if (subcommandGroup === parent.name && parent.type === "subcommand-group") {
			args.entries = args.entries.slice(1);
		}

		if (entry.message) {
			const func = command[entry.name as keyof typeof command] as typeof command.executeMessage;
			await func?.bind(command)(message, args);
		}

		if (entry.hybrid) {
			const func = command[entry.name as keyof typeof command] as typeof command.executeHybrid;
			await func?.bind(command)(new BasedHybridContext(message) as HybridContext, args);
		}
	}
}

export default MessageCreate;
