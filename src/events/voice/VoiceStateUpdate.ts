import { Events, VoiceState } from "discord.js";
import Listener from "../Listener";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {

	}
}

export default VoiceStateUpdate;
