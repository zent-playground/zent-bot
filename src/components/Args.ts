class Args {
	public references?: string[];
	public language: string = "en";
	public constructor(public entries: string[] = []) {}
}

export default Args;
