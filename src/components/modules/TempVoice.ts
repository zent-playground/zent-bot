import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	PermissionFlagsBits,
} from "discord.js";

import Component from "../Component.js";

import { TempVoiceCreator } from "../../types/database.js";
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
		const { fields, client } = interaction;
		const { managers, config } = client;
		const { voices } = managers;

		const [choice, id] = args.entries;

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
}

export default TempVoice;
