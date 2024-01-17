import { ChannelType, Events, Guild, GuildMember, VoiceBasedChannel, VoiceState } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { voices } = this.client.managers;

		const handleChannelCreation = async (channel: VoiceBasedChannel | null, guild: Guild, member: GuildMember | null) => {
			if (!channel || !member) {
				return;
			}

			const configChannel = await voices.configurations.get(guild.id);
			if (configChannel && channel.id === configChannel.id) {
				const newVoiceChannel = await guild.channels.create({
					name: member.user.tag,
					type: ChannelType.GuildVoice,
					permissionOverwrites: [
						{
							allow: [PermissionFlagsBits.ManageChannels],
							id: member.id
						}
					],
					userLimit: 99,
					parent: channel.parent,
				});

				await member.voice.setChannel(newVoiceChannel.id);
				await voices.set(newVoiceChannel.id, {
					guild_id: guild.id,
					author_id: member.id,
					name: newVoiceChannel.name
				});
			}

			const target = await voices.get(channel.id);
			if (target && target.length > 0) {
				if (member.id != target[0].author_id) {
					await voices.participants.set(channel.id, {
						member_id: member.id,
					});
				}
			}
		};

		const handleChannelDeletion = async (channel: VoiceBasedChannel | null, member: GuildMember | null) => {
			if (!channel || !member) {
				return;
			}

			const target = await voices.get(channel.id);
			if (target && target.length > 0) {
				if (channel.members.size === 0) {
					await channel.delete();
					await voices.edit(channel.id, {
						deleted_at: new Date().toISOString().slice(0, 19).replace("T", " ")
					});
				}

				if (member.id != target[0].author_id) {
					await voices.participants.edit(channel.id, member.id, {
						left_at: new Date().toISOString().slice(0, 19).replace("T", " ")
					});
				}
			}
		};

		if (oldState.channelId !== newState.channelId) {
			if (newState.channelId) {
				await handleChannelCreation(newState.channel, newState.guild, newState.member);
			}

			if (oldState.channelId) {
				await handleChannelDeletion(oldState.channel, oldState.member);
			}
		}
	}
}

export default VoiceStateUpdate;
