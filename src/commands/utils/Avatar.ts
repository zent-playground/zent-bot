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
		const { description, descriptions, options } = localizations.get(this.name)!;
		const { user, member } = options;

		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(description)
				.setDescriptionLocalizations(descriptions)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("user")
						.setDescription(user.description)
						.setDescriptionLocalizations(options.user.descriptions)
						.addUserOption((option) =>
							option
								.setName("user")
								.setDescription("Choose a user.")
								.setDescriptionLocalizations(user.options.user.descriptions),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("member")
						.setDescription(member.description)
						.setDescriptionLocalizations(member.descriptions)
						.addUserOption((option) =>
							option
								.setName("member")
								.setDescription("Choose a member.")
								.setDescriptionLocalizations(member.options.member.descriptions),
						),
				)
				.toJSON(),
		);
	}

	public async user(ctx: Command.HybridContext, args: Command.Args) {
		const { parseId } = this.client.utils;

		const user = await this.client.users
			.fetch(
				parseId(args.entries[0]) ||
					ctx.interaction?.options.getUser("user")?.id ||
					ctx.author.id,
				{ force: true },
			)
			.catch(() => null);

		if (!user) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t(`commands.${this.name}.messages.invalid_user`, {
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
						i18next.t(`commands.${this.name}.messages.user_avatar`, {
							lng: args.language,
						}),
					)
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
					parseId(args.entries[0]) ||
					ctx.interaction?.options.getUser("member") ||
					ctx.author.id,
				force: true,
			})
			.catch(() => null);

		if (!member) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t(`commands.${this.name}.messages.invalid_member`, {
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
						i18next.t(`commands.${this.name}.messages.member_avatar`, {
							lng: args.language,
						}),
					)
					.setImage(member.displayAvatarURL({ size: 4096 }))
					.setColor(member.user.hexAccentColor!)
					.setTimestamp(),
			],
		});
	}
}

export default Avatar;
