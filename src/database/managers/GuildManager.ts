import BaseManager from "../BaseManager.js";

import { Guild } from "../../types/database.js";

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("guilds", mysql, redis);
	}

	public async get(id: string) {
		return await super._get({ id });
	}

	public async delete(id: string) {
		return await super._del({ id });
	}

	public async set(id: string, values: Partial<Guild>) {
		return await super._set({ id }, values);
	}

	public async update(id: string, values: Partial<Guild>) {
		return await super._upd({ id }, values);
	}
}

export default GuildManager;
