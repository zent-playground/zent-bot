import { Guild } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

type Options = BaseManager.Optional<Guild, "id">;

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "guilds");
	}

	public async get(guildId: string): Promise<Guild | null> {
		let data = await this.cache.get(guildId);

		if (!data) {
			data = (await super.select(`id = '${guildId}'`))[0];
			await this.cache.set(guildId, data);
		}

		return data || null;
	}

	public async set(guildId: string, values: Options) {
		values = Object.assign(values, { id: guildId });
		await super.insert(values);
		await this.cache.set(guildId, (await super.select(`id = '${guildId}'`))[0]);
	}

	public override async update(guildId: string, values: Options) {
		await super.update(`id = '${guildId}'`, values);
		await this.cache.update(guildId, values);
	}

	public override async delete(guildId: string) {
		await super.delete(`id = '${guildId}'`);
		await this.cache.delete(guildId);
	}
}

export default GuildManager;
