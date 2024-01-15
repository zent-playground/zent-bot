import GuildManager from "./managers/GuildManager.js";
import MySql from "./mysql/MySql.js";
import Redis from "./redis/Redis.js";
import TempVoiceChannelManager from "./managers/TempVoice/TempVoiceChannelManager.js";

class Managers {
	public guilds: GuildManager;
	public tempVoiceChannels: TempVoiceChannelManager;

	public constructor(mysql: MySql, redis: Redis) {
		this.guilds = new GuildManager(mysql, redis);
		this.tempVoiceChannels = new TempVoiceChannelManager(mysql, redis);
	}
}

export default Managers;
