import { Guild } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "guilds");
	}

	public async get(id: string): Promise<Guild | null> {
		let data = await this.cache.get(id);

		if (!data) {
			data = (await super.select(`id = '${id}'`))[0];
			await this.cache.set(id, data);
		}

		return data || null;
	}

	public async set(id: string, values: Partial<Guild>) {
		values = Object.assign(values, { id });
		await super.insert(values);
		await this.cache.set(id, (await super.select(`id = '${id}'`))[0]);
	}

	public override async update(id: string, values: Partial<Guild>) {
		await super.update(`id = '${id}'`, values);
		await this.cache.update(id, values);
	}

	public override async delete(id: string) {
		await super.delete(`id = '${id}'`);
		await this.cache.delete(id);
	}
}

export default GuildManager;
