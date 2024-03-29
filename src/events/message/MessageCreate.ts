import { Events, Message } from "discord.js";

import Listener from "../Listener.js";

import { HybridContextMessage } from "../../commands/HybridContext.js";
import Command, { CommandArgs } from "../../commands/Command.js";

class MessageCreate extends Listener {
	public constructor() {
		super(Events.MessageCreate);
	}

	public override async execute(message: Message<true>) {
		if (message.partial) {
			try {
				message = await message.fetch();
			} catch {
				return;
			}
		}

		if (message.author.bot || !message.guild) return;

		const { guilds, users } = this.client.database;

		const guild = (await guilds.get(message.guild.id))!;

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

		if (!command) {
			return;
		}

		const args = new CommandArgs(...content);

		args.language = guild.language;
		args.prefix = guild.prefix;

		if (!(await users.get(message.author.id))) {
			await users.set(message.author.id);
		}

		command.executeMessage?.(message, args);
		command.executeHybrid?.(new HybridContextMessage(message), args);
		this.handleSubcommand(message, command, args);
	}

	public async handleSubcommand(message: Message<true>, command: Command, args: CommandArgs) {
		const {
			utils: { parseSubcommand },
		} = this.client;

		const [first, second] = args.entries.map((x) => x.toLowerCase());

		const parsed =
			parseSubcommand(command, args, { subcommand: first }) ||
			parseSubcommand(command, args, { subcommandGroup: first, subcommand: second });

		if (!parsed) {
			return;
		}

		const { entry } = parsed;

		if (entry.message) {
			const func = command[entry.message] as typeof command.executeMessage;
			await func?.bind(command)(message, args);
		}

		if (entry.hybrid) {
			const func = command[entry.hybrid] as typeof command.executeHybrid;
			await func?.bind(command)(new HybridContextMessage(message), args);
		}
	}
}

export default MessageCreate;
