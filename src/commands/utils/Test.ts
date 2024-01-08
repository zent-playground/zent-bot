import Command from "../Command.js";

class Test extends Command {
	public constructor() {
		super({
			name: "test",
			description: "test",
			subcommands: [
				{
					name: "food",
					type: "subcommand-group",
					subcommands: [
						{
							name: "list",
							default: true,
							hybrid: "foodList",
						},
						{
							name: "add",
							hybrid: "foodAdd",
						},
					],
				},
				{
					name: "toy",
					type: "subcommand-group",
					subcommands: [
						{
							name: "list",
							default: true,
							hybrid: "toyList",
						},
						{
							name: "add",
							hybrid: "toyAdd",
						},
					],
				},
				{
					name: "default",
					hybrid: "default",
					default: true,
				},
			],
		});
	}

	public async default(ctx: Command.HybridContext) {
		await ctx.send({ content: "Test!" });
	}

	public async foodList(ctx: Command.HybridContext) {
		await ctx.send({ content: "food.list" });
	}

	public async foodAdd(ctx: Command.HybridContext) {
		await ctx.send({ content: "food.add" });
	}

	public async toyList(ctx: Command.HybridContext) {
		await ctx.send({ content: "toy.list" });
	}

	public async toyAdd(ctx: Command.HybridContext) {
		await ctx.send({ content: "toy.add" });
	}
}

export default Test;
