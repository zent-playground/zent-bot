import BaseManager from "../BaseManager";
import { Voice, VoiceParticipant } from "../../types/database";

class VoiceManager extends BaseManager<Voice> {
	private readonly participant: BaseManager<VoiceParticipant>;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super(mysql, redis, "voices");
		this.participant = new BaseManager<VoiceParticipant>(mysql, redis, "voices_participants");
	}

	public async get(voiceId: string | number, force: boolean = false): Promise<Voice | null> {
		let data = await this.cache.get(voiceId);

		if (!data || force) {
			data = (await super.select(`id = '${voiceId}'`))[0];
			data.participants = await this.getParticipant(voiceId);
			await this.cache.set(String(voiceId), data);
		}

		return data || null;
	}

	public async set(voiceId: string | number, values: Partial<Voice>) {
		values = Object.assign(values, { id: voiceId });
		await super.insert(values);
		await this.cache.set(voiceId, (await super.select(`id = '${voiceId}'`))[0]);
	}

	public override async update(voiceId: string | number, values: Partial<Voice>) {
		await super.update(`id = '${voiceId}'`, values);
		await this.cache.update(voiceId, values);
	}

	public override async delete(voiceId: string | number) {
		await super.delete(`id = '${voiceId}'`);
		await this.cache.delete(voiceId);
	}

	public async getParticipant(voiceId: string | number, memberId?: string): Promise<VoiceParticipant[] | null> {
		const data = await this.cache.get(voiceId);

		if (!data?.participants) {
			return await this.participant.select(`id = '${voiceId}' ${memberId ? `AND member_id = '${memberId}'` : ""}`);
		}

		return data.participants;
	}

	public async setParticipant(voiceId: string | number, values: Partial<VoiceParticipant>) {
		values = Object.assign(values, { id: voiceId });
		await this.participant.insert(values);
		await this.cache.delete(voiceId);
	}

	public async updateParticipant(voiceId: string | number, memberId: string, values: Partial<VoiceParticipant>) {
		await this.participant.update(`id = '${voiceId}' AND memberId = '${memberId}'`, values);
		await this.cache.delete(voiceId);
	}

	public async deleteParticipant(voiceId: string | number, memberId: string) {
		await this.participant.delete(`id = '${voiceId}' AND member_id = '${memberId}'`);
		await this.cache.delete(voiceId);
	}
}

export default VoiceManager;
