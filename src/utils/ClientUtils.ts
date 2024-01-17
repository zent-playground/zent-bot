import { Client, EmbedBuilder, codeBlock } from "discord.js";
import i18next from "i18next";

import Command from "../commands/Command.js";
import Args from "../commands/Args.js";

import { localizations } from "./localizations.js";

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
			(!entry.type || entry.type === "subcommand") &&
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

	public createHelpEmbed(
		command: Command,
		options: {
			language: string;
			usage?: string;
			example?: string;
		},
	) {
		const { description, descriptions } = localizations.get(command.name)!;

		const embed = new EmbedBuilder()
			.setTitle(command.name)
			.setDescription(descriptions[options.language] || description)
			.setColor(this.client.config.colors.default);

		if (command.aliases.length) {
			embed.addFields({
				name: "Aliases:",
				value: command.aliases.map((x) => `\`${x}\``).join(", "),
			});
		}

		if (options.usage) {
			embed.addFields({
				name: `${i18next.t("commands.usage", { lng: options.language })}:`,
				value: codeBlock(options.usage),
			});
		}

		if (options.example) {
			embed.addFields({
				name: `${i18next.t("commands.example", { lng: options.language })}:`,
				value: codeBlock(options.example),
			});
		}

		return embed;
	}
}

export default ClientUtils;
