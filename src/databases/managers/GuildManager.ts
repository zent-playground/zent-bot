import BaseManager from "../BaseManager.js";

import { Guild } from "../../types/database.js";

type Options = BaseManager.Optional<Guild, "id">;

class GuildManager extends BaseManager<Guild> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "guilds");
	}

	public async get(guildId: string, force?: boolean): Promise<Guild | null> {
		const data = await this.cache.get(guildId);

		if (!data || force) {
			const results = await this.select({
				where: `id = '${guildId}'`,
				selectFields: ["*"]
			});

			if (results.length > 0) {
				await this.cache.set(guildId, results[0]);
				return results[0];
			}
		}

		return data || null;
	}

	public async set(guildId: string, values: Options): Promise<void> {
		values = Object.assign(values, { id: guildId });
		await this.insert(values);
		await this.cache.set(guildId, (await this.get(guildId, true))!);
	}

	public override async update(guildId: string, values: Options): Promise<void> {
		await super.update(`id = '${guildId}'`, values);
		await this.cache.update(guildId, values);
	}

	public override async delete(guildId: string): Promise<void> {
		await super.delete(`id = '${guildId}'`);
		await this.cache.delete(guildId);
	}
}

export default GuildManager;
