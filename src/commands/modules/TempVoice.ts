import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	GuildEditOptions,
	SlashCommandBuilder,
	UserSelectMenuBuilder,
	codeBlock,
} from "discord.js";

import Command from "../Command.js";
import { TempVoiceJoinable } from "../../databases/managers/TempVoice/TempVoiceManager.js";

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
					preconditions: {
						tempVoiceChannel: true,
					},
				},
				{
					name: "blacklist",
					hybrid: "setBlacklist",
					preconditions: {
						tempVoiceChannel: true,
					},
				},
				{
					name: "whitelist",
					hybrid: "setWhitelist",
					preconditions: {
						tempVoiceChannel: true,
					},
				},
				{
					name: "joinable",
					hybrid: "setJoinable",
					preconditions: {
						tempVoiceChannel: true,
					},
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
								.setMinLength(1)
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("blacklist")
						.setDescription("Blacklist members from your voice channel."),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("whitelist")
						.setDescription("Whitelist members from your voice channel."),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("joinable")
						.setDescription("Set voice channel joinable.")
						.addIntegerOption((option) =>
							option
								.setName("set")
								.setDescription("Select a choice to set.")
								.setChoices(
									{ name: "Everyone", value: TempVoiceJoinable.Everyone },
									{ name: "Whitelisted users", value: TempVoiceJoinable.WhitelistedUsers },
									{ name: "Owner", value: TempVoiceJoinable.Owner },
								)
								.setRequired(true),
						),
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

		const data = (await voices.get(`${channel?.id}`))!;
		const name = args.join(" ") || ctx.interaction?.options.getString("name");

		if (!name) {
			return;
		}

		await voices.configs.set(data.author_id, { name }, { overwrite: true });

		await channel!.edit(
			(await voices.createOptions(this.client, {
				userId: data.author_id,
				guildId: ctx.guild.id,
			})) as GuildEditOptions,
		);

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

		const data = (await voices.get(`${channel?.id}`))!;

		const getRows = async (disabled = false) => {
			return [
				new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
					new UserSelectMenuBuilder()
						.setCustomId("members")
						.setPlaceholder("Choose members to blacklist")
						.setDefaultUsers(
							await (async () => {
								const config = await voices.configs.get(data!.author_id);
								return config?.blacklisted_ids || [];
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

		const message = await ctx.send({
			components: await getRows(),
			ephemeral: true,
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === ctx.author.id,
			time: 60000,
		});

		collector.on("collect", async (i) => {
			let ids: string[] = [];

			if (i.isUserSelectMenu()) {
				ids = i.members.map((member) => {
					return member.user!.id;
				});
			}

			await voices.configs.set(i.user.id, { blacklisted_ids: ids }, { overwrite: true });

			await channel!.edit(
				(await voices.createOptions(this.client, {
					userId: data.author_id,
					guildId: ctx.guild.id,
				})) as GuildEditOptions,
			);

			await i
				.update({
					components: await getRows(),
				})
				.catch(() => null);
		});

		collector.on("ignore", (i) => {
			i.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription("You can't use this interaction!")
						.setColor(config.colors.error),
				],
			});
		});

		collector.on("end", async () => {
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
	}

	public async setWhitelist(ctx: Command.HybridContext) {
		const { managers, config } = ctx.client;
		const { voices } = managers;
		const { channel } = ctx.member.voice;

		const data = (await voices.get(`${channel?.id}`))!;

		const getRows = async (disabled = false) => {
			return [
				new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
					new UserSelectMenuBuilder()
						.setCustomId("members")
						.setPlaceholder("Choose members to whitelist")
						.setDefaultUsers(
							await (async () => {
								const config = await voices.configs.get(data!.author_id);
								return config?.whitelisted_ids || [];
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

		const message = await ctx.send({
			components: await getRows(),
			ephemeral: true,
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === ctx.author.id,
			time: 60000,
		});

		collector.on("collect", async (i) => {
			let ids: string[] = [];

			if (i.isUserSelectMenu()) {
				ids = i.members.map((member) => {
					return member.user!.id;
				});
			}

			await voices.configs.set(i.user.id, { whitelisted_ids: ids }, { overwrite: true });

			await channel!.edit(
				(await voices.createOptions(this.client, {
					userId: data.author_id,
					guildId: ctx.guild.id,
				})) as GuildEditOptions,
			);

			await i
				.update({
					components: await getRows(),
				})
				.catch(() => null);
		});

		collector.on("ignore", (i) => {
			i.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription("You can't use this interaction!")
						.setColor(config.colors.error),
				],
			});
		});

		collector.on("end", async () => {
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
	}

	public async setJoinable(ctx: Command.HybridContext, args: Command.Args) {
		const { config, managers } = ctx.client;
		const { voices } = managers;

		const choice = parseInt(args[0]) || ctx.interaction?.options.getInteger("set");

		if (choice === undefined || choice === null || !TempVoiceJoinable[choice]) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(codeBlock("0: Everyone\n1: Whitelisted users only\n2: Owner"))
						.setColor(config.colors.default),
				],
			});

			return;
		}

		await voices.configs.set(
			ctx.author.id,
			{
				joinable: choice,
			},
			{ overwrite: true },
		);

		await ctx.member.voice.channel!.edit(
			(await voices.createOptions(ctx.client, {
				userId: ctx.author.id,
				guildId: ctx.guild.id,
			})) as GuildEditOptions,
		);

		const formattedChoice = {
			[TempVoiceJoinable.Everyone]: "Everyone",
			[TempVoiceJoinable.Owner]: "Owner",
			[TempVoiceJoinable.WhitelistedUsers]: "Whitelisted users",
		}[choice];

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Set your temp voice channel joinable to \`${formattedChoice}\`.`)
					.setColor(config.colors.default),
			],
		});
	}
}

export default TempVoice;
