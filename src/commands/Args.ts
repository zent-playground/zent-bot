import { Subcommand, SubcommandBody } from "../types/subcommand.js";

class Args extends Array<string> {
	public parentSubcommand?: Subcommand;
	public entrySubcommand?: SubcommandBody;
	public language: string = "en";
	public prefix: string = "z";
	
	public constructor(...entries: string[]) {
		super();
		this.push(...entries);
	}
}

export default Args;
