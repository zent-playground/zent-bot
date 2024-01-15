import { Events, VoiceState } from "discord.js";
import Listener from "../Listener";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { tempVoiceChannels } = this.client.managers;

		if (oldState.channelId === newState.channelId) {
			const { channel } = newState;

			if (!channel) {
				return;
			}

			if (await tempVoiceChannels.creators.get(channel.id)) {
				// Create temp vc
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
