import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import { localizations } from "../../utils/localizations.js";

class Ping extends Command {
	public constructor() {
		super({
			name: "test",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("test")
				.addChannelOption(option =>
					option.setName("c")
						.setDescription("eee")
						.addChannelTypes(ChannelType.GuildVoice)
				)
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext) {
		if (ctx.isInteraction()) {
			const channel = ctx.context.options.getChannel("c");

			await this.client.managers.voices.configurations.set(ctx.guild.id, {
				id: channel?.id
			});
		}

		await ctx.send({
			embeds: [
				new EmbedBuilder().setTitle("voice channel setup").setColor(this.client.config.colors.default),
			],
		});
	}
}

export default Ping;
