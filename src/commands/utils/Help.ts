import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";

class Help extends Command {
	public constructor() {
		super({
			name: "help",
		});
	}

	public override initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Get some information about me.")
				.toJSON(),
		);
	}

	public override async executeHybrid(ctx: Command.HybridContext) {
		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setTitle("Overview")
					.setDescription("Hi, I'm Zent! A cute, powerful Discord bot Ò w Ó")
					.setFields(
						{
							name: "Commands:",
							value: [
								"> - Use `/commands` to see all commands.",
								"> - Use `/help [command]` to see information about a command.",
							].join("\n"),
						},
						{
							name: "Useful link:",
							value: [
								"> - Discord server: https://discord.gg/mk7QrzZaPh",
								"> - Website: https://zent.lol",
								"> - Bot dashboard: https://bot.zent.lol/dashboard",
							].join("\n"),
						},
					)
					.setColor(ctx.client.config.colors.default),
			],
		});
	}
}

export default Help;
