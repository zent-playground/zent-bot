import Component from "../../Component.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import i18next from "i18next";

export default class extends Component {
	public constructor() {
		super("language", {
			memberPermissions: [PermissionFlagsBits.ManageGuild],
		});
	}

	public override async execute(interaction: Component.Button, args: Component.Args) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: interaction.guild!.name, iconURL: interaction.guild!.iconURL({ forceStatic: true })! })
					.setDescription(i18next.t(`interactions.${this.preCustomId}.messages.edit_language`, { lng: args.language }))
					.setColor(this.client.config.colors.default)
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder(i18next.t(`interactions.${this.preCustomId}.components.set_language`, { lng: args.language }))
						.setOptions([
							{
								label: "English",
								value: "en-US",
								emoji: "🇺🇸"
							},
							{
								label: "Français",
								value: "fr",
								emoji: "🇫🇷"
							},
							{
								label: "Tiếng Việt",
								value: "vi",
								emoji: "🇻🇳"
							}
						])
						.setCustomId(this.preCustomId)
				)
			],
			ephemeral: true
		});
	}
}
