import {
	EmbedBuilder,
	SlashCommandBuilder,
	codeBlock,
	ActionRowBuilder,
	ButtonBuilder,
	ChannelType,
	ButtonStyle,
	PermissionFlagsBits,
} from "discord.js";

import Command from "../Command.js";
import { TempVoiceJoinable } from "../../databases/managers/TempVoice/TempVoiceManager.js";
import { TempVoiceConfig } from "../../types/database.js";
import Logger from "../../utils/others/Logger.js";

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

	public override initialize() {
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
								.setName("channel")
								.setDescription("The voice channel that the bot will setup in it.")
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
						)
						.addBooleanOption((option) =>
							option
								.setName("global")
								.setDescription("Change your voice channel name globally."),
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

	private globally(args: Command.Args): boolean {
		if (args[args.entries.length - 1] === "true") {
			args.entries.pop();
			return true;
		}

		return false;
	}

	public async setup(ctx: Command.HybridContext, args: Command.Args) {
		const {
			config,
			managers: { voices },
		} = this.client;
		const { member, guild } = ctx;

		if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.error} Insufficient Permissions!`)
						.setDescription("You lack the required permissions to execute this command.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		if (ctx.isMessage() && !args[0]) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.error} Missing Channel!`)
						.setDescription("Please specify the voice channel ID for setup.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		let channel = await (async () => {
			if (ctx.isInteraction()) {
				return ctx.interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
			} else {
				return await guild.channels.fetch(args.entries[0]).catch(() => null);
			}
		})();

		if (channel) {
			if (!channel.isVoiceBased()) {
				await ctx.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${config.emojis.error} Invalid Channel!`)
							.setDescription("The provided channel ID is invalid or doesn't exist.")
							.setColor(config.colors.error),
					],
					ephemeral: true,
				});
				return;
			}
		} else {
			channel = await guild.channels.create({
				name: "Join to create",
				type: ChannelType.GuildVoice,
			});
		}

		const creators = await voices.creators.get({ id: channel.id });

		if (creators) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.warn} Already Setup!`)
						.setDescription("This channel has already been configured.")
						.setColor(config.colors.warn),
				],
				ephemeral: true,
			});

			return;
		}

		await voices.creators.set({ id: channel.id }, { guild_id: ctx.guild.id });

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(`${config.emojis.success} Setup Complete!`)
					.setDescription(`The temporary voice system is now configured for ${channel}.`)
					.setColor(config.colors.success),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setLabel("Set Generic")
						.setStyle(ButtonStyle.Success)
						.setCustomId(`voice:creator:generic:${channel.id}:${ctx.member.id}`),
					new ButtonBuilder()
						.setLabel("Set Affix")
						.setStyle(ButtonStyle.Primary)
						.setCustomId(`voice:creator:affix:${channel.id}:${ctx.member.id}`),
					new ButtonBuilder()
						.setLabel("Custom Name")
						.setStyle(ButtonStyle.Danger)
						.setCustomId(`voice:creator:custom:${channel.id}:${ctx.member.id}`),
				]),
			],
		});
	}

	public async setName(ctx: Command.HybridContext, args: Command.Args) {
		const { voices } = this.client.managers;
		const { member } = ctx;

		const globally = this.globally(args) || ctx.interaction?.options.getBoolean("globally");
		const name = args.entries.join(" ") || ctx.interaction?.options.getString("name");

		if (!name) {
			return;
		}

		const temp = (await voices.get({ id: member.voice.channel!.id, active: true }))!;

		if (temp.author_id !== member.id) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must be the channel owner to use this command!")
						.setColor(this.client.config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const creator = (await voices.creators.get({ id: temp.creator_channel_id }))!;

		if (creator.affix || creator.generic_name || creator.allow_custom_name) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							"This guild does not allow custom names for this temporary voice channel!",
						)
						.setColor(this.client.config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const criteria: Partial<TempVoiceConfig> = {
			id: member.id,
		};

		if (globally) {
			criteria.is_global = true;
		} else {
			criteria.guild_id = ctx.guild.id;
		}

		const config = await voices.configs.get(criteria);

		if (!config) {
			await voices.configs.set(criteria, { name });
		} else {
			if (config.name === name) {
				await ctx.send({
					embeds: [
						new EmbedBuilder()
							.setDescription("This name is already assigned to your temporary voice channel!")
							.setColor(this.client.config.colors.error),
					],
					ephemeral: true,
				});

				return;
			}

			await voices.configs.upd(criteria, { name });
		}

		await member.voice
			.channel!.edit({
				name: name,
			})
			.then(async () => {
				await ctx.send({
					embeds: [
						new EmbedBuilder()
							.setDescription(`Set your temporary voice channel name to **\`${name}\`**!`)
							.setColor(this.client.config.colors.success),
					],
				});
			})
			.catch(async (error) => {
				Logger.error(
					`An error occurred while changing ${member.user.tag} temporary voice channel name.`,
					error,
				);

				await ctx.send({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								"An error occurred while changing your temporary voice channel name.",
							)
							.setColor(this.client.config.colors.error),
					],
					ephemeral: true,
				});

				await voices.configs.upd(criteria, { name: member.voice.channel!.name });
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

		await channel!.edit({
			permissionOverwrites: await voices.createPermissionOverwrites(
				(await voices.configs.get({ id: data.author_id }))!,
				ctx.guild,
			),
		});

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

		await channel!.edit({
			permissionOverwrites: await voices.createPermissionOverwrites(
				(await voices.configs.get({ id: data.author_id }))!,
				ctx.guild,
			),
		});

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

		await ctx.member.voice.channel?.edit({
			permissionOverwrites: await voices.createPermissionOverwrites(
				(await voices.configs.get({ id: ctx.author.id }))!,
				ctx.guild,
			),
		});

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
