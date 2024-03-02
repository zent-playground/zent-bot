import { Client } from "discord.js";

import { TempVoiceConfig } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

interface Options {
	id: string;
	guildId?: string | null;
}

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(client: Client) {
		super(client, "temp_voice_configs");
	}

	public async default({ id, guildId }: Options) {
		const { voices } = this.client.database;

		return (
			(await voices.configs.get({ id, guildId: guildId, auto: true })) ||
			(await voices.configs.set({ id }))
		);
	}

	public async get({ id, guildId, auto = false }: Options & { auto?: boolean }) {
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

	public async set({ id, guildId }: Options, values: Partial<TempVoiceConfig> = {}) {
		return guildId
			? await this._set({ id, guild_id: guildId }, values)
			: await this._set({ id, is_global: true }, values);
	}

	public async update({ id, guildId }: Options, values: Partial<TempVoiceConfig>) {
		return guildId
			? await this._upd({ id, guild_id: guildId }, values)
			: await this._upd({ id, is_global: true }, values);
	}

	public async delete({ id, guildId }: Options) {
		return guildId
			? await this._del({ id, guild_id: guildId })
			: await this._del({ id, is_global: true });
	}
}

export default TempVoiceConfigManager;
