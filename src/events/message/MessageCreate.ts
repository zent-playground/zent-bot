import { Events, Message } from "discord.js";

import Listener from "../Listener.js";

import { BasedHybridContext, HybridContext } from "../../commands/HybridContext.js";
import Args from "../../commands/Args.js";
import Command from "../../commands/Command.js";

class MessageCreate extends Listener {
	public constructor() {
		super(Events.MessageCreate);
	}

	public async execute(message: Message<true>) {
		if (message.author.bot || !message.guild) return;

		const { guilds, users } = this.client.managers;

		const guild = (await guilds.get(message.guildId))!;

		const prefixes: string[] = [this.client.user.toString()];

		if (process.env.NODE_ENV !== "development") {
			prefixes.push(guild.prefix);
		}

		const prefix = prefixes.find((p) => message.content.toLowerCase().startsWith(p));

		if (!prefix) return;

		const [name, ...content] = message.content.slice(prefix.length).trim().split(/ +/g);

		let command: Command | undefined;

		if (name) {
			command =
				this.client.commands.get(name.toLowerCase()) ||
				this.client.commands.find((command) => command.aliases.includes(name.toLowerCase()));
		} else if (message.content === this.client.user.toString()) {
			command = this.client.commands.get("help");
		}

		if (!command) return;

		const args = new Args(content);

		args.language = guild.language;
		args.prefix = guild.prefix;

		if (!(await users.get(message.author.id))) {
			await users.set(message.author.id, {}, { overwrite: true });
		}

		command.executeMessage?.(message, args);
		command.executeHybrid?.(new BasedHybridContext(message) as HybridContext, args);
		this.handleSubcommand(message, command, args);
	}

	public async handleSubcommand(message: Message<true>, command: Command, args: Args) {
		let [first, second] = args.entries;

		first = first?.toLowerCase();
		second = second?.toLowerCase();

		const parsed =
			this.client.utils.parseSubcommand(command, args, {
				subcommandGroup: first,
				subcommand: second,
			}) || this.client.utils.parseSubcommand(command, args, { subcommand: first });

		if (!parsed) {
			return;
		}

		const { entry } = parsed;

		if (entry.message) {
			const func = command[
				entry.message as keyof typeof command
			] as typeof command.executeMessage;

			await func?.bind(command)(message, args);
		}

		if (entry.hybrid) {
			const func = command[
				entry.hybrid as keyof typeof command
			] as typeof command.executeHybrid;

			await func?.bind(command)(new BasedHybridContext(message) as HybridContext, args);
		}
	}
}

export default MessageCreate;
