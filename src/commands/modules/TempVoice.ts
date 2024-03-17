import {
	EmbedBuilder,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ChannelType,
	ButtonStyle,
	PermissionFlagsBits,
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
				{
					name: "whitelist",
					hybrid: "setWhitelist",
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
							option.setName("global").setDescription("Change your voice channel name globally."),
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
				.toJSON(),
		);
	}

	private async getData(ctx: Command.HybridContext) {
		const { client, member, guild } = ctx;
		const {
			database: { voices },
			config: { colors },
		} = client;

		const voice = await voices.get(`${member.voice.channelId}`);

		if (!voice) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must join a temp voice channel to use this command.")
						.setColor(colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const creator = (await voices.creators.get(`${voice.creator_channel_id}`))!;
		const config = await voices.configs.getDefault(`${voice.author_id}`, guild.id);
		const author = await guild.members.fetch(config.id).catch(() => null);

		if (!config || !author) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()

						.setDescription(
							"An error occurred while generating config data. Try to claim this temp voice channel an try again.",
						)
						.setColor(colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		return { creator, config, author, voice };
	}

	public async setup(ctx: Command.HybridContext, args: Command.Args) {
		const {
			config,
			database: { voices },
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

		if (ctx.isMessage() && !args.entries[0]) {
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

		const creators = await voices.creators.get(channel.id);

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

		await voices.creators.set(channel.id, { guild_id: ctx.guild.id });

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
		const { client, member } = ctx;
		const {
			config: { colors },
			database: { voices },
		} = client;

		const data = await this.getData(ctx);

		if (!data) {
			return;
		}

		const { config, creator, author } = data;

		const name = ctx.isInteraction()
			? ctx.interaction.options.getString("name", true)
			: args.entries.join(" ").trim();

		if (!name) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must provide a name to set.")
						.setColor(colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		if (!creator.allow_custom_name) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("This temp voice channel cannot set a custom name.")
						.setColor(colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		await voices.configs.update(config.id, config.guild_id, { name });
		await member.voice.channel!.edit(await voices.createOptions(creator, author));

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`Successfully set your temp voice channel name to \`${name}\`.`)
					.setColor(colors.success),
			],
		});
	}

	public async setBlacklist(ctx: Command.HybridContext, args: Command.Args) {
		const { client, member } = ctx;
		const {
			database: { voices },
			config: { colors },
		} = client;

		const data = await this.getData(ctx);

		if (!data) {
			return;
		}

		const { voice, config, creator, author } = data;

		const target = await ctx.client.users
			.fetch(
				`${
					this.client.utils.parseId(args.entries[0]) ||
					ctx.interaction?.options.getUser("member")?.id
				}`,
			)
			.catch(() => null);

		if (!target) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must provide a member to add/remove.")
						.setColor(colors.error),
				],
			});

			return;
		}

		const ids = config.blacklisted_ids || [];
		const index = ids.indexOf(target.id);

		if (index !== -1) {
			ids.splice(index, 1);
		} else {
			ids.push(target.id);
		}

		await voices.configs.update(voice.author_id, config.guild_id, {
			blacklisted_ids: ids,
		});

		await member.voice.channel!.edit(await voices.createOptions(creator, author));

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						index !== -1
							? `Removed ${target} from your temp voice channel blacklist.`
							: `Added ${target} to your temp voice channel blacklist.`,
					)
					.setColor(colors.success),
			],
		});
	}

	public async setWhitelist(ctx: Command.HybridContext, args: Command.Args) {
		const { client, member } = ctx;
		const {
			database: { voices },
			config: { colors },
		} = client;

		const data = await this.getData(ctx);

		if (!data) {
			return;
		}

		const { voice, config, creator, author } = data;

		const target = await ctx.client.users
			.fetch(
				`${
					this.client.utils.parseId(args.entries[0]) ||
					ctx.interaction?.options.getUser("member")?.id
				}`,
			)
			.catch(() => null);

		if (!target) {
			await ctx.send({
				embeds: [
					new EmbedBuilder()
						.setDescription("You must provide a member to add/remove.")
						.setColor(colors.error),
				],
			});

			return;
		}

		const ids = config.whitelisted_ids || [];
		const index = ids.indexOf(target.id);

		if (index !== -1) {
			ids.splice(index, 1);
		} else {
			ids.push(target.id);
		}

		await voices.configs.update(voice.author_id, config.guild_id, {
			whitelisted_ids: ids,
		});

		await member.voice.channel!.edit(await voices.createOptions(creator, author));

		await ctx.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						index !== -1
							? `Removed ${target} from your temp voice channel whitelist.`
							: `Added ${target} to your temp voice channel whitelist.`,
					)
					.setColor(colors.success),
			],
		});
	}
}

export default TempVoice;
