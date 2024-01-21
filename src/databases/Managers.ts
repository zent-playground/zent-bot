import GuildManager from "./managers/GuildManager.js";
import TempVoiceManager from "./managers/TempVoice/TempVoiceManager.js";
import UserManager from "./managers/UserManager.js";

import MySql from "./mysql/MySql.js";
import Redis from "./redis/Redis.js";

class Managers {
	public guilds: GuildManager;
	public voices: TempVoiceManager;
	public users: UserManager;

	public constructor(mysql: MySql, redis: Redis) {
		this.guilds = new GuildManager(mysql, redis);
		this.voices = new TempVoiceManager(mysql, redis);
		this.users = new UserManager(mysql, redis);
	}
}

export default Managers;
