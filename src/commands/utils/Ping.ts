import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";

class Ping extends Command {
	public constructor() {
		super({
			name: "ping",
		});
	}

	public override initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Display bot latency.")
				.toJSON(),
		);
	}

	public override async executeHybrid(ctx: Command.HybridContext) {
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
						[
							`**API:** \`${message.createdTimestamp - ctx.createdTimestamp}\`ms`,
							`**Heartbeat:** \`${this.client.ws.ping}\`ms`,
							`**Database:** \`${await this.client.mysql.ping()}\`ms`,
						].join("\n"),
					)
					.setColor(this.client.config.colors.default),
			],
		});
	}
}

export default Ping;
