import { SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";

class Test extends Command {
	public constructor() {
		super({
			name: "test",
			description: "test",
			subcommands: [
				{
					name: "food",
					type: "group",
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
					type: "group",
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

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommandGroup((group) =>
					group
						.setName("food")
						.setDescription("Food!")
						.addSubcommand((subcommand) => subcommand.setName("list").setDescription("..."))
						.addSubcommand((subcommand) => subcommand.setName("add").setDescription("...")),
				)
				.addSubcommandGroup((group) =>
					group
						.setName("toy")
						.setDescription("Toy!")
						.addSubcommand((subcommand) => subcommand.setName("list").setDescription("..."))
						.addSubcommand((subcommand) => subcommand.setName("add").setDescription("...")),
				)
				.toJSON(),
		);
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
