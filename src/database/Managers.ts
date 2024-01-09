import { Guild } from "../types/database.js";
import MySql from "./mysql/MySql.js";
import MySqlManager from "./mysql/MySqlManager.js";
import Redis from "./redis/Redis.js";
import RedisManager from "./redis/RedisManager.js";

class Managers {
	public cache: {
		guilds: RedisManager<Guild>;
	};
	public guilds: MySqlManager<Guild>;

	public constructor(mysql: MySql, redis: Redis) {
		this.cache = {
			guilds: new RedisManager<Guild>(redis.client, redis.prefix)
		};
		this.guilds = new MySqlManager<Guild>(mysql, "guilds");
	}
}

export default Managers;
