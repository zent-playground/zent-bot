import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	SlashCommandBuilder,
	ButtonStyle,
	PermissionFlagsBits,
	codeBlock,
} from "discord.js";

import i18next from "i18next";
import iso6391 from "iso-639-1";
import { table } from "table";

import Command from "../Command.js";
import { localizations } from "../../utils/localizations.js";

class Language extends Command {
	public constructor() {
		super({
			name: "language",
			aliases: ["lang"],
			subcommands: [
				{
					name: "help",
					default: true,
					hybrid: "help",
				},
				{
					name: "show",
					hybrid: "show",
				},
				{
					name: "set",
					hybrid: "set",
				},
				{
					name: "list",
					hybrid: "list",
				},
			],
		});
	}

	public initialize() {
		const { description, descriptions, options } = localizations.get(this.name)!;
		const { show, set, list } = options;

		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(description)
				.setDescriptionLocalizations(descriptions)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("show")
						.setDescription(show.description)
						.setDescriptionLocalizations(show.descriptions),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("list")
						.setDescription(list.description)
						.setDescriptionLocalizations(list.descriptions),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("set")
						.setDescription(set.description)
						.setDescriptionLocalizations(set.descriptions)
						.addStringOption((option) =>
							option
								.setName("language")
								.setDescription(set.options.language.description)
								.setDescriptionLocalizations(set.options.language.descriptions)
								.setAutocomplete(true)
								.setRequired(true),
						),
				)
				.toJSON(),
		);
	}

	public async help(ctx: Command.HybridContext, args: Command.Args) {
		const { language, prefix } = args;

		await ctx.send({
			embeds: [
				ctx.client.utils.createHelpEmbed(this, {
					language,
					usage: [`${prefix} language show`, `${prefix} language set <language>`].join("\n"),
					example: [`${prefix} language set vi`, `${prefix} language set vietnamese`].join(
						"\n",
					),
				}),
			],
		});
	}

	public async list(ctx: Command.HybridContext) {
		const list = [["\u001b[1;33mLanguage\u001b[0m", "\u001b[1;33mISO 639 (Set 1)\u001b[0m"]];

		for (const language of Object.keys(i18next.store.data)) {
			list.push([iso6391.getName(language), language]);
		}

		const createdTable = table(list);

		const embed = new EmbedBuilder()
			.setTitle("List of supported language.")
			.setDescription(codeBlock("ansi", createdTable))
			.setColor(ctx.client.config.colors.default);

		await ctx.send({
			embeds: [embed],
		});
	}

	public async executeAutocomplete(interaction: Command.Autocomplete) {
		const focused = interaction.options.getFocused().toLowerCase();
		const choices = Object.keys(i18next.store.data).filter(
			(k) =>
				k.toLowerCase().includes(focused) ||
				iso6391.getName(k).toLowerCase().includes(focused) ||
				iso6391.getNativeName(k).toLowerCase().includes(focused),
		);
		await interaction.respond(
			choices.map((choice) => ({ name: iso6391.getName(choice), value: choice })),
		);
	}

	public async show(ctx: Command.HybridContext, args: Command.Args) {
		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: ctx.guild.name,
						iconURL: ctx.guild.iconURL({ forceStatic: true })!,
					})
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
						.setLabel(
							i18next.t(`commands.${this.name}.components.set_language`, {
								lng: args.language,
							}),
						)
						.setStyle(ButtonStyle.Secondary)
						.setCustomId("language"),
				]),
			],
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
			args.entries.join(" ") || ctx.interaction?.options.getString("language")
		)?.toLowerCase();

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
			case "vn":
				languageToSet = "vi";
				break;
			case "us":
			case "en-us": {
				languageToSet = "en";
				break;
			}
		}

		const languageCode = iso6391.getCode(languageToSet) || languageToSet;

		if (!i18next.store.data[languageCode]) {
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

		await guilds.set(ctx.guild.id, { language: languageCode }, { overwrite: true });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: ctx.guild.name,
						iconURL: ctx.guild.iconURL({ forceStatic: true })!,
					})
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
