import { Client, EmbedBuilder, GuildPremiumTier, codeBlock } from "discord.js";

import Command from "../../commands/Command.js";

import { SubcommandBody, SubcommandGroupBody } from "../../types/subcommand.js";

class ClientUtils {
	public constructor(public client: Client) {}

	public parseId(value: string) {
		if (!value) {
			return;
		}

		return value.match(/[0-9]+/)?.[0];
	}

	public parseSubcommand(
		command: Command,
		args: Command.Args,
		{
			subcommand,
			subcommandGroup,
		}: { subcommand?: string | null; subcommandGroup?: string | null },
	) {
		let parent: SubcommandGroupBody | null = null;
		let entry: SubcommandBody | null = null;

		for (const e of command.options.subcommands || []) {
			if ("subcommands" in e) {
				if (e.name === subcommandGroup?.toLowerCase()) {
					parent = e;
					break;
				}
			} else {
				if (subcommand) {
					if (e.name === subcommand?.toLowerCase()) {
						entry = e;
						break;
					}
				} else if (e.default) {
					entry = e;
				}
			}
		}

		if (parent && !entry) {
			for (const e of parent.subcommands) {
				if (subcommand) {
					if (e.name === subcommand?.toLowerCase()) {
						entry = e;
						break;
					}
				} else if (e.default) {
					entry = e;
				}
			}
		}

		if (!entry) {
			return;
		}

		if (subcommand) {
			args.entries.splice(0, parent ? 2 : 1);
		}

		return { entry, parent, command, args };
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
