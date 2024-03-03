import { Client } from "discord.js";

import { TempVoiceConfig } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(client: Client) {
		super(client, "temp_voice_configs");
	}

	public async getDefault(id: string, guildId?: string | null) {
		const { voices } = this.client.database;
		return (await voices.configs.get(id, guildId, true)) || (await voices.configs.set(id, null));
	}

	public async get(id: string, guildId?: string | null, auto: boolean = false) {
		const guildOptions = { id, guild_id: guildId };
		const globalOptions = { id, is_global: true };

		if (auto) {
			if (guildId) {
				return (await this._get(guildOptions)) || (await this._get(globalOptions));
			} else {
				return await this._get(globalOptions);
			}
		} else {
			if (guildId) {
				return await this._get(guildOptions);
			} else {
				return await this._get(globalOptions);
			}
		}
	}

	public async set(
		id: string,
		guildId: string | undefined | null,
		values: Partial<TempVoiceConfig> = {},
	) {
		return guildId
			? await this._set({ id, guild_id: guildId }, values)
			: await this._set({ id, is_global: true }, values);
	}

	public async update(
		id: string,
		guildId: string | undefined | null,
		values: Partial<TempVoiceConfig>,
	) {
		return guildId
			? await this._upd({ id, guild_id: guildId }, values)
			: await this._upd({ id, is_global: true }, values);
	}

	public async delete(id: string, guildId?: string) {
		return guildId
			? await this._del({ id, guild_id: guildId })
			: await this._del({ id, is_global: true });
	}
}

export default TempVoiceConfigManager;
