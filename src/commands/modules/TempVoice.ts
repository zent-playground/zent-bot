import {
	ChannelType,
	EmbedBuilder,
	GuildEditOptions,
	SlashCommandBuilder,
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
								.addChannelTypes(ChannelType.GuildCategory)
								.setRequired(true),
						)
						.addChannelOption((option) =>
							option
								.setName("channel")
								.setDescription("The channel that the bot will create temp voice.")
								.addChannelTypes(ChannelType.GuildVoice),
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
						.setDescription("Blacklist members from your voice channel.")
						.addUserOption((option) =>
							option
								.setName("member")
								.setDescription("Choose a member to add/remove.")
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("whitelist")
						.setDescription("Whitelist members from your voice channel.")
						.addUserOption((option) =>
							option
								.setName("member")
								.setDescription("Choose a member to add/remove.")
								.setRequired(true),
						),
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

		await voices.creators.set({ id: channel.id }, { guild_id: ctx.guild.id });

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

		const data = (await voices.get({ id: channel?.id }))!;
		const name = args.join(" ") || ctx.interaction?.options.getString("name");

		if (!name) {
			return;
		}

		await voices.configs.set({ id: data.author_id }, { name });

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

	public async setBlacklist(ctx: Command.HybridContext, args: Command.Args) {
		const { managers, config } = ctx.client;
		const { voices } = managers;
		const { channel } = ctx.member.voice;

		const data = (await voices.get({ id: channel?.id }))!;
		const userConfig = await voices.configs.get({ id: data.author_id });
		const target = await ctx.client.users
			.fetch(
				`${
					this.client.utils.parseId(args[0]) || ctx.interaction?.options.getUser("member")?.id
				}`,
			)
			.catch(() => null);

		if (!target) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must provide a member to add/remove.")
						.setColor(config.colors.error),
				],
			});

			return;
		}

		const blacklistedIds = userConfig?.blacklisted_ids || [];
		const index = blacklistedIds.indexOf(target.id);

		if (index !== -1) {
			blacklistedIds.splice(index, 1);
		} else {
			blacklistedIds.push(target.id);
		}

		await voices.configs.set(
			{ id: data.author_id },
			{
				blacklisted_ids: blacklistedIds,
			},
		);

		await channel!.edit(
			(await voices.createOptions(this.client, {
				userId: data.author_id,
				guildId: ctx.guild.id,
			})) as GuildEditOptions,
		);

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						index !== -1
							? `Removed ${target} from your temp voice channel blacklist.`
							: `Added ${target} to your temp voice channel blacklist.`,
					)
					.setColor(config.colors.success),
			],
		});
	}

	public async setWhitelist(ctx: Command.HybridContext, args: Command.Args) {
		const { managers, config } = ctx.client;
		const { voices } = managers;
		const { channel } = ctx.member.voice;

		const data = (await voices.get({ id: channel?.id }))!;
		const userConfig = await voices.configs.get({ id: data.author_id });
		const target = await ctx.client.users
			.fetch(
				`${
					this.client.utils.parseId(args[0]) || ctx.interaction?.options.getUser("member")?.id
				}`,
			)
			.catch(() => null);

		if (!target) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must provide a member to add/remove.")
						.setColor(config.colors.error),
				],
			});

			return;
		}

		const whitelistedIds = userConfig?.whitelisted_ids || [];
		const index = whitelistedIds.indexOf(target.id);

		if (index !== -1) {
			whitelistedIds.splice(index, 1);
		} else {
			whitelistedIds.push(target.id);
		}

		await voices.configs.set(
			{ id: data.author_id },
			{
				whitelisted_ids: whitelistedIds,
			},
		);

		await channel!.edit(
			(await voices.createOptions(this.client, {
				userId: data.author_id,
				guildId: ctx.guild.id,
			})) as GuildEditOptions,
		);

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						index !== -1
							? `Removed ${target} from your temp voice channel whitelist.`
							: `Added ${target} to your temp voice channel whitelist.`,
					)
					.setColor(config.colors.success),
			],
		});
	}

	public async setJoinable(ctx: Command.HybridContext, args: Command.Args) {
		const { config, managers } = ctx.client;
		const { voices } = managers;

		let choice: number | null | undefined = Number(args[0]);

		if (isNaN(choice)) {
			choice = ctx.interaction?.options.getInteger("set");
		}

		if (choice === null || choice === undefined || !TempVoiceJoinable[choice!]) {
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
			{ id: ctx.author.id },
			{
				joinable: choice,
			},
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
					.setColor(config.colors.success),
			],
		});
	}
}

export default TempVoice;
