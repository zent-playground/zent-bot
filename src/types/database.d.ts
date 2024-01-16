export interface Guild {
	readonly id: string;
	prefix: string;
	language: string;
	active: boolean;
	readonly created_at: string;
}

export interface TempVoiceChannel {
	readonly id: string;
	readonly author_id: string;
}

export interface CreatorVoiceChannel {
	readonly id: number;
}