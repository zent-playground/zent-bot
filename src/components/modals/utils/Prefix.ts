import Component from "../../Component.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { EmbedBuilder } from "discord.js";
import i18next from "i18next";

export default class extends Component {
	public constructor() {
		super("prefix", {
			memberPermissions: [PermissionFlagsBits.ManageGuild],
		});
	}

	public override async execute(interaction: Component.Modal, args: Component.Args) {
		const prefix = interaction.fields.getTextInputValue("prefix");

		const { guilds } = this.client.managers;
		const { user } = interaction;

		await guilds.edit(interaction.guildId!, { prefix });

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: interaction.guild!.name,
						iconURL: interaction.guild!.iconURL({ forceStatic: true })!,
					})
					.setDescription(
						i18next.t(`commands.${this.preCustomId}.messages.set_prefix`, {
							prefix,
							lng: args.language,
						}),
					)
					.setFooter({ iconURL: user.displayAvatarURL(), text: user.tag })
					.setTimestamp()
					.setColor(this.client.config.colors.success),
			],
		});

		if (interaction.isFromMessage()) {
			await interaction.message
				.edit({
					components: [],
				})
				.catch(() => void 0);
		}
	}
}
