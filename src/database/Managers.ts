import GuildManager from "./managers/GuildManager.js";
import MySql from "./mysql/MySql.js";
import Redis from "./redis/Redis.js";

class Managers {
	public guilds: GuildManager;

	public constructor(mysql: MySql, redis: Redis) {
		this.guilds = new GuildManager(mysql, redis);
	}
}

export default Managers;
