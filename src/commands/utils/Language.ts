import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ButtonStyle, PermissionFlagsBits } from "discord-api-types/v10";
import Command from "../Command.js";
import i18next from "i18next";
import { localizations } from "../../utils/localizations.js";

class Language extends Command {
	public constructor() {
		super({
			name: "language",
			aliases: ["lang"],
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
								.setName("language")
								.setDescription(set.options.language.descriptions["en-US"])
								.setDescriptionLocalizations(set.options.language.descriptions)
								.setAutocomplete(true)
								.setRequired(true),
						),
				)
				.toJSON(),
		);
	}

	public async executeAutocomplete(interaction: Command.Autocomplete) {
		const focused = interaction.options.getFocused().toLowerCase();
		const choices = Object.keys(i18next.store.data).filter((k) =>
			k.toLowerCase().includes(focused),
		);
		await interaction.respond(
			choices.map((choice) => ({ name: choice, value: choice })),
		);
	}

	public async show(ctx: Command.HybridContext, args: Command.Args) {
		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: ctx.guild.name, iconURL: ctx.guild.iconURL({ forceStatic: true })! })
					.setDescription(
						i18next.t(`commands.${this.name}.messages.current_language`, {
							lng: args.language,
						}),
					)
					.setColor(this.client.config.colors.default),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel(i18next.t(`commands.${this.name}.components.buttons.set_language`, { lng: args.language }))
						.setStyle(ButtonStyle.Secondary)
						.setCustomId("language")
				])
			]
		});
	}

	public async set(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

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
				ephemeral: true,
			});

			return;
		}

		let languageToSet = (
			args.entries[0] || ctx.interaction?.options.getString("language")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (!languageToSet) {
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

		switch (languageToSet) {
			case "en":
			case "us":
			case "en-us": {
				languageToSet = "en-US";
				break;
			}
		}

		if (!i18next.store.data[languageToSet]) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							i18next.t(`commands.${this.name}.messages.unsupported_language`, {
								lng: args.language,
							}),
						)
						.setColor(this.client.config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		await guilds.update(ctx.guild.id, { language: languageToSet });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: ctx.guild.name, iconURL: ctx.guild.iconURL({ forceStatic: true })! })
					.setDescription(
						i18next.t(`commands.${this.name}.messages.set_language`, {
							lng: languageToSet,
						}),
					)
					.setColor(this.client.config.colors.success),
			],
		});
	}
}

export default Language;
