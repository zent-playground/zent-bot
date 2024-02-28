import BaseManager from "../../BaseManager.js";
import { TempVoiceCreator } from "../../../types/database.js";

class TempVoiceCreatorManager extends BaseManager<TempVoiceCreator> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voice_creators", mysql, redis);
	}

	public async fetch(id: string) {
		return await this.get({ id });
	}
}

export default TempVoiceCreatorManager;
