export interface Guild {
	readonly id: string; // Refer to guild id
	prefix: string;
	language: string;
	active: boolean; // If bot is in this guild
	readonly created_at: string;
}

export interface TempVoice {
	readonly id: string; // Refer to channel id
	readonly guild_id: string; // Guild(id)
	readonly author_id: string;
	name: string;
	readonly created_at: string;
	deleted_at: string | null;
}

export interface TempVoiceConfig {
	id: string; // Refer to channel id
	readonly guild_id: string; // Guild(id)
}

export interface TempVoiceParticipant {
	readonly id: string; // TempVoice(id)
	readonly member_id: string;
	readonly joined_at: string;
	left_at: string | null;
}
