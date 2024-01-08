import { Client } from "discord.js";
import Command from "../commands/Command.js";
import Args from "../commands/Args.js";

class ClientUtils {
	public constructor(public client: Client) {}

	public parseId(value: string) {
		if (!value) return;
		return value.match(/[0-9]+/)?.[0];
	}

	public parseSubcommand(
		command: Command,
		options: { subcommand?: string; subcommandGroup?: string },
	) {
		const { subcommand, subcommandGroup } = options;

		let parent;

		for (const e of command.options.subcommands || []) {
			if (e.type === "subcommand-group" && e.name === subcommandGroup) {
				parent = e;
				break;
			}

			if (!e.type || e.type === "subcommand") {
				const target = subcommandGroup || subcommand;

				if (e.name === target) {
					parent = e;
					break;
				} else if (e.default) {
					parent = e;
				}
			}
		}

		if (!parent) return;

		let entry;

		if (parent.type === "subcommand-group") {
			for (const sub of parent.subcommands) {
				if (sub.name === subcommand) {
					entry = sub;
					break;
				} else if (sub.default) {
					entry = sub;
				}
			}
		} else {
			entry = parent;
		}

		if (!entry) return;

		const args = new Args();

		args.entrySubcommand = entry;
		args.parentSubcommand = parent;

		return {
			args,
			entry,
			parent,
			command,
		};
	}
}

export default ClientUtils;
