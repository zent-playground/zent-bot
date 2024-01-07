import { Interaction } from "discord.js";

import Listener from "./Listener.js";
import { BasedHybridContext, HybridContext } from "../commands/HybridContext.js";

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
					command.executeHybrid?.(new BasedHybridContext(interaction) as HybridContext, []);
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
}

export default InteractionCreate;
