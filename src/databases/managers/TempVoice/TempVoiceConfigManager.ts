import BaseManager from "../../BaseManager.js";

import { TempVoiceConfig } from "../../../types/database.js";

type Options = BaseManager.Optional<TempVoiceConfig, "guild_id">

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_voice_configs");
	}

	public async get(guildId: string, force?: boolean): Promise<TempVoiceConfig | null> {
		const data = await this.cache.get(guildId);

		if (!data || force) {
			const results = await super.select({
				where: `guild_id = '${guildId}'`,
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
		values = Object.assign(values, { guild_id: guildId });
		await super.insert(values);
		await this.cache.set(guildId, (await this.get(guildId, true))!);
	}

	public async edit(guildId: string, values: Options): Promise<void> {
		await super.update(`guild_id = '${guildId}'`, values);
		await this.cache.edit(guildId, values);
	}

	public async clear(guildId: string): Promise<void> {
		await super.delete(`guild_id = '${guildId}'`);
		await this.cache.clear(guildId);
	}
}

export default TempVoiceConfigManager;
