import { SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";

class Prefix extends Command {
	public constructor() {
		super({
			name: "prefix",
			description: "Prefix.",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option.setName("prefix").setDescription("Prefix to set."),
				)
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const prefixToSet = (
			args.entries[0] || ctx.interaction?.options.getString("prefix")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (prefixToSet) {
			await guilds.set(ctx.guild.id, { prefix: prefixToSet });

			await ctx.send({
				content: `Set prefix to \`${prefixToSet}\`!`,
			});
		} else {
			const { prefix } = (await guilds.get(ctx.guild.id))!;

			await ctx.send({
				content: `The current prefix is \`${prefix}\`!`,
			});
		}
	}
}

export default Prefix;
