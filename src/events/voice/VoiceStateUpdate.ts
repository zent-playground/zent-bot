import {
	Events,
	VoiceState,
	EmbedBuilder,
	ChannelType,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} from "discord.js";

import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public override async execute(oldState: VoiceState, newState: VoiceState) {
		if (oldState.channelId !== newState.channelId) {
			this.handleCreation(newState);
			this.handleDeletion(oldState);
		}
	}

	private async handleCreation(newState: VoiceState) {
		const { channel, guild, member } = newState;

		if (!member || !channel) {
			return;
		}

		const {
			config,
			database: { voices },
		} = this.client;

		const creator = await voices.creators.get(channel.id);

		if (!creator) {
			return;
		}

		if (member.user.bot) {
			await member.voice.setChannel(null).catch(() => void 0);
			return;
		}

		const cooldown = await voices.cooldowns.get(`${member.id}:${guild.id}`);

		if (cooldown) {
			await member.user
				.send({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: guild.name,
								iconURL: guild.iconURL({ forceStatic: true })!,
								url: guild.channels.cache.find((x) => x.isTextBased())?.url,
							})
							.setDescription("You can only create a temporary voice channel every 10 seconds.")
							.setTimestamp()
							.setColor(config.colors.error),
					],
				})
				.catch(() => void 0);

			await member.voice.setChannel(null).catch(() => void 0);

			return;
		}

		const options = await voices.createOptions(creator, member, guild);
		const temp = await guild.channels.create({
			...options,
			type: ChannelType.GuildVoice,
			parent: channel.parent,
		});

		await voices.set(temp.id, {
			author_id: member.id,
			guild_id: guild.id,
			creator_channel_id: channel.id,
		});

		await voices.cooldowns.set(`${member.id}:${guild.id}`, true, { EX: 10 });
		await member.voice.setChannel(temp).catch(() => void 0);

		const message = await temp.send({
			content: `${member}`,
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: member.displayName,
						iconURL: member.displayAvatarURL({ forceStatic: true }),
					})
					.setDescription(
						"### Welcome to your personal temporary voice channel!\nFeel free to manage your channel settings and permissions using the provided dropdown menus.\n\nIf you prefer, you can also use the `/voice` commands.",
					)
					.setColor(config.colors.default),
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder("Voice Settings")
						.setCustomId("voice:panel:settings")
						.setOptions(
							{
								label: "Name",
								description: "Change the channel name",
								value: "name",
								emoji: config.emojis.name,
							},
							{
								label: "Limit",
								description: "Change the channel limit",
								value: "limit",
								emoji: config.emojis.limit,
							},
							{
								label: "Bitrate",
								description: "Change the channel bitrate",
								value: "bitrate",
								emoji: config.emojis.bitrate,
							},
							{
								label: "Nsfw",
								description: "Set your temporary channel to Nsfw",
								value: "nsfw",
								emoji: config.emojis.nsfw,
							},
							{
								label: "Claim",
								description: "Claim ownership of the channel",
								value: "claim",
								emoji: config.emojis.claim,
							},
						),
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder("Voice Permissions")
						.setCustomId("voice:panel:permissions")
						.setOptions(
							{
								label: "Lock",
								description: "Only whitelisted users can join.",
								value: "lock",
								emoji: config.emojis.lock,
							},
							{
								label: "Unlock",
								description: "Only blacklisted users cannot join.",
								value: "unlock",
								emoji: config.emojis.unlock,
							},
							{
								label: "Show",
								description: "Only blacklisted users cannot join",
								value: "show",
								emoji: config.emojis.unghost,
							},
							{
								label: "Hide",
								description: "Only whitelisted users can join.",
								value: "hide",
								emoji: config.emojis.ghost,
							},
						),
				),
			],
		});

		await message.pin().catch(() => 0);
	}

	private async handleDeletion(oldState: VoiceState) {
		const { channel } = oldState;

		if (!channel) {
			return;
		}

		const { voices } = this.client.database;
		const temp = await voices.get(channel.id);

		if (temp && channel.members.size === 0) {
			await channel.delete().catch(() => void 0);
			await voices.update(channel.id, { active: false }).catch(() => void 0);
		}
	}
}

export default VoiceStateUpdate;
