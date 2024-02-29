import BaseManager from "../../BaseManager.js";
import { TempVoiceCreator } from "../../../types/database.js";

class TempVoiceCreatorManager extends BaseManager<TempVoiceCreator> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voice_creators", mysql, redis);
	}

	public async get(id: string) {
		return await super._get({ id });
	}

	public async delete(id: string) {
		return await super._del({ id });
	}

	public async set(id: string, values: Partial<TempVoiceCreator>) {
		return await super._set({ id }, values);
	}

	public async update(id: string, values: Partial<TempVoiceCreator>) {
		return await super._upd({ id }, values);
	}
}

export default TempVoiceCreatorManager;
