import BaseManager from "../BaseManager.js";

import { Guild } from "../../types/database.js";

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("guilds", mysql, redis);
	}
}

export default GuildManager;
