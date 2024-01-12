import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import Command from "../Command.js";
import i18next from "i18next";

class Language extends Command {
	public constructor() {
		super({
			name: "language",
			description: "Language.",
			aliases: ["lang"],
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option.setName("language").setDescription("Language to set."),
				)
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const languageToSet = (
			args.entries[0] || ctx.interaction?.options.getString("language")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (!languageToSet) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("commands.language.messages.current_language", { lng: args.language }))
						.setColor(this.client.config.colors.default)
				],
			});

			return;
		}

		if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("commands.insufficient_permission", { lng: args.language }))
						.setColor(this.client.config.colors.error)
				],
				ephemeral: true,
			});

			return;
		}

		if (!(i18next.options.preload as string[])?.includes(languageToSet)) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("commands.language.messages.unsupported_language", { lng: args.language }))
						.setColor(this.client.config.colors.error)
				],
				ephemeral: true,
			});

			return;
		}

		await guilds.update(ctx.guild.id, { language: languageToSet });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(i18next.t("commands.language.messages.set_language", { lng: args.language }))
					.setColor(this.client.config.colors.success)
			],
		});
	}
}

export default Language;
