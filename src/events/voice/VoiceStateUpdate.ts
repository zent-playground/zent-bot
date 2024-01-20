import {
	ChannelType,
	Events,
	VoiceState,
	PermissionFlagsBits,
	EmbedBuilder,
} from "discord.js";

import Listener from "../Listener.js";
import { formatTimestamp } from "@/utils/index.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { voices } = this.client.managers;

		const handleChannelCreation = async () => {
			const { channel, guild, member } = newState;

			if (!channel || !member) {
				return;
			}

			const configChannel = await voices.configurations.get(channel.id);

			if (configChannel) {
				const cooldown = await voices.cooldowns.get(member.id);

				if (cooldown !== null) {
					if (!cooldown) {
						await member.user.send({
							embeds: [
								new EmbedBuilder()
									.setDescription(
										"Hey! You can only a create temporary voice channel every 10 seconds.",
									)
									.setColor("Red"),
							],
						});

						await voices.cooldowns.edit(member.id, true).catch(() => 0);
					}

					await member.voice.setChannel(null);

					return;
				}

				if (member.user.bot) {
					await member.voice.setChannel(null);
					return;
				}

				const newVoiceChannel = await guild.channels.create({
					name: member.user.tag,
					type: ChannelType.GuildVoice,
					permissionOverwrites: [
						{
							allow: [PermissionFlagsBits.ManageChannels],
							id: member.id,
						},
					],
					userLimit: 99,
					parent: channel.parent,
				});

				await member.voice.setChannel(newVoiceChannel.id);

				await voices.set(newVoiceChannel.id, {
					guild_id: guild.id,
					author_id: member.id,
					name: newVoiceChannel.name,
				});

				await voices.cooldowns.set(member.id, false, { EX: 10 });
			}

			const target = await voices.get(channel.id);

			if (target && target.length > 0 && member.id != target[0].author_id) {
				await voices.participants.set(channel.id, {
					member_id: member.id,
				});
			}
		};

		const handleChannelDeletion = async () => {
			const { channel, member } = oldState;

			if (!channel || !member) {
				return;
			}

			const target = await voices.get(channel.id);

			if (target && target.length > 0) {
				if (channel.members.size === 0) {
					await channel.delete();
					await voices.edit(channel.id, {
						deleted_at: formatTimestamp(),
					});
				}

				if (member.id != target[0].author_id) {
					await voices.participants.edit(channel.id, member.id, {
						left_at: formatTimestamp(),
					});
				}
			}
		};

		if (oldState.channelId !== newState.channelId) {
			if (newState.channelId) {
				handleChannelCreation();
			}

			if (oldState.channelId) {
				handleChannelDeletion();
			}
		}
	}
}

export default VoiceStateUpdate;
