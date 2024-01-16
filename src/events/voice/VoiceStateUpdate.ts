import { ChannelType, Events, VoiceState } from "discord.js";
import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { tempVoiceChannels } = this.client.managers;

		if (newState.channelId) {
			const { channel, guild, member } = newState;

			if (!channel || !member) {
				return;
			}

			if (channel.id === "1196811228652240956") {
				const tempVoiceChannel = await guild.channels.create({
					name: member.user.tag,
					type: ChannelType.GuildVoice,
					parent: channel.parent,
				});

				//await tempVoiceChannels.set(tempVoiceChannel.id, {
				//	author_id: member.user.id,
				//});

				await member.voice.setChannel(tempVoiceChannel.id);
			} else {
				const tempVoice = await tempVoiceChannels.get(channel.id);

				if (!tempVoice) {
					return;
				}

				if (channel.members.size === 0) {
					await channel.delete();
					await tempVoiceChannels.delete(tempVoice.id);
				}
			}
		}
	}
}

export default VoiceStateUpdate;
