import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
} from "discord.js";
import { TextInputStyle, PermissionFlagsBits } from "discord-api-types/v10";

import Component from "../../Component.js";

class TempVoice extends Component {
	public constructor() {
		super("voice", {
			memberPermissions: PermissionFlagsBits.ManageChannels,
		});
	}

	public override async execute(
		interaction: Component.Button,
		args: Component.Args,
	): Promise<void> {
		const [choice, id] = args.references!;

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
						.setTitle(`${this.client.config.emojis.error} Setup Error!`)
						.setDescription("This setup action is unrecognized. Please check and try again.")
						.setColor(this.client.config.colors.error),
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
						.setCustomId(`voice-generic-${id}`)
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
						.setCustomId(`voice-affix-${id}`)
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
			case "custom":
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

				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(
								`${this.client.config.emojis.success} Custom ${
									creator.allow_custom_name ? "Allowed" : "Disallowed"
								}!`,
							)
							.setDescription(
								`Custom channel names are now ${
									creator.allow_custom_name ? "allowed" : "disallowed"
								}!`,
							)
							.setColor(this.client.config.colors.success),
					],
					ephemeral: true,
				});

				break;
			default:
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${this.client.config.emojis.error} Action Unrecognized!`)
							.setDescription(
								"This action is unrecognized. Please recheck your command or selection.",
							)
							.setColor(this.client.config.colors.error),
					],
					ephemeral: true,
				});

				break;
		}
	}
}

export default TempVoice;
