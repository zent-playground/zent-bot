import { EmbedBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Component from "../../Component.js";
import { TempVoiceCreator } from "../../../types/database.js";

class TempVoice extends Component {
	public constructor() {
		super("voice", {
			memberPermissions: PermissionFlagsBits.ManageChannels,
		});
	}

	public override async execute(
		interaction: Component.Modal,
		args: Component.Args,
	): Promise<void> {
		const [choice, id] = args.references!;

		const name = interaction.fields.fields.get("name")?.value;
		let limit: string | number | undefined = interaction.fields.fields.get("limit")?.value;
		const values: Partial<TempVoiceCreator> = {};

		if (choice === "generic") {
			if (limit) {
				if (isNaN(Number(limit))) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${this.client.config.emojis.error} Invalid Limit!`)
								.setDescription("The limit entered is not a valid number!")
								.setColor(this.client.config.colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				limit = Number(limit);

				if (limit < 1 || limit > 99) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${this.client.config.emojis.error} Invalid Limit!`)
								.setDescription("The limit entered is not between 1 and 99!")
								.setColor(this.client.config.colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				values.generic_limit = limit;
			} else {
				values.generic_limit = null;
			}

			if (name) {
				values.generic_name = name;
			} else {
				values.generic_name = null;
			}
		}

		if (choice === "affix") {
			if (name) {
				values.affix = name;
			} else {
				values.affix = null;
			}
		}

		await this.client.managers.voices.creators
			.upd({ id: id, guild_id: interaction.guild!.id }, values)
			.then(async () => {
				await interaction
					.reply({
						embeds: [
							new EmbedBuilder()
								.setTitle(
									`${this.client.config.emojis.success} ${
										choice.charAt(0).toUpperCase() + choice.slice(1)
									} Configured!`,
								)
								.setDescription(
									`The ${choice} has been ${
										name || limit ? "configured" : "cancelled"
									} for this voice channel!`,
								)
								.setColor(this.client.config.colors.success),
						],
						ephemeral: true,
					})
					.catch(async () => {
						await interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle(`${this.client.config.emojis.error} Cannot Update!`)
									.setDescription(
										"Unable to update the configuration of this channel, please try again.",
									)
									.setColor(this.client.config.colors.success),
							],
							ephemeral: true,
						});
					});
			});
	}
}

export default TempVoice;
