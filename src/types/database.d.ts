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
	creator_id: string;
	active: boolean;
	created_at: string;
}

export interface TempVoiceCreator {
	id: string;
	guild_id: string;
	affix: string | null;
	generic_name: string | null;
	generic_limit: number | null;
	allow_custom_name: boolean | false;
}

export interface TempVoiceConfig {
	id: string;
	guild_id: string | null;
	is_global: boolean;
	name: string | null;
	nsfw: boolean;
	joinable: TempVoiceJoinable;
	blacklisted_ids: string[];
	whitelisted_ids: string[];
}
