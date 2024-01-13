import Component from "../../Component.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { EmbedBuilder } from "discord.js";
import i18next from "i18next";

export default class extends Component {
	public constructor() {
		super("language", {
			memberPermissions: [PermissionFlagsBits.ManageGuild],
		});
	}

	public override async execute(interaction: Component.StringSelectMenu, args: Component.Args) {
		const [language] = interaction.values;
		const { guilds } = this.client.managers;

		await guilds.update(interaction.guildId!, { language });

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: interaction.guild!.name, iconURL: interaction.guild!.iconURL({ forceStatic: true })! })
					.setDescription(
						i18next.t(`interactions.${this.preCustomId}.messages.set_language`, {
							lng: language,
						}),
					)
					.setColor(this.client.config.colors.success),
			],
		});
	}
}
