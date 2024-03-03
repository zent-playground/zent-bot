import { Client, EmbedBuilder, GuildPremiumTier, codeBlock } from "discord.js";

import Command from "../../commands/Command.js";

import { Subcommand, SubcommandBody } from "../../types/subcommand.js";

class ClientUtils {
	public constructor(public client: Client) {}

	public parseId(value: string) {
		if (!value) return;
		return value.match(/[0-9]+/)?.[0];
	}

	public parseSubcommand(
		command: Command,
		args: Command.Args,
		options: { subcommand?: string; subcommandGroup?: string },
	) {
		const { subcommand, subcommandGroup } = options;

		let parent: Subcommand | undefined;

		for (const e of command.options.subcommands || []) {
			if ("subcommands" in e) {
				if (e.name === subcommandGroup) {
					parent = e;
					break;
				}
			} else {
				const target = subcommandGroup || subcommand;

				if (e.name === target) {
					parent = e;
					break;
				} else if (e["default"]) {
					parent = e;
				}
			}
		}

		if (!parent) return;

		let entry: SubcommandBody | undefined;

		if ("subcommands" in parent) {
			for (const sub of parent.subcommands) {
				if (sub.name === subcommand) {
					entry = sub;
					break;
				} else if (sub.default) {
					entry = sub;
				}
			}

			args.entries.splice(0, 1);
		} else {
			entry = parent;
		}

		if (!entry) return;

		args.entrySubcommand = entry;
		args.parentSubcommand = parent;

		if (!entry["subcommands"] && args.entries[0]?.toLowerCase() === entry.name) {
			args.entries.splice(0, 1);
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
		const embed = new EmbedBuilder()
			.setTitle(command.name)
			.setColor(this.client.config.colors.default);

		if (command.aliases.length) {
			embed.addFields({
				name: "Aliases:",
				value: command.aliases.map((x) => `\`${x}\``).join(", "),
			});
		}

		if (options.usage) {
			embed.addFields({
				name: "Usage:",
				value: codeBlock(options.usage),
			});
		}

		if (options.example) {
			embed.addFields({
				name: "Example:",
				value: codeBlock(options.example),
			});
		}

		return embed;
	}
}

export default ClientUtils;

export const getGuildMaxBitrate = (premiumTier: GuildPremiumTier): number => {
	switch (premiumTier) {
		case GuildPremiumTier.None: {
			return 96;
		}

		case GuildPremiumTier.Tier1: {
			return 128;
		}

		case GuildPremiumTier.Tier2: {
			return 256;
		}

		case GuildPremiumTier.Tier3: {
			return 384;
		}
	}
};
