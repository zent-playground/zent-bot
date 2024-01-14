import Component from "../../Component.js";
import { PermissionFlagsBits, TextInputStyle } from "discord-api-types/v10";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "discord.js";
import i18next from "i18next";

export default class extends Component {
	public constructor() {
		super("prefix", {
			memberPermissions: [PermissionFlagsBits.ManageGuild],
		});
	}

	public override async execute(interaction: Component.Button, args: Component.Args) {
		await interaction.showModal(
			new ModalBuilder()
				.setTitle(
					i18next.t(`commands.${this.preCustomId}.components.set_prefix`, {
						lng: args.language,
					}),
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel(
								i18next.t(`commands.${this.preCustomId}.components.label_prefix`, {
									lng: args.language,
								}),
							)
							.setMaxLength(5)
							.setStyle(TextInputStyle.Short)
							.setRequired(true)
							.setCustomId("prefix"),
					),
				)
				.setCustomId(this.preCustomId),
		);
	}
}
