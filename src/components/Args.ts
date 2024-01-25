class Args extends Array {
	public references?: string[];
	public language: string = "en";
	
	public constructor(...entries: string[]) {
		super();
		this.push(...entries);
	}
}

export default Args;
