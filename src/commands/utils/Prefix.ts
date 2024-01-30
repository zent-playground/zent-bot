import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

import Command from "../Command.js";

class Prefix extends Command {
	public constructor() {
		super({
			name: "prefix",
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
			],
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Manage the bot prefix.")
				.addSubcommand((subcommand) =>
					subcommand.setName("show").setDescription("Show the current bot prefix."),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("set")
						.setDescription("Set another prefix.")
						.addStringOption((option) =>
							option.setName("prefix").setDescription("Prefix to set.").setRequired(true),
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
					usage: [`${prefix} prefix show`, `${prefix} prefix set <prefix>`].join("\n"),
					example: `${prefix} prefix set zent`,
				}),
			],
		});
	}

	public async show(ctx: Command.HybridContext) {
		const { guilds } = this.client.managers;
		const { prefix } = (await guilds.get({ id: ctx.guild.id }))!;

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: ctx.guild.name,
						iconURL: ctx.guild.iconURL({ forceStatic: true })!,
					})
					.setDescription(`The current prefix of this server is \`${prefix}\`.`)
					.setColor(this.client.config.colors.default),
			],
		});

		return;
	}

	public async set(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const prefixToSet = (args[0] || ctx.interaction?.options.getString("prefix"))
			?.split(/ +/g)[0]
			.toLowerCase();

		if (!prefixToSet) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("Missing argument `prefix`.")
						.setColor(this.client.config.colors.error),
				],
			});

			return;
		}

		if (prefixToSet.length > 5) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("The prefix must be less than 5 characters!")
						.setColor(this.client.config.colors.error),
				],
			});

			return;
		}

		if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You don't have permissions to use this command.")
						.setColor(this.client.config.colors.error),
				],
			});

			return;
		}

		await guilds.upd({ id: ctx.guild.id }, { prefix: prefixToSet });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: ctx.guild.name,
						iconURL: ctx.guild.iconURL({ forceStatic: true })!,
					})
					.setDescription(`Set prefix to \`${prefixToSet}\`.`)
					.setColor(this.client.config.colors.success),
			],
		});
	}
}

export default Prefix;
