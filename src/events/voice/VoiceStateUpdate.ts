import { ChannelType, Events, VoiceState, PermissionFlagsBits, Collection } from "discord.js";

import Listener from "../Listener.js";
import { formatTimestamp } from "../../utils/index.js";

const cooldowns = new Collection<string, boolean>();

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
				if (cooldowns.has(member.id)) {
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

				await channel.edit({
					permissionOverwrites: [
						{
							deny: [PermissionFlagsBits.Connect],
							id: member.id,
						},
					],
				});

				await voices.set(newVoiceChannel.id, {
					guild_id: guild.id,
					author_id: member.id,
					name: newVoiceChannel.name,
				});

				cooldowns.set(member.id, false);

				setTimeout(() => {
					cooldowns.delete(member.id);
					channel.permissionOverwrites.delete(member.id).catch(() => null);
				}, 10000);
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
