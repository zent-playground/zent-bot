import { TempVoiceJoinable } from "../databases/managers/TempVoice/TempVoiceManager.js";

export interface Guild {
	id: string;
	prefix: string;
	language: string;
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
	affix: string | null;
	generic_name: string | null;
	generic_limit: number | null;
	allow_global_name: boolean | false;
}

export interface TempVoiceConfig {
	id: string;
	guild_id: string | null;
	is_global: boolean | false;
	name: string | null;
	nsfw: boolean | false;
	joinable: TempVoiceJoinable;
	blacklisted_ids: string[];
	whitelisted_ids: string[];
}
