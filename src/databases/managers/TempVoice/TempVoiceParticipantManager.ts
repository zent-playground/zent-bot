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

		const results = await super.select({
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

	public async edit(channelId: string, memberId: string, values: Options): Promise<void> {
		return super.update(`id = ${channelId} AND member_id = ${memberId}`, values);
	}

	public async clear(channelId: string, memberId: string): Promise<void> {
		return super.delete(`id = ${channelId} AND member_id = ${memberId}`);
	}
}

export default TempVoiceParticipantManager;
