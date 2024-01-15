export interface Guild {
	readonly id: string;
	prefix: string;
	language: string;
	active: boolean;
	readonly created_at: string;
	deleted_at: string | null;
}

export interface Voice {
	readonly id: number;
	readonly guild_id: string;
	readonly author_id: string;
	readonly name: string;
	readonly started_at: string;
	ended_at: string | null;
	participants: VoiceParticipant[] | null;
}

export interface VoiceParticipant {
	readonly id: number;
	readonly member_id: string;
	readonly joined_at: string;
	left_at: string | null;
}

