import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";

class Help extends Command {
	public constructor() {
		super({
			name: "help",
			description: "Get information about me.",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder().setName(this.name).setDescription(this.description).toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext) {
		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setTitle("Overview")
					.setDescription("Hi, I'm Zent! A powerful cute Discord bot Ò w Ó")
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
					),
			],
		});
	}
}

export default Help;
