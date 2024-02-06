import {
	Events,
	VoiceState,
	EmbedBuilder,
	ChannelType,
	ActionRowBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
} from "discord.js";

import Listener from "../Listener.js";
import { ButtonStyle } from "discord-api-types/v10";

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
			managers: { voices },
		} = this.client;
		const creator = await voices.creators.get({ id: channel.id });

		if (!creator) {
			return;
		}

		if (member.user.bot) {
			await member.voice.setChannel(null).catch(() => void 0);
			return;
		}

		const cooldown = await voices.cooldowns.get([member.id, guild.id]);

		if (cooldown) {
			await member.user
				.send({
					embeds: [
						new EmbedBuilder()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL({ forceStatic: true })! })
							.setDescription(
								"You can only create a temporary voice channel every 10 seconds.",
							)
							.setTimestamp()
							.setColor(config.colors.error),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setLabel(`Sent from **${guild.name}**`)
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true)
								.setCustomId("origin"),
						),
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

		await voices.set(
			{ id: temp.id },
			{ author_id: member.id, guild_id: guild.id, creator_channel_id: channel.id },
		);

		await voices.cooldowns.set([member.id, guild.id], true, { EX: 10 });
		await member.voice.setChannel(temp).catch(() => void 0);

		await temp
			.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: member.user.globalName || member.user.tag,
							iconURL: member.displayAvatarURL({ forceStatic: true }),
						})
						.setDescription(
							"**Welcome to your personal temporary voice channel!**\n\nFeel free to manage your channel settings and permissions using the provided dropdown menus.\n\nIf you prefer, you can also use the `/voice` commands.",
						)
						.setColor(this.client.config.colors.default),
				],
				components: [
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setPlaceholder("Voice Settings")
							.setCustomId("voice-settings")
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
									label: "Game",
									description: "Change the channel name to the game you're playing",
									value: "game",
									emoji: config.emojis.gaming,
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
							.setCustomId("voice-permissions")
							.setOptions(
								{
									label: "Lock",
									description: "Lock the channel",
									value: "lock",
									emoji: config.emojis.lock,
								},
								{
									label: "Unlock",
									description: "Unlock the channel",
									value: "unlock",
									emoji: config.emojis.unlock,
								},
								{
									label: "Permit",
									description: "Permit users/roles to access the channel",
									value: "permit",
									emoji: config.emojis.permit,
								},
								{
									label: "Reject",
									description: "Reject users/roles to access the channel",
									value: "reject",
									emoji: config.emojis.reject,
								},
								{
									label: "Invite",
									description: "Invite a user to access the channel",
									value: "invite",
									emoji: config.emojis.invite,
								},
								{
									label: "Ghost",
									description: "Make your channel invisible",
									value: "ghost",
									emoji: config.emojis.ghost,
								},
								{
									label: "Unghost",
									description: "Make your channel visible",
									value: "unghost",
									emoji: config.emojis.unghost,
								},
							),
					),
				],
			})
			.then(() => {
				temp
					.send({ content: `<@${member.id}>`, allowedMentions: { users: [member.id] } })
					.then((m) => m.delete());
			});
	}

	private async handleDeletion(oldState: VoiceState) {
		const { channel } = oldState;

		if (!channel) {
			return;
		}

		const { voices } = this.client.managers;
		const temp = await voices.get({ id: channel.id });

		if (temp && channel.members.size === 0) {
			await channel.delete().catch(() => void 0);
			await voices.upd({ id: channel.id }, { active: false }).catch(() => void 0);
		}
	}
}

export default VoiceStateUpdate;
