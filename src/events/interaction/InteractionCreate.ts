import { ChatInputCommandInteraction, EmbedBuilder, Events, Interaction } from "discord.js";

import Listener from "../Listener.js";

import { BasedHybridContext, HybridContext } from "../../commands/HybridContext.js";
import Command, { CommandArgs } from "../../commands/Command.js";
import Component, { ComponentArgs } from "../../components/Component.js";

class InteractionCreate extends Listener {
	public constructor() {
		super(Events.InteractionCreate);
	}

	public override async execute(interaction: Interaction<"cached">) {
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			await this.handleCommand(interaction);
		}

		if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			await this.handleComponent(interaction);
		}
	}

	public async handleCommand(
		interaction: Command.Autocomplete | Command.ChatInput | Command.ContextMenu,
	) {
		const { managers, config, utils } = this.client;
		const { guilds, users } = managers;

		const command = this.client.commands.find((command) =>
			command.applicationCommands.some((data) => data.name === interaction.commandName),
		);

		if (!command) {
			return;
		}

		if (interaction.isCommand()) {
			if (!interaction.guild) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${config.emojis.error} Error!`)
							.setDescription("You can only use my commands in the server.")
							.setColor(config.colors.error),
					],
					ephemeral: true,
				});

				return;
			}

			if (command.preconditions) {
				if (!(await utils.checkPreconditions(interaction, command.preconditions))) {
					return;
				}
			}

			const guild = (await guilds.get({ id: interaction.guild.id }))!;

			const args = new CommandArgs();

			args.language = guild.language;
			args.prefix = guild.prefix;

			if (!(await users.get({ id: interaction.user.id }))) {
				await users.set({ id: interaction.user.id }, {});
			}

			if (interaction.isChatInputCommand()) {
				command.executeChatInput?.(interaction);
				command.executeHybrid?.(new BasedHybridContext(interaction) as HybridContext, args);
				await this.handleSubcommand(interaction, command, args);
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

	public async handleComponent(
		interaction: Component.Button | Component.SelectMenu | Component.Modal,
	) {
		const { managers, config } = this.client;
		const { guilds, users } = managers;

		const splitted = interaction.customId.split(":");
		const [key, ...references] = splitted;

		const component = this.client.components.get(key);

		if (!component) {
			return;
		}

		const guild = (await guilds.get({ id: interaction.guild!.id }))!;

		const args = new ComponentArgs(...references);

		args.language = guild.language;

		if (!(await users.get({ id: interaction.user.id }))) {
			await users.set({ id: interaction.user.id }, {});
		}

		if (
			await this.client.users
				.fetch(args.entries[args.entries.length - 1])
				.then(() => true)
				.catch(() => false)
		) {
			const userId = args.entries[args.entries.length - 1];

			if (interaction.user.id !== userId) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${config.emojis.error} Unauthorized Interaction!`)
							.setDescription("You are not authorized to execute this interaction.")
							.setColor(config.colors.error),
					],
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
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.error} Insufficient Permissions!`)
						.setDescription("You lack the required permissions to execute this command.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		if (interaction.isButton()) {
			component.executeButton?.(interaction, args);
		}

		if (interaction.isAnySelectMenu()) {
			component.executeSelectMenu?.(interaction, args);
		}

		if (interaction.isStringSelectMenu()) {
			component.executeStringSelectMenu?.(interaction, args);
		}

		if (interaction.isChannelSelectMenu()) {
			component.executeChannelSelectMenu?.(interaction, args);
		}

		if (interaction.isMentionableSelectMenu()) {
			component.executeMentionableSelectMenu?.(interaction, args);
		}

		if (interaction.isModalSubmit()) {
			component.executeModal?.(interaction, args);
		}
	}

	private async handleSubcommand(
		interaction: ChatInputCommandInteraction,
		command: Command,
		args: CommandArgs,
	) {
		const { utils } = this.client;
		const subcommand = interaction.options.getSubcommand(false) || undefined;
		const subcommandGroup = interaction.options.getSubcommandGroup(false) || undefined;

		const parsed = utils.parseSubcommand(command, args, {
			subcommand,
			subcommandGroup,
		});

		if (!parsed) {
			return;
		}

		const { parent, entry } = parsed;

		if (parent.preconditions) {
			if (!(await utils.checkPreconditions(interaction, parent.preconditions))) {
				return;
			}
		}

		if (parent["subcommands"] && entry.preconditions) {
			if (!(await utils.checkPreconditions(interaction, entry.preconditions))) {
				return;
			}
		}

		if (entry.chatInput) {
			const func = command[entry.chatInput] as typeof command.executeChatInput;
			await func?.bind(command)(interaction);
		}

		if (entry.hybrid) {
			const func = command[entry.hybrid] as typeof command.executeHybrid;
			await func?.bind(command)(new BasedHybridContext(interaction) as HybridContext, args);
		}
	}
}

export default InteractionCreate;
