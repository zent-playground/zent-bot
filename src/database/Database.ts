import { Client } from "discord.js";

import GuildManager from "./managers/GuildManager.js";
import TempVoiceManager from "./managers/tempVoice/TempVoiceManager.js";
import UserManager from "./managers/UserManager.js";

class Database {
	public guilds: GuildManager;
	public voices: TempVoiceManager;
	public users: UserManager;

	public constructor(client: Client) {
		this.guilds = new GuildManager(client);
		this.voices = new TempVoiceManager(client);
		this.users = new UserManager(client);
	}
}

export default Database;
