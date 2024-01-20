import BaseManager from "../../BaseManager.js";
import RedisManager from "../../redis/RedisManager.js";

import TempVoiceConfigManager from "./TempVoiceConfigManager.js";
import TempVoiceParticipantManager from "./TempVoiceParticipantManager.js";

import { TempVoice } from "@/types/database.js";

type Options = BaseManager.Optional<TempVoice, "id">

class TempVoiceManager extends BaseManager<TempVoice> {
	public readonly configurations: TempVoiceConfigManager;
	public readonly participants: TempVoiceParticipantManager;
	public readonly cooldowns: RedisManager<boolean>;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_voice");
		this.participants = new TempVoiceParticipantManager(mysql, redis);
		this.configurations = new TempVoiceConfigManager(mysql, redis);
		this.cooldowns = new RedisManager<boolean>(redis.client, `${redis.prefix}temp_voice_cooldowns`);
	}

	public async get(channelId?: string, guildId?: string, authorId?: string): Promise<TempVoice[] | null> {
		let conditions = `id = '${channelId}'`;

		if (guildId) {
			conditions += ` AND guild_id = ${guildId}`;
		}

		if (authorId) {
			conditions += ` AND author_id = '${authorId}'`;
		}

		const results = await super.select({
			where: conditions,
			selectFields: ["*"]
		});

		if (results.length > 0) {
			return results;
		}

		return null;
	}

	public async set(channelId: string, values: Options): Promise<void> {
		values = Object.assign(values, { id: channelId });
		await super.insert(values);
	}

	public async edit(channelId: string, values: Options): Promise<void> {
		await super.update(`id = '${channelId}'`, values);
	}

	public async clear(channelId: string): Promise<void> {
		await super.delete(`id = '${channelId}'`);
	}
}

export default TempVoiceManager;
