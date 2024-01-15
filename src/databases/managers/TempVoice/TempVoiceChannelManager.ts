import BaseManager from "../../BaseManager";
import { TempVoiceChannel } from "../../../types/database";
import CreatorVoiceChannelManager from "./CreatorVoiceChannelManager.js";

type Options = BaseManager.Optional<TempVoiceChannel, "id">;

class TempVoiceChannelManager extends BaseManager<TempVoiceChannel> {
	public creators: CreatorVoiceChannelManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_vcs");
		this.creators = new CreatorVoiceChannelManager(mysql, redis);
	}

	public async get(id: string | number, force: boolean = false) {
		let data = await this.cache.get(id);

		if (!data || force) {
			data = (await super.select(`id = '${id}'`))[0];
			await this.cache.set(String(id), data);
		}

		return data || null;
	}

	public async set(id: string | number, values: Options) {
		values = Object.assign(values, { id: id });
		await super.insert(values);
		await this.cache.set(id, (await super.select(`id = '${id}'`))[0]);
	}

	public override async update(id: string | number, values: Options) {
		await super.update(`id = '${id}'`, values);
		await this.cache.update(id, values);
	}

	public override async delete(id: string | number) {
		await super.delete(`id = '${id}'`);
		await this.cache.delete(id);
	}
}

export default TempVoiceChannelManager;
