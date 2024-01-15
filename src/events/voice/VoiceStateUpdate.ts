import { Events, VoiceState } from "discord.js";
import Listener from "../Listener";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { voices } = this.client.managers;

		if (oldState.channelId) {
			const channel = oldState.channel;

			if (!channel) {
				return;
			}

			const voice = await voices.get(channel.id);

			if (!voice) {
				return;
			}

			const member = oldState.member!;

			await voices.updateParticipant(voice.id, member.id, {
				left_at: String(+new Date)
			});

			if (channel.members.size === 0) {
				await channel.delete();
				await voices.update(voice.id, {
					ended_at: String(+new Date)
				});
			}
		}

		// if (newState.channel) {
		//	 newState.setChannel()
		// }
	}
}

export default VoiceStateUpdate;
