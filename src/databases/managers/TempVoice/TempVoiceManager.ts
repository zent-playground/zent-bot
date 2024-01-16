import BaseManager from "../../BaseManager.js";

import TempVoiceParticipantManager from "./TempVoiceParticipantManager.js";
import TempVoiceConfigManager from "./TempVoiceConfigManager.js";

import { TempVoice } from "../../../types/database.js";

type Options = BaseManager.Optional<TempVoice, "id">

class TempVoiceManager extends BaseManager<TempVoice> {
	public readonly configurations: TempVoiceConfigManager;
	public readonly participants: TempVoiceParticipantManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_voice");
		this.participants = new TempVoiceParticipantManager(mysql, redis);
		this.configurations = new TempVoiceConfigManager(mysql, redis);
	}

	public async get(channelId?: string, guildId?: string, authorId?: string): Promise<TempVoice[] | null> {
		let conditions = `id = '${channelId}'`;

		if (guildId) {
			conditions += ` AND guild_id = ${guildId}`;
		}

		if (authorId) {
			conditions += ` AND author_id = '${authorId}'`;
		}

		const results = await this.select({
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
		await this.insert(values);
	}

	public override async update(channelId: string, values: Options): Promise<void> {
		await super.update(`id = '${channelId}'`, values);
	}

	public override async delete(channelId: string): Promise<void> {
		await super.delete(`id = '${channelId}'`);
	}
}

export default TempVoiceManager;
