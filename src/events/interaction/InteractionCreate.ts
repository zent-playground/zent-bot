import { ChatInputCommandInteraction, Interaction } from "discord.js";

import Listener from "../Listener.js";
import { BasedHybridContext, HybridContext } from "../../commands/HybridContext.js";
import Command from "../../commands/Command.js";
import Args from "../../commands/Args.js";

class InteractionCreate extends Listener {
	public constructor() {
		super("interactionCreate");
	}

	public async execute(interaction: Interaction) {
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			const command = this.client.commands.find((command) =>
				command.applicationCommands.some((data) => data.name === interaction.commandName),
			);

			if (!command) return;

			if (interaction.isCommand()) {
				if (!interaction.guild) {
					await interaction.reply({
						content: "You can only use my commands in the server.",
						ephemeral: true,
					});

					return;
				}

				if (interaction.isChatInputCommand()) {
					command.executeChatInput?.(interaction);
					command.executeHybrid?.(new BasedHybridContext(interaction) as HybridContext, new Args());
					this.handleSubcommand(interaction, command);
				}

				if (interaction.isContextMenuCommand()) {
					command.executeContextMenu?.(interaction);
				}

				if (interaction.isUserContextMenuCommand()) {
					command.executeUserContextMenu?.(interaction);
				}

				if (interaction.isMessageContextMenuCommand()) {
					command.executeMessageContextMenu?.(interaction);
				}
			} else {
				command.executeAutocomplete?.(interaction);
			}
		}
	}

	public async handleSubcommand(interaction: ChatInputCommandInteraction, command: Command) {
		const subcommand = interaction.options.getSubcommand(false) || undefined;
		const subcommandGroup = interaction.options.getSubcommandGroup(false) || undefined;

		const parsed = this.client.utils.parseSubcommand(command, { subcommand, subcommandGroup });

		if (!parsed) {
			return;
		}

		const { entry, args } = parsed;

		if (entry.chatInput) {
			const func = command[entry.chatInput as keyof typeof command] as typeof command.executeChatInput;
			await func?.bind(command)(interaction);
		}

		if (entry.hybrid) {
			const func = command[entry.hybrid as keyof typeof command] as typeof command.executeHybrid;
			await func?.bind(command)(new BasedHybridContext(interaction) as HybridContext, args);
		}
	}
}

export default InteractionCreate;
