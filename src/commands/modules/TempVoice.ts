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
				.toJSON(),
		);
	}

	public async help() {
		//console.log("hello");
	}

	public async setup(ctx: Command.HybridContext, args: Command.Args) {
		const { voices } = ctx.client.managers;

		if (!ctx.member.permissions.has("ManageGuild")) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(i18next.t("insufficient_permission", { lng: args.language }))
						.setColor(ctx.client.config.colors.error),
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

		await voices.configurations.set(channel.id, { guild_id: ctx.guild.id });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						i18next.t("commands.temp-voice.messages.created_channel", {
							lng: args.language,
							channelId: channel.id,
						}),
					)
					.setColor(ctx.client.config.colors.success),
			],
		});
	}
}

export default TempVoice;
