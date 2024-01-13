import { ChatInputCommandInteraction, EmbedBuilder, Events, Interaction } from "discord.js";

import Listener from "../Listener.js";
import {
	BasedHybridContext,
	HybridContext,
} from "../../commands/HybridContext.js";

import Command from "../../commands/Command.js";
import Args from "../../commands/Args.js";
import Component from "../../components/Component";

class InteractionCreate extends Listener {
	public constructor() {
		super(Events.InteractionCreate);
	}

	public async execute(interaction: Interaction) {
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			const command = this.client.commands.find((command) =>
				command.applicationCommands.some(
					(data) => data.name === interaction.commandName,
				),
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

				const guild = (await this.client.managers.guilds.get(
					interaction.guild.id,
				))!;

				const args = new Args();

				args.language = guild.language;

				if (interaction.isChatInputCommand()) {
					command.executeChatInput?.(interaction);
					command.executeHybrid?.(
						new BasedHybridContext(interaction) as HybridContext,
						args,
					);
					this.handleSubcommand(interaction, command, args);
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

		if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const splitted = interaction.customId.split("-");
			const [preCustomId, ...args] = splitted;

			let component: Component | undefined;

			if (interaction.isAnySelectMenu()) {
				component = this.client.components.selectMenus.get(preCustomId);
			}

			if (interaction.isButton()) {
				component = this.client.components.buttons.get(preCustomId);
			}

			if (interaction.isModalSubmit()) {
				component = this.client.components.modals.get(preCustomId);
			}

			if (!component) return;

			const embed = new EmbedBuilder()
				.setDescription(
					"You are not authorized to use this interaction!"
				)
				.setColor(this.client.config.colors.error);

			if (
				await this.client.users
					.fetch(args[args.length - 1])
					.then(() => true)
					.catch(() => false)
			) {
				const userId = args[args.length - 1];

				if (interaction.user.id !== userId) {
					await interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});

					return;
				}
			}

			if (
				component.options?.memberPermissions &&
				!interaction.memberPermissions?.has(component.options.memberPermissions)
			) {
				await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
				return;
			}

			await component.execute?.(interaction, args);
		}
	}

	private async handleSubcommand(
		interaction: ChatInputCommandInteraction,
		command: Command,
		args: Args,
	) {
		const subcommand = interaction.options.getSubcommand(false) || undefined;
		const subcommandGroup =
			interaction.options.getSubcommandGroup(false) || undefined;

		const parsed = this.client.utils.parseSubcommand(command, args, {
			subcommand,
			subcommandGroup,
		});

		if (!parsed) {
			return;
		}

		const { entry } = parsed;

		if (entry.chatInput) {
			const func = command[
				entry.chatInput as keyof typeof command
			] as typeof command.executeChatInput;
			await func?.bind(command)(interaction);
		}

		if (entry.hybrid) {
			const func = command[
				entry.hybrid as keyof typeof command
			] as typeof command.executeHybrid;
			await func?.bind(command)(
				new BasedHybridContext(interaction) as HybridContext,
				args,
			);
		}
	}
}

export default InteractionCreate;
