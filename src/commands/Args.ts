import { Subcommand, SubcommandBody } from "../types/subcommand.js";

class Args {
	public parentSubcommand?: Subcommand;
	public entrySubcommand?: SubcommandBody;
	public language: string = "en";
	public prefix: string = "z";
	public constructor(public entries: string[] = []) {}
}

export default Args;
