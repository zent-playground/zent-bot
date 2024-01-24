import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	UserSelectMenuBuilder,
} from "discord.js";

import Command from "../Command.js";

class TempVoice extends Command {
	public constructor() {
		super({
			name: "voice",
			aliases: ["tempvoice", "vc"],
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
				{
					name: "blacklist",
					hybrid: "setBlacklist",
				},
			],
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription("Temp voice module.")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("setup")
						.setDescription("Setup a voice channel creator.")
						.addChannelOption((option) =>
							option
								.setName("category")
								.setDescription("The category that the bot will setup in it.")
								.addChannelTypes(ChannelType.GuildCategory),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("name")
						.setDescription("Change your voice channel name.")
						.addStringOption((option) =>
							option
								.setName("name")
								.setDescription("Name to change.")
								.setMaxLength(255)
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("blacklist")
						.setDescription("Blacklist members from your voice channels."),
				)
				.toJSON(),
		);
	}

	public async setup(ctx: Command.HybridContext) {
		const { managers, config } = ctx.client;
		const { voices } = managers;

		if (!ctx.member.permissions.has("ManageChannels")) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You don't have permissions to use this command.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const channel = await ctx.guild.channels.create({
			name: "➕ Join to create",
			type: ChannelType.GuildVoice,
		});

		await voices.creators.set(channel.id, { guild_id: ctx.guild.id });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Created ${channel}.`)
					.setColor(config.colors.success),
			],
		});
	}

	public async setName(ctx: Command.HybridContext, args: Command.Args) {
		const { managers, config } = ctx.client;
		const { voices } = managers;
		const { channel } = ctx.member.voice;

		const data = await voices.get(`${channel?.id}`);
		const name = args.entries.join(" ") || ctx.interaction?.options.getString("name");

		if (!name) {
			return;
		}

		if (data && channel) {
			await voices.configs.set(data.author_id, { name }, { overwrite: true });
			await channel.setName(name);
		} else {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must in a temp voice channel to use this command.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Set your temp voice channel name to \`${name}\``)
					.setColor(config.colors.success),
			],
		});
	}

	public async setBlacklist(ctx: Command.HybridContext) {
		const { managers, config } = ctx.client;
		const { voices } = managers;
		const { channel } = ctx.member.voice;

		const data = await voices.get(`${channel?.id}`);

		const getRows = async (disabled = false) => {
			return [
				new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
					new UserSelectMenuBuilder()
						.setCustomId("members")
						.setPlaceholder("Choose members to blacklist")
						.setDefaultUsers(
							await (async () => {
								const config = await voices.configs.get(data!.author_id);

								if (!config) {
									return [];
								}

								return config.blacklisted_ids;
							})(),
						)
						.setMinValues(0)
						.setMaxValues(25)
						.setDisabled(disabled),
				),
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId("clear")
						.setLabel("Clear")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(disabled),
				),
			];
		};

		if (data && channel) {
			const message = await ctx.send({
				components: await getRows(),
				ephemeral: true,
				fetchReply: true,
			});

			const collector = message.createMessageComponentCollector({
				filter: (i) => i.user.id === ctx.author.id,
				time: 60000,
			});

			collector
				.on("collect", async (i) => {
					let ids: string[] = [];

					if (i.isUserSelectMenu()) {
						ids = i.members.map((member) => {
							if ("voice" in member && member.voice.channelId === data.id) {
								member.voice.setChannel(null).catch(() => null);
							}

							return member.user!.id;
						});
					}

					await voices.configs.set(
						i.user.id,
						{ blacklisted_ids: JSON.stringify(ids) as any },
						{ overwrite: true },
					);

					await channel.edit({
						permissionOverwrites: [
							{
								id: i.user.id,
								allow: [PermissionFlagsBits.ManageChannels],
							},
							...ids.map((id) => {
								return {
									id,
									deny: [PermissionFlagsBits.Connect],
								};
							}),
						],
					});

					await i
						.update({
							components: await getRows(),
						})
						.catch(() => null);
				})
				.on("ignore", (i) => {
					i.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription("You can't use this interaction!")
								.setColor(config.colors.error),
						],
					});
				})
				.on("end", async () => {
					if (ctx.isMessage()) {
						ctx.message
							.edit({
								components: await getRows(true),
							})
							.catch(() => 0);
					} else {
						ctx.interaction.deleteReply().catch(() => 0);
					}
				});
		} else {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must in a temp voice channel to use this command.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}
	}
}

export default TempVoice;
