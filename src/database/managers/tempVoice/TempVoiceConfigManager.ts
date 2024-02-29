import { TempVoiceConfig } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voice_configs", mysql, redis);
	}

	public async get(id: string, guildId?: string) {
		const values: Partial<TempVoiceConfig> = {
			id,
			is_global: !guildId,
		};

		if (guildId) {
			values.guild_id = guildId;
		}

		return await super._get(values);
	}

	public async delete(id: string) {
		return await super._del({ id });
	}

	public async set(id: string, values: Partial<TempVoiceConfig>) {
		return await super._set({ id }, values);
	}

	public async update(id: string, values: Partial<TempVoiceConfig>) {
		return await super._upd({ id }, values);
	}

	public async create(
		options: { memberId: string; guildId?: string | null },
		values: Partial<TempVoiceConfig> = {},
	) {
		const { memberId, guildId } = options;

		let config = await this.get({ id: memberId, is_global: true });

		if (!config && guildId) {
			config = await this.get({ id: memberId, guild_id: guildId });
		}

		if (!config) {
			await this.set(
				{
					id: memberId,
					is_global: true,
				},
				values,
			);

			config = await this.get({ id: memberId, is_global: true });
		}

		return config;
	}

	public async edit(
		options: { memberId: string; guildId?: string | null },
		values: Partial<TempVoiceConfig>,
	) {
		const { memberId, guildId } = options;

		const config = await this.create(options, values);

		if (!config) {
			throw new Error("An error occurred while creating user config.");
		}

		return await this.upd(
			config.is_global
				? {
						id: memberId,
						is_global: true,
					}
				: {
						id: memberId,
						guild_id: guildId,
					},
			values,
		);
	}
}

export default TempVoiceConfigManager;
