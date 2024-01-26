import { Preconditions } from "../commands/Command.js";

export interface SubcommandBody {
	name: string;
	chatInput?: string;
	hybrid?: string;
	message?: string;
	default?: boolean;
	preconditions?: Preconditions;
}

export interface SubcommandGroupBody extends Omit<SubcommandBody, "default"> {
	subcommands: SubcommandBody[];
}

export type Subcommand = SubcommandBody | SubcommandGroupBody;
