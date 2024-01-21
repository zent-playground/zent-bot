import { ChannelType, Events, VoiceState, PermissionFlagsBits } from "discord.js";

import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { managers } = this.client;
		const { voices, users } = managers;

		if (oldState.channelId !== newState.channelId) {
			if (newState.channel) {
				const { channel, guild, member } = newState;

				if (!member) {
					return;
				}

				const creator = await voices.creators.get(channel.id);
				const user = await users.get(member.id);

				if (creator) {
					const temp = await guild.channels.create({
						name: user?.voice_name || member.user.tag,
						type: ChannelType.GuildVoice,
						parent: channel.parent,
						permissionOverwrites: [
							{
								id: member.id,
								allow: [PermissionFlagsBits.ManageChannels],
							},
						],
					});

					await voices.set(temp.id, {
						name: temp.name,
						author_id: member.id,
						guild_id: guild.id,
					});

					await member.voice.setChannel(temp);
				}
			}

			if (oldState.channel) {
				const { channel } = oldState;
				const temp = await voices.get(channel.id);

				if (temp && channel.members.size === 0) {
					await channel.delete();
					await voices.delete(channel.id);
				}
			}
		}
	}
}

export default VoiceStateUpdate;
