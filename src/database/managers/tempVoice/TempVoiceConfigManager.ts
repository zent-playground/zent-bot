import { TempVoiceConfig } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voice_configs", mysql, redis);
	}

	public async create(
		options: { id: string; guildId?: string | null; forceGuild?: boolean },
		values: Partial<TempVoiceConfig> = {},
	) {
		const { id, guildId } = options;

		if (guildId) {
			return (
				(await this._get({ id, guild_id: guildId })) ||
				(await this._set({ id, guild_id: guildId }, values))
			);
		} else {
			return (
				(await this._get({ id, is_global: true })) ||
				(await this._set({ id, is_global: true }, values))
			);
		}
	}

	public async edit(
		options: { id: string; guildId?: string | null },
		values: Partial<TempVoiceConfig>,
	) {
		const { id, guildId } = options;

		const config = await this.create(options, values);

		if (!config) {
			throw new Error("An error occurred while creating user config.");
		}

		return await this._upd(
			config.is_global ? { id, is_global: true } : { id, guild_id: guildId },
			values,
		);
	}

	public async delete(options: { id: string; guildId: string }) {
		const { id, guildId } = options;
		await this._del(guildId ? { id, guild_id: guildId } : { id, is_global: true });
	}
}

export default TempVoiceConfigManager;
