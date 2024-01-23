import { TempVoiceConfig } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

class TempVoiceConfigManager extends BaseManager<TempVoiceConfig> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voice_configs", mysql, redis);
	}
}

export default TempVoiceConfigManager;
