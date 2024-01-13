import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import i18next from "i18next";
import { ButtonStyle, PermissionFlagsBits } from "discord-api-types/v10";
import { localizations } from "../../utils/localizations.js";

class Prefix extends Command {
	public constructor() {
		super({
			name: "prefix",
			subcommands: [
				{
					name: "show",
					hybrid: "show",
				},
				{
					name: "set",
					hybrid: "set",
				},
			],
		});
	}

	public initialize() {
		const { descriptions, options } = localizations.get(this.name)!;
		const { show, set } = options;

		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(descriptions["en-US"])
				.setDescriptionLocalizations(descriptions)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("show")
						.setDescription(show.descriptions["en-US"])
						.setDescriptionLocalizations(show.descriptions),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("set")
						.setDescription(set.descriptions["en-US"])
						.setDescriptionLocalizations(set.descriptions)
						.addStringOption((option) =>
							option
								.setName("prefix")
								.setDescription(set.options.prefix.descriptions["en-US"])
								.setDescriptionLocalizations(set.options.prefix.descriptions)
								.setRequired(true),
						),
				)
				.toJSON(),
		);
	}

	public async show(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;
		const { prefix } = (await guilds.get(ctx.guild.id))!;

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: ctx.guild.name, iconURL: ctx.guild.iconURL({ forceStatic: true })! })
					.setDescription(
						i18next.t(`commands.${this.name}.messages.current_prefix`, {
							prefix: prefix,
							lng: args.language,
						}),
					)
					.setColor(this.client.config.colors.default),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel(i18next.t(`commands.${this.name}.components.buttons.set_prefix`, { lng: args.language }))
						.setStyle(ButtonStyle.Secondary)
						.setCustomId("prefix")
				])
			]
		});

		return;
	}

	public async set(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const prefixToSet = (
			args.entries[0] || ctx.interaction?.options.getString("prefix")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (!prefixToSet) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t(`commands.${this.name}.messages.missing_argument`, {
								lng: args.language,
							}),
						)
						.setColor(this.client.config.colors.error),
				],
			});

			return;
		}

		if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t("commands.insufficient_permission", {
								lng: args.language,
							}),
						)
						.setColor(this.client.config.colors.error),
				],
			});

			return;
		}

		await guilds.update(ctx.guild.id, { prefix: prefixToSet });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: ctx.guild.name, iconURL: ctx.guild.iconURL({ forceStatic: true })! })
					.setDescription(
						i18next.t(`commands.${this.name}.messages.set_prefix`, {
							prefix: prefixToSet,
							lng: args.language,
						}),
					)
					.setColor(this.client.config.colors.success),
			],
		});
	}
}

export default Prefix;
