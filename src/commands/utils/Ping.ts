import { SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";

class Ping extends Command {
	public constructor() {
		super({
			name: "ping",
			description: "Displays bot latency.",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder().setName(this.name).setDescription(this.description).toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext) {
		const message = await ctx.send({ content: "Pinging..." });

		await message.edit({
			content: `Pong! API: \`${message.createdTimestamp - ctx.createdTimestamp}\`ms - Heartbeat: \`${this.client.ws.ping}\`ms!`,
		});
	}
}

export default Ping;
