import BaseManager from "../../BaseManager.js";

import { TempVoiceConfig } from "@/types/database.js";

type Options = BaseManager.Optional<TempVoiceConfig, "id">

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_voice_configs");
	}

	public async get(guildId: string, force?: boolean): Promise<TempVoiceConfig | null> {
		const data = await this.cache.get(guildId);

		if (!data || force) {
			const results = await super.select({
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

	public async set(id: string, values: Options): Promise<void> {
		values = Object.assign(values, { id });
		await super.insert(values);
		await this.cache.set(id, (await this.get(id, true))!);
	}

	public async edit(id: string, values: Options): Promise<void> {
		await super.update(`id = '${id}'`, values);
		await this.cache.edit(id, values);
	}

	public async clear(id: string): Promise<void> {
		await super.delete(`id = '${id}'`);
		await this.cache.clear(id);
	}
}

export default TempVoiceConfigManager;
