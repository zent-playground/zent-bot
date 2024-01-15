import GuildManager from "./managers/GuildManager.js";
import MySql from "./mysql/MySql.js";
import Redis from "./redis/Redis.js";
import VoiceManager from "./managers/VoiceManager";

class Managers {
	public guilds: GuildManager;
	public voices: VoiceManager;

	public constructor(mysql: MySql, redis: Redis) {
		this.guilds = new GuildManager(mysql, redis);
		this.voices = new VoiceManager(mysql, redis);
	}
}

export default Managers;
