import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	PermissionFlagsBits,
	GuildChannelEditOptions,
} from "discord.js";

import Component from "../Component.js";

import { TempVoiceConfig, TempVoiceCreator } from "../../types/database.js";
import { capitalize } from "../../utils/format.js";

class TempVoice extends Component {
	public constructor() {
		super("voice", {
			memberPermissions: PermissionFlagsBits.ManageChannels,
		});
	}

	public override async executeButton(
		interaction: Component.Button,
		args: Component.Args,
	): Promise<void> {
		const { client } = interaction;
		const { config } = client;

		const [choice, id] = args.entries;

		const creator = await this.client.managers.voices.creators.get({
			id: id,
			guild_id: interaction.guild!.id,
		});

		if (!creator) {
			await interaction.message.edit({
				components: interaction.message.components.map((row) =>
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						row.components.map((component) =>
							ButtonBuilder.from(component as unknown as ButtonBuilder).setDisabled(true),
						),
					),
				),
			});

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.error} Setup Error!`)
						.setDescription("This setup action is unrecognized. Please check and try again.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		switch (choice) {
			case "generic":
				await interaction.showModal(
					new ModalBuilder()
						.setTitle("Configure Generic Voice Channel")
						.setCustomId(`voice:generic:${id}`)
						.addComponents([
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setLabel("Set a Generic Name")
									.setPlaceholder("E.g., Duo, Gaming, Chat, ...")
									.setStyle(TextInputStyle.Short)
									.setCustomId("name")
									.setMaxLength(24)
									.setRequired(false),
							),
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setLabel("User Limit (Optional)")
									.setPlaceholder("Enter a number (max 99)")
									.setStyle(TextInputStyle.Short)
									.setCustomId("limit")
									.setMaxLength(2)
									.setRequired(false),
							),
						]),
				);

				break;
			case "affix":
				await interaction.showModal(
					new ModalBuilder()
						.setTitle("Configure Voice Channel Affix")
						.setCustomId(`voice:affix:${id}`)
						.addComponents([
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setLabel("Enter Affix for Voice Channel")
									.setPlaceholder("E.g., Duo, Gaming, Chat, ...")
									.setStyle(TextInputStyle.Short)
									.setCustomId("name")
									.setMaxLength(16)
									.setRequired(false),
							),
						]),
				);

				break;
			case "custom": {
				await this.client.managers.voices.creators.upd(
					{ id: id, guild_id: interaction.guild!.id },
					{ allow_custom_name: !creator.allow_custom_name },
				);

				await interaction.message.edit({
					components: interaction.message.components.map((row) =>
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							row.components.map((component) => {
								if (component.customId?.includes("custom")) {
									return ButtonBuilder.from(component as unknown as ButtonBuilder).setLabel(
										creator.allow_custom_name ? "Allow Custom Name" : "Disallow Custom Name",
									);
								}

								return ButtonBuilder.from(component as unknown as ButtonBuilder);
							}),
						),
					),
				});

				const choice = creator.allow_custom_name ? "allowed" : "disallowed";

				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${config.emojis.success} Custom ${capitalize(choice)}!`)
							.setDescription(`Custom channel names are now ${choice}!`)
							.setColor(config.colors.success),
					],
					ephemeral: true,
				});

				break;
			}

			default:
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${config.emojis.error} Action Unrecognized!`)
							.setDescription(
								"This action is unrecognized. Please recheck your command or selection.",
							)
							.setColor(config.colors.error),
					],
					ephemeral: true,
				});

				break;
		}
	}

	public override async executeModal(
		interaction: Component.Modal,
		args: Component.Args,
	): Promise<void> {
		switch (args.entries[0]) {
			case "creator": {
				await this.handleModalCreator(interaction, args);
				break;
			}

			case "panel": {
				await this.handleModalPanel(interaction, args);
				break;
			}
		}
	}

	private async handleModalCreator(interaction: Component.Modal, args: Component.Args) {
		const { fields, client } = interaction;
		const { managers, config } = client;
		const { voices } = managers;

		const [choice, id] = args.entries.slice(1);
		const name = fields.getTextInputValue("name");
		const limit = Number(fields.getTextInputValue("limit"));
		const values: Partial<TempVoiceCreator> = {};

		switch (choice) {
			case "generic": {
				if (limit) {
					if (limit < 1 || limit > 99) {
						await interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle(`${config.emojis.error} Invalid Limit!`)
									.setDescription("The limit entered is not between 1 and 99!")
									.setColor(config.colors.error),
							],
							ephemeral: true,
						});
						return;
					}
					values.generic_limit = limit;
				} else if (isNaN(limit)) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${config.emojis.error} Invalid Limit!`)
								.setDescription("The limit entered is not a valid number!")
								.setColor(config.colors.error),
						],
						ephemeral: true,
					});
					return;
				} else {
					values.generic_limit = null;
				}
				values.generic_name = name || null;
				break;
			}
			case "affix": {
				values.affix = name || null;
				break;
			}
		}
		try {
			await voices.creators.upd({ id: id, guild_id: interaction.guild!.id }, values);
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.success} ${capitalize(choice)} Configured!`)
						.setDescription(
							`The ${choice} has been ${
								name || limit ? "configured" : "cancelled"
							} for this voice channel!`,
						)
						.setColor(config.colors.success),
				],
				ephemeral: true,
			});
		} catch {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.error} Cannot Update!`)
						.setDescription(
							"Unable to update the configuration of this channel, please try again.",
						)
						.setColor(config.colors.success),
				],
				ephemeral: true,
			});
		}
	}

	private async handleModalPanel(interaction: Component.Modal, args: Component.Args) {
		const { client, user, guild } = interaction;
		const {
			managers: { voices },
			config,
		} = client;

		const [type, choice] = args.entries.slice(1);

		const voice = await voices.get({ id: interaction.message!.channelId });
		const creator = await voices.creators.get({ id: voice?.creator_channel_id });

		if (!voice || !creator) {
			return;
		}

		const member = await guild.members.fetch(voice.author_id);

		let userConfig = await voices.configs.get({ id: member.id, is_global: true });

		if (!config) {
			userConfig = await voices.configs.get({ id: member.id, guild_id: guild.id });
		}

		const upd = async (values: Partial<TempVoiceConfig>) => {
			await voices.configs.upd(
				userConfig?.is_global
					? {
							id: member.id,
							is_global: true,
						}
					: {
							id: member.id,
							guild_id: guild.id,
						},
				values,
			);
		};

		if (type === "settings") {
			switch (choice) {
				case "name": {
					const value = interaction.fields.getTextInputValue("value");

					await upd({
						name: value,
					});

					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: user.tag,
									iconURL: user.displayAvatarURL(),
									url: `https://discord.com/users/${user.id}`,
								})
								.setDescription(
									`Successfully set your temp voice channel name to \`${value}\`.`,
								)
								.setColor(config.colors.success),
						],
					});

					break;
				}

				case "limit": {
					const value = Math.floor(Number(interaction.fields.getTextInputValue("value")));

					if (value) {
						if (value < 1 || value > 99) {
							await interaction.reply({
								embeds: [
									new EmbedBuilder()
										.setTitle(`${config.emojis.error} Invalid Limit!`)
										.setDescription("The limit entered is not between 1 and 99!")
										.setColor(config.colors.error),
								],
								ephemeral: true,
							});

							return;
						}

						await upd({ limit: value });
					} else if (isNaN(value)) {
						await interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle(`${config.emojis.error} Invalid Limit!`)
									.setDescription("The limit entered is not a valid number!")
									.setColor(config.colors.error),
							],
							ephemeral: true,
						});

						return;
					} else {
						await upd({ limit: null });
					}

					break;
				}
			}
		}

		if (type === "permissions") {
			//
		}

		await member.voice.channel
			?.edit((await voices.createOptions(creator, member, guild)) as GuildChannelEditOptions)
			.catch(() => 0);
	}

	public override async executeStringSelectMenu(
		interaction: Component.StringSelectMenu,
		args: Component.Args,
	) {
		switch (args.entries[0]) {
			case "panel": {
				await this.handleStringSelectMenuPanel(interaction, args);
				break;
			}
		}

		await interaction.message.edit({
			components: interaction.message.components,
		});
	}

	public async handleStringSelectMenuPanel(
		interaction: Component.StringSelectMenu,
		args: Component.Args,
	) {
		const { client, member, guild } = interaction;
		const {
			config,
			managers: { voices },
		} = client;
		const [choice] = interaction.values;

		const modal = new ModalBuilder()
			.setTitle("Voice Settings")
			.setCustomId(`voice:panel:${args.entries[1]}:${choice}`);

		const voice = await voices.get({ id: interaction.message!.channelId });

		if (voice?.author_id !== interaction.user.id) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription("You cannot use this interaction.")
						.setColor(config.colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		let userConfig = await voices.configs.get({ id: member.id, is_global: true });

		if (!config) {
			userConfig = await voices.configs.get({ id: member.id, guild_id: guild.id });
		}

		switch (choice) {
			default: {
				await interaction.reply({
					embeds: [
						new EmbedBuilder().setDescription("Unknown choice.").setColor(config.colors.error),
					],
					ephemeral: true,
				});

				break;
			}

			case "name": {
				const textInput = new TextInputBuilder()
					.setCustomId("value")
					.setLabel("Name")
					.setRequired(true)
					.setStyle(TextInputStyle.Short);

				if (userConfig?.name) {
					textInput.setValue(userConfig.name);
				}

				modal.setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(textInput));

				await interaction.showModal(modal);

				break;
			}

			case "limit": {
				modal.setComponents(
					new ActionRowBuilder<TextInputBuilder>().setComponents(
						new TextInputBuilder()
							.setCustomId("value")
							.setLabel("limit")
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					),
				);

				await interaction.showModal(modal);

				break;
			}

			case "game": {
				modal.setComponents(
					new ActionRowBuilder<TextInputBuilder>().setComponents(
						new TextInputBuilder()
							.setCustomId("value")
							.setLabel("limit")
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					),
				);

				await interaction.showModal(modal);

				break;
			}

			case "bitrate": {
				modal.setComponents(
					new ActionRowBuilder<TextInputBuilder>().setComponents(
						new TextInputBuilder()
							.setCustomId("value")
							.setLabel("limit")
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					),
				);

				await interaction.showModal(modal);

				break;
			}

			case "nsfw": {
				break;
			}

			case "claim": {
				break;
			}
		}
	}
}

export default TempVoice;
