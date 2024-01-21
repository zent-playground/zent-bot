import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import i18next from "i18next";
import { localizations } from "../../utils/localizations.js";

class TempVoice extends Command {
	public constructor() {
		super({
			name: "temp-voice",
			aliases: ["tempvoice", "tv"],
			subcommands: [
				{
					name: "help",
					default: true,
					hybrid: "help",
				},
				{
					name: "setup",
					hybrid: "setup",
				},
				{
					name: "name",
					hybrid: "setName",
				},
			],
		});
	}

	public initialize() {
		const { description, options } = localizations.get(this.name)!;
		const { setup } = options;

		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(description)
				.addSubcommand((subcommand) =>
					subcommand.setName("setup").setDescription(setup.description),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("name")
						.setDescription("Change channel name.")
						.addStringOption((option) =>
							option.setName("name").setDescription("Name to change.").setRequired(true),
						),
				)
				.toJSON(),
		);
	}

	public async setup(ctx: Command.HybridContext, args: Command.Args) {
		const { managers, config } = ctx.client;
		const { voices } = managers;

		if (!ctx.member.permissions.has("ManageChannels")) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("insufficient_permission", { lng: args.language }))
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const channel = await ctx.guild.channels.create({
			name: `➕ ${i18next.t("commands.temp-voice.messages.join_to_create", {
				lng: args.language,
			})}`,
			type: ChannelType.GuildVoice,
		});

		await voices.creators.set(channel.id, { guild_id: ctx.guild.id });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						i18next.t("commands.temp-voice.messages.created_channel", {
							lng: args.language,
							channelId: channel.id,
						}),
					)
					.setColor(config.colors.success),
			],
		});
	}

	public async setName(ctx: Command.HybridContext, args: Command.Args) {
		const { managers, config } = ctx.client;
		const { voices, users } = managers;
		const { channel } = ctx.member.voice;

		const data = await voices.get(`${channel?.id}`);
		const name = args.entries.join(" ") || ctx.interaction?.options.getString("name");

		if (!name) {
			return;
		}

		if (data) {
			await voices.edit(data.id, { name });
			await ctx.member.voice.channel!.setName(name);
		}

		await users.edit(ctx.author.id, { voice_name: name });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Set your temp voice channel name to \`${name}\``)
					.setColor(config.colors.success),
			],
		});
	}
}

export default TempVoice;
