import { Client } from "discord.js";
import Command from "../commands/Command.js";
import Args from "../commands/Args.js";

class ClientUtils {
	public constructor(public client: Client) {}

	public parseId(value: string) {
		if (!value) return;
		return value.match(/[0-9]+/)?.[0];
	}

	public parseSubcommand(command: Command, name: string) {
		if (!name) return;

		let subcommand: string | undefined;
		let subcommandGroup: string | undefined;

		const splitted = name.split(":");

		if (splitted.length > 1) {
			subcommand = splitted[1];
			subcommandGroup = splitted[0];
		} else {
			subcommand = splitted[0];
		}

		const parent = command.options.subcommands?.find((e) => {
			if (subcommandGroup) {
				return e.type === "subcommand-group" && e.name === subcommandGroup;
			} else {
				return (e.type === "subcommand" && e.name === subcommand) || e.default;
			}
		});

		if (!parent) return;

		let entry;

		if (parent.type === "subcommand-group") {
			entry = parent.subcommands.find((x) => x.name === subcommand || x.default);
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
