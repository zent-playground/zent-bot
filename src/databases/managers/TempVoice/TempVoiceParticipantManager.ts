import BaseManager from "../../BaseManager.js";

import { TempVoiceParticipant } from "../../../types/database.js";

type Options = BaseManager.Optional<TempVoiceParticipant, "id">;

class TempVoiceParticipantManager extends BaseManager<TempVoiceParticipant> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "temp_voice_participants");
	}

	public async get(voiceId: string, memberId?: string): Promise<TempVoiceParticipant[] | null> {
		let conditions = `id = '${voiceId}'`;

		if (memberId) {
			conditions += ` AND member_id = '${memberId}'`;
		}

		const results = await this.select({
			where: conditions,
			selectFields: ["*"],
		});

		if (results.length > 0) {
			return results;
		}

		return null;
	}

	public async set(channelId: string, values: Options): Promise<void> {
		Object.assign(values, { id: channelId });
		await super.insert(values);
	}

	public override async update(channelId: string, values: Options): Promise<void> {
		return super.update(`id = ${channelId}`, values);
	}

	public override async delete(channelId: string): Promise<void> {
		return super.delete(`id = ${channelId}`);
	}
}

export default TempVoiceParticipantManager;
