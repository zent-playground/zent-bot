import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";

class Avatar extends Command {
	public constructor() {
		super({
			name: "avatar",
			aliases: ["av", "pfp"],
			subcommands: [
				{
					name: "user",
					hybrid: "user",
					default: true,
				},
				{
					name: "member",
					hybrid: "member",
				},
			],
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Display a user/member avatar.")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("user")
						.setDescription("Display a user avatar.")
						.addUserOption((option) =>
							option.setName("user").setDescription("Choose a user."),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("member")
						.setDescription("Display a member avatar")
						.addUserOption((option) =>
							option.setName("member").setDescription("Choose a member."),
						),
				)
				.toJSON(),
		);
	}

	public async user(ctx: Command.HybridContext, args: Command.Args) {
		const { parseId } = this.client.utils;

		const user = await this.client.users
			.fetch(
				parseId(args[0]) ||
					ctx.interaction?.options.getUser("user")?.id ||
					ctx.author.id,
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

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
					.setTitle("User avatar")
					.setImage(user.displayAvatarURL({ size: 4096 }))
					.setColor(user.hexAccentColor!)
					.setTimestamp(),
			],
		});
	}

	public async member(ctx: Command.HybridContext, args: Command.Args) {
		const { parseId } = this.client.utils;

		const member = await ctx.guild.members
			.fetch({
				user:
					parseId(args[0]) ||
					ctx.interaction?.options.getUser("member") ||
					ctx.author.id,
				force: true,
			})
			.catch(() => null);

		if (!member) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("Invalid member provided")
						.setColor(this.client.config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL(),
					})
					.setTitle("Member avatar")
					.setImage(member.displayAvatarURL({ size: 4096 }))
					.setColor(member.user.hexAccentColor!)
					.setTimestamp(),
			],
		});
	}
}

export default Avatar;
