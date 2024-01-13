import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import i18next from "i18next";
import { localizations } from "../../utils/localizations.js";

class Avatar extends Command {
	public constructor() {
		super({
			name: "avatar",
			aliases: ["av", "pfp"],
			subcommands: [
				{
					name: "user",
					type: "subcommand",
					hybrid: "user",
					default: true,
				},
				{
					name: "member",
					type: "subcommand",
					hybrid: "member",
				},
			],
		});
	}

	public initialize() {
		const data = localizations.get(this.name)!;

		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(data.descriptions["en-US"])
				.setDescriptionLocalizations(data.descriptions)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("user")
						.setDescription("Displays user avatar.")
						.setDescriptionLocalizations(data.options.user.descriptions)
						.addUserOption((option) =>
							option
								.setName("user")
								.setDescription("Choose a user.")
								.setDescriptionLocalizations(
									data.options.user.options.user.descriptions,
								),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("member")
						.setDescription("Displays member avatar.")
						.setDescriptionLocalizations(data.options.member.descriptions)
						.addUserOption((option) =>
							option
								.setName("member")
								.setDescription("Choose a member.")
								.setDescriptionLocalizations(
									data.options.member.options.member.descriptions,
								),
						),
				)
				.toJSON(),
		);
	}

	public async user(ctx: Command.HybridContext, args: Command.Args) {
		let targetId = ctx.author.id;

		if (ctx.isInteraction()) {
			targetId = ctx.context.options.getUser("user")?.id || targetId;
		} else {
			targetId = this.client.utils.parseId(args.entries[0]) || targetId;
		}

		const user = await this.client.users
			.fetch(targetId, { force: true })
			.catch(() => null);

		if (!user) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t("commands.avatar.messages.invalid_user", {
								lng: args.language,
							}),
						)
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
					.setTitle(
						i18next.t("commands.avatar.messages.user_avatar", {
							lng: args.language,
						}),
					)
					.setImage(user.displayAvatarURL({ size: 4096 }))
					.setColor(user.hexAccentColor || this.client.config.colors.default)
					.setTimestamp(),
			],
		});
	}

	public async member(ctx: Command.HybridContext, args: Command.Args) {
		let targetId = ctx.author.id;

		if (ctx.isInteraction()) {
			targetId = ctx.context.options.getUser("member")?.id || targetId;
		} else {
			targetId = this.client.utils.parseId(args.entries[0]) || targetId;
		}

		const member = await ctx.guild.members
			.fetch({ user: targetId, force: true })
			.catch(() => null);

		if (!member) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t("commands.avatar.messages.invalid_member", {
								lng: args.language,
							}),
						)
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
					.setTitle(
						i18next.t("commands.avatar.messages.member_avatar", {
							lng: args.language,
						}),
					)
					.setImage(member.displayAvatarURL({ size: 4096 }))
					.setColor(member.user.hexAccentColor || null)
					.setTimestamp(),
			],
		});
	}
}

export default Avatar;
