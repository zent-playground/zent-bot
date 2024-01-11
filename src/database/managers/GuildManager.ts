import { Guild } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "guilds");
	}

	public async get(id: string): Promise<Guild | null> {
		let data = await this.cache.get(id);

		if (!data) {
			data = (await this.select(`id = '${id}'`))[0];
			await this.cache.set(id, data);
		}

		return data || null;
	}

	public async set(id: string, values: Partial<Guild>): Promise<Guild> {
		values.id = id;

		let guild = await this.get(id);

		if (guild) {
			await this.update(values, `id = '${id}'`);
			guild = Object.assign(guild, values);
		} else {
			await this.insert({ id });
			guild = (await this.select(`id = '${id}'`))[0];
		}

		await this.cache.set(id, guild);

		return guild;
	}

	public async delete(id: string) {
		await super.delete(`id = '${id}'`);
		await this.cache.delete(id);
	}
}

export default GuildManager;
