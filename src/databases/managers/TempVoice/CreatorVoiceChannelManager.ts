import { CreatorVoiceChannel } from "../../../types/database.js";
import BaseManager from "../../BaseManager.js";

type Options = BaseManager.Optional<CreatorVoiceChannel, "id">;

class CreatorVoiceChannelManager extends BaseManager<CreatorVoiceChannel> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "creator_vcs");
	}

	public async get(id: string): Promise<CreatorVoiceChannel | null> {
		let data = await this.cache.get(id);

		if (!data) {
			data = (await super.select(`id = '${id}'`))[0];
			await this.cache.set(String(id), data);
		}

		return data || null;
	}

	public async set(id: string | number, values: Options): Promise<void> {
		values = Object.assign(values, { id: id });
		await super.insert(values);
		await this.cache.set(id, (await super.select(`id = '${id}'`))[0]);
	}

	public override async update(id: string | number, values: Options): Promise<void> {
		await super.update(`id = '${id}'`, values);
		await this.cache.update(id, values);
	}

	public override async delete(id: string | number): Promise<void> {
		await super.delete(`id = '${id}'`);
		await this.cache.delete(id);
	}
}

export default CreatorVoiceChannelManager;
