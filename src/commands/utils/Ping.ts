import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";

class Ping extends Command {
	public constructor() {
		super({
			name: "ping",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Display bot latency.")
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext) {
		const message = await ctx.send({
			embeds: [
				new EmbedBuilder().setTitle("Pinging...").setColor(this.client.config.colors.default),
			],
		});

		await message.edit({
			embeds: [
				new EmbedBuilder()
					.setTitle("Pong!")
					.setDescription(
						`API: \`${message.createdTimestamp - ctx.createdTimestamp}\`ms\nHeartbeat: \`${
							this.client.ws.ping
						}\`ms\nDatabase: \`${await this.client.mysql.ping()}\`ms`,
					)
					.setColor(this.client.config.colors.default),
			],
		});
	}
}

export default Ping;
