import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

import Command from "../Command.js";

class Banner extends Command {
	public constructor() {
		super({
			name: "banner",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName("banner")
				.setDescription("Display user banner.")
				.addUserOption((option) => option.setName("user").setDescription("Choose a user."))
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext, args: Command.Args) {
		const { parseId } = ctx.client.utils;

		const user = await this.client.users
			.fetch(
				parseId(args[0]) || ctx.interaction?.options.getUser("user")?.id || ctx.author.id,
				{ force: true },
			)
			.catch(() => null);

		if (!user) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("Invalid user provided!")
						.setColor(this.client.config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: user.tag,
				iconURL: user.displayAvatarURL(),
			})
			.setTitle("Member banner")
			.setColor(user.hexAccentColor!)
			.setTimestamp();

		if (user.banner) {
			embed.setImage(user.bannerURL({ size: 4096 })!);
		} else if (user.accentColor) {
			embed.setImage(
				`https://singlecolorimage.com/get/${user.hexAccentColor?.substring(1)}/600x240`,
			);
		} else {
			embed.setDescription("Cannot display this user banner.");
		}

		await ctx.send({
			embeds: [embed],
		});
	}
}

export default Banner;
