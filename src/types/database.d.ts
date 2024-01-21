export interface Guild {
	id: string;
	prefix: string;
	language: string;
	active: boolean;
	created_at: string;
}

export interface User {
	id: string;
	voice_name: string | null;
	created_at: string;
}

export interface TempVoice {
	id: string;
	guild_id: string;
	author_id: string;
	name: string;
	created_at: string;
}

export interface TempVoiceCreator {
	id: string;
	guild_id: string;
}
