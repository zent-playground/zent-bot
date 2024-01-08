export interface SubcommandBody {
	name: string;
	type: "subcommand";
	chatInput?: string;
	hybrid?: string;
	message?: string;
	default?: boolean;
}

export interface SubcommandGroupBody extends SubcommandBody {
	type: "subcommand-group";
	subcommands: SubcommandBody[];
}

export type Subcommand = SubcommandBody | SubcommandGroupBody;
