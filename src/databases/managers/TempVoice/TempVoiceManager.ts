import BaseManager from "../../BaseManager.js";
import RedisManager from "../../redis/RedisManager.js";

import { TempVoice } from "../../../types/database.js";
import TempVoiceCreatorManager from "./TempVoiceCreatorManager.js";

class TempVoiceManager extends BaseManager<TempVoice> {
	public readonly cooldowns: RedisManager<boolean>;
	public readonly creators: TempVoiceCreatorManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voices", mysql, redis);

		this.cooldowns = new RedisManager<boolean>(
			redis.client,
			`${redis.prefix}temp_voice_cooldowns`,
		);

		this.creators = new TempVoiceCreatorManager(mysql, redis);
	}
}

export default TempVoiceManager;
