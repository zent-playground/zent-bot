import { TempVoiceTargets } from "../databases/managers/TempVoice/TempVoiceManager.js";

export interface Guild {
	id: string;
	prefix: string;
	language: string;
	active: boolean;
	created_at: string;
}

export interface User {
	id: string;
	created_at: string;
}

export interface TempVoice {
	id: string;
	guild_id: string;
	author_id: string;
	created_at: string;
}

export interface TempVoiceCreator {
	id: string;
	guild_id: string;
}

export interface TempVoiceConfig {
	id: string;
	name: string | null,
	nsfw: boolean,
	target: TempVoiceTargets,
	blacklisted_ids: string[];
}
