import { Client } from "discord.js";
import Command from "../commands/Command.js";
import Args from "../commands/Args.js";
import { Subcommand, SubcommandBody } from "../types/subcommand.js";

class ClientUtils {
	public constructor(public client: Client) {}

	public parseId(value: string) {
		if (!value) return;
		return value.match(/[0-9]+/)?.[0];
	}

	public parseSubcommand(
		command: Command,
		args: Args,
		options: { subcommand?: string; subcommandGroup?: string },
	) {
		const { subcommand, subcommandGroup } = options;

		let parent: Subcommand | undefined;

		for (const e of command.options.subcommands || []) {
			if (e.type === "group" && e.name === subcommandGroup) {
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

		let entry: SubcommandBody | undefined;

		if (parent.type === "group") {
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

		args.entrySubcommand = entry;
		args.parentSubcommand = parent;

		if (parent.type === "group") {
			args.entries = args.entries.slice(1);
		}

		if (
			entry.type === "subcommand" &&
			args.entries[0]?.toLowerCase() === entry.name
		) {
			args.entries = args.entries.slice(1);
		}

		return {
			entry,
			parent,
			command,
		};
	}
}

export default ClientUtils;
