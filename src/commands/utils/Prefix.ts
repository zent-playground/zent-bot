import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import i18next from "i18next";
import { PermissionFlagsBits } from "discord-api-types/v10";

class Prefix extends Command {
	public constructor() {
		super({
			name: "prefix",
			description: "Manage prefix.",
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option.setName("prefix").setDescription("Prefix to set."),
				)
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const prefixToSet = (
			args.entries[0] || ctx.interaction?.options.getString("prefix")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (!prefixToSet) {
			const { prefix } = (await guilds.get(ctx.guild.id))!;

			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("commands.prefix.messages.current_prefix", { prefix: prefix, lng: args.language }))
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

		await guilds.update(ctx.guild.id, { prefix: prefixToSet });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(i18next.t("commands.prefix.messages.set_prefix", {
						prefix: prefixToSet,
						lng: args.language
					}))
					.setColor(this.client.config.colors.success)
			],
		});
	}
}

export default Prefix;
