import { ChatInputCommandInteraction, EmbedBuilder, Events, Interaction } from "discord.js";

import Listener from "../Listener.js";

import { BasedHybridContext, HybridContext } from "../../commands/HybridContext.js";
import Command from "../../commands/Command";
import CommandArgs from "../../commands/Args.js";

import Component from "../../components/Component.js";
import ComponentArgs from "../../components/Args.js";

class InteractionCreate extends Listener {
	public constructor() {
		super(Events.InteractionCreate);
	}

	public async execute(interaction: Interaction) {
		const { managers } = this.client;
		const { guilds, users } = managers;

		if (interaction.isCommand() || interaction.isAutocomplete()) {
			const command = this.client.commands.find((command) =>
				command.applicationCommands.some((data) => data.name === interaction.commandName),
			);

			if (!command) return;

			if (interaction.isCommand()) {
				if (!interaction.guild) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription("You can only use my commands in the server.")
								.setColor(this.client.config.colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				const guild = (await guilds.get(interaction.guild.id))!;

				const args = new CommandArgs();

				args.language = guild.language;
				args.prefix = guild.prefix;

				if (!(await users.get(interaction.user.id))) {
					await users.set(interaction.user.id, {}, { overwrite: true });
				}

				if (interaction.isChatInputCommand()) {
					command.executeChatInput?.(interaction);
					command.executeHybrid?.(new BasedHybridContext(interaction) as HybridContext, args);
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
			const [preCustomId, ...references] = splitted;

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

			const guild = (await this.client.managers.guilds.get(interaction.guild!.id))!;

			const args = new ComponentArgs();

			args.references = references;
			args.language = guild.language;

			const embed = new EmbedBuilder()
				.setDescription("You don't have permissions to use this interaction.")
				.setColor(this.client.config.colors.error);

			if (
				await this.client.users
					.fetch(args[args.references.length - 1])
					.then(() => true)
					.catch(() => false)
			) {
				const userId = args[args.references.length - 1];

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
		args: CommandArgs,
	) {
		const subcommand = interaction.options.getSubcommand(false) || undefined;
		const subcommandGroup = interaction.options.getSubcommandGroup(false) || undefined;

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
			await func?.bind(command)(new BasedHybridContext(interaction) as HybridContext, args);
		}
	}
}

export default InteractionCreate;
