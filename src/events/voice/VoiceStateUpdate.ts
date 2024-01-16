import { ChannelType, Events, VoiceState } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { voices } = this.client.managers;

		if (newState.channelId && !oldState.channelId) {
			const { channel, guild, member } = newState;

			if (!channel || !member) {
				return;
			}

			const configChannel = await voices.configurations.get(guild.id);

			if (!configChannel) {
				return;
			}

			if (channel.id === configChannel.id) {
				await guild.channels.create({
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
				}).then(async (voice) => {
					await member.voice.setChannel(voice.id);

					await voices.set(voice.id, {
						guild_id: guild.id,
						author_id: member.id,
						name: voice.name
					});
				});

				return;
			}

			const target = await voices.get(channel.id);

			if (!target || target.length < 0) {
				return;
			}

			await voices.participants.set(channel.id, {
				member_id: member.id,
			});
		}

		if (oldState.channelId && !newState.channelId) {
			const { channel, guild, member } = oldState;

			if (!channel || !member) {
				return;
			}

			const target = await voices.get(channel.id);

			if (!target || target.length < 0) {
				return;
			}

			if (channel.members.size === 0) {
				await channel.delete();

				await voices.update(channel.id, {
					deleted_at: new Date().toISOString().slice(0, 19).replace("T", " ")
				});
			}

			if (member.id != target[0].author_id) {
				await voices.participants.update(channel.id, {
					left_at: new Date().toISOString().slice(0, 19).replace("T", " ")
				});
			}
		}
	}
}

export default VoiceStateUpdate;
