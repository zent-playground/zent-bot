import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	GuildChannelEditOptions,
	PermissionFlagsBits,
} from "discord.js";

import Component from "../Component.js";

import { TempVoiceCreator } from "../../types/database.js";
import { capitalize } from "../../utils/format.js";

class TempVoice extends Component {
	public constructor() {
		super("voice");
	}

	public override async executeButton(
		interaction: Component.Button,
		args: Component.Args,
	): Promise<void> {
		switch (args.entries[0]) {
			case "creator": {
				await this.handleButtonCreator(interaction, args);
				break;
			}
		}
	}

	public async handleButtonCreator(interaction: Component.Button, args: Component.Args) {
		const { client } = interaction;
		const {
			config: { emojis, colors },
			database: { voices },
		} = client;

		const [choice, id] = args.entries.slice(1);

		const creator = await voices.creators.get(id);

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
						.setTitle(`${emojis.error} Setup Error!`)
						.setDescription("This setup action is unrecognized. Please check and try again.")
						.setColor(colors.error),
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
						.setCustomId(`voice:creator:generic:${id}`)
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
									.setLabel("User Limit")
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
						.setCustomId(`voice:creator:affix:${id}`)
						.addComponents([
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setLabel("Enter Affix for Voice Channel")
									.setPlaceholder("E.g., Duo, Gaming, Chat, ...")
									.setStyle(TextInputStyle.Short)
									.setCustomId("affix")
									.setMaxLength(16)
									.setRequired(false),
							),
						]),
				);

				break;
			case "custom": {
				await this.client.database.voices.creators.update(id, {
					allow_custom_name: !creator.allow_custom_name,
				});

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
							.setTitle(`${emojis.success} Custom ${capitalize(choice)}!`)
							.setDescription(`Custom channel names are now ${choice}!`)
							.setColor(colors.success),
					],
					ephemeral: true,
				});

				break;
			}

			default: {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${emojis.error} Action Unrecognized!`)
							.setDescription(
								"This action is unrecognized. Please recheck your command or selection.",
							)
							.setColor(colors.error),
					],
					ephemeral: true,
				});

				break;
			}
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
		const {
			database: { voices },
			config,
		} = client;

		const [choice, id] = args.entries.slice(1);

		const values: Partial<TempVoiceCreator> = {};

		switch (choice) {
			case "generic": {
				const name = fields.getTextInputValue("name").trim() || null;
				let limit: number | string | null = fields.getTextInputValue("limit");

				limit = limit ? Number(limit) : null;

				if (limit !== null) {
					if (isNaN(limit)) {
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
					}

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

					limit = Math.floor(limit);
				}

				values.generic_limit = limit;
				values.generic_name = name;

				break;
			}

			case "affix": {
				const affix = fields.getTextInputValue("affix").trim() || null;
				values.affix = affix;
				break;
			}
		}

		try {
			await voices.creators.update(id, values);

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${config.emojis.success} ${capitalize(choice)} Configured!`)
						.setDescription(
							`The ${choice} has been ${
								values.generic_name || values.generic_limit ? "configured" : "cancelled"
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
						.setDescription("Unable to update the configuration of this channel, please try again.")
						.setColor(config.colors.success),
				],
				ephemeral: true,
			});
		}
	}

	private async handleModalPanel(interaction: Component.Modal, args: Component.Args) {
		const { client, user, guild } = interaction;
		const {
			database: { voices },
			config: { colors, emojis },
		} = client;

		const [type, choice] = args.entries.slice(1);

		const voice = await voices.get(`${interaction.message?.channelId}`);
		const creator = await voices.creators.get(`${voice?.creator_channel_id}`);

		const successEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.member.displayName,
				iconURL: interaction.member.displayAvatarURL({ forceStatic: true }),
				url: `https://discord.com/users/${user.id}`,
			})
			.setColor(colors.success);

		const errorEmbed = new EmbedBuilder().setColor(colors.error);

		if (!voice || !creator) {
			await interaction.reply({
				embeds: [
					errorEmbed.setDescription(
						"Couldn't fetch your data! Please create another temp voice channel and try again.",
					),
				],
				ephemeral: true,
			});

			return;
		}

		const configOptions = {
			id: voice.author_id,
			guildId: guild.id,
		};

		const config = await voices.configs.create(configOptions);

		if (!config) {
			await interaction.reply({
				embeds: [errorEmbed.setDescription("An error occurred while generating config data.")],
				ephemeral: true,
			});

			return;
		}

		if (type === "settings") {
			const value = interaction.fields.getTextInputValue("value");

			switch (choice) {
				case "name": {
					await voices.configs.edit(configOptions, {
						name: value || null,
					});

					await interaction.reply({
						embeds: [
							successEmbed.setDescription(
								value
									? `Successfully set your temp voice channel name to \`${value}\`.`
									: "Successfully removed your temp voice channel name.",
							),
						],
					});

					break;
				}

				case "limit": {
					let limit: number | null = value ? Number(value) : null;

					if (limit !== null) {
						if (isNaN(limit)) {
							await interaction.reply({
								embeds: [
									errorEmbed
										.setTitle(`${emojis.error} Invalid Limit!`)
										.setDescription("The limit entered is not a valid number!"),
								],
								ephemeral: true,
							});

							return;
						}

						if (limit < 1 || limit > 99) {
							await interaction.reply({
								embeds: [
									errorEmbed
										.setTitle(`${emojis.error} Invalid Limit!`)
										.setDescription("The limit entered is not between 1 and 99!"),
								],
								ephemeral: true,
							});

							return;
						}

						limit = Math.floor(limit);
					}

					await voices.configs.edit(configOptions, {
						user_limit: limit,
					});

					await interaction.reply({
						embeds: [
							successEmbed.setDescription(
								limit
									? `Successfully set your temp voice channel user limit to \`${limit}\`.`
									: "Successfully removed your temp voice channel user limit.",
							),
						],
					});

					break;
				}

				case "bitrate": {
					let bitrate: number = 64;

					if (value.toLowerCase() === "max") {
						bitrate = -1;
					} else if (value) {
						bitrate = Number(value);

						if (isNaN(bitrate)) {
							await interaction.reply({
								embeds: [errorEmbed.setDescription(`\`${value}\` is not a valid number.`)],
								ephemeral: true,
							});

							return;
						}

						if (bitrate < 8 || bitrate > 128) {
							await interaction.reply({
								embeds: [errorEmbed.setDescription("Bitrate must be between 8 and 128.")],
								ephemeral: true,
							});

							return;
						}

						bitrate = Math.floor(bitrate);
					}

					await voices.configs.edit(configOptions, { bitrate });

					await interaction.reply({
						embeds: [
							successEmbed.setDescription(
								`Successfully set your temp voice bitrate to \`${bitrate}\`.`,
							),
						],
					});

					break;
				}
			}
		}

		if (type === "permissions") {
			switch (choice) {
				default: {
					break;
				}
			}
		}

		await interaction.member.voice.channel
			?.edit(
				(await voices.createOptions(creator, voice.author_id, guild)) as GuildChannelEditOptions,
			)
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
		const { client, guild, member, message } = interaction;
		const {
			config: { colors },
			database: { voices },
		} = client;
		const [choice] = interaction.values;

		const modal = new ModalBuilder()
			.setTitle("Voice Settings")
			.setCustomId(`voice:panel:${args.entries[1]}:${choice}`);

		const voice = (await voices.get(message.channelId))!;

		if (
			(choice !== "claim" && voice?.author_id !== interaction.user.id) ||
			!message.channel.isVoiceBased()
		) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription("You cannot use this interaction.")
						.setColor(colors.error),
				],
				ephemeral: true,
			});

			return;
		}

		const configOptions = {
			id: voice.author_id,
			guildId: guild.id,
		};

		let config = await voices.configs.create(configOptions);

		if (!config) {
			return;
		}

		const successEmbed = new EmbedBuilder()
			.setAuthor({
				name: member.displayName,
				iconURL: member.displayAvatarURL({ forceStatic: true }),
				url: `https://discord.com/users/${member.id}`,
			})
			.setColor(colors.success);

		switch (choice) {
			default: {
				await interaction.reply({
					embeds: [new EmbedBuilder().setDescription("Unknown choice.").setColor(colors.error)],
					ephemeral: true,
				});

				break;
			}

			case "name": {
				const textInput = new TextInputBuilder()
					.setCustomId("value")
					.setLabel("Name")
					.setRequired(false)
					.setStyle(TextInputStyle.Short);

				if (config.name) {
					textInput.setValue(config.name);
				}

				modal.setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(textInput));

				await interaction.showModal(modal);

				break;
			}

			case "limit": {
				const textInput = new TextInputBuilder()
					.setCustomId("value")
					.setLabel("limit")
					.setRequired(false)
					.setStyle(TextInputStyle.Short);

				if (config.user_limit) {
					textInput.setValue(`${config.user_limit}`);
				}

				modal.setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(textInput));

				await interaction.showModal(modal);

				break;
			}

			case "bitrate": {
				const textInput = new TextInputBuilder()
					.setCustomId("value")
					.setLabel("Bitrate")
					.setRequired(false)
					.setPlaceholder("Default: 64")
					.setStyle(TextInputStyle.Short);

				if (config.bitrate) {
					textInput.setValue(`${config.bitrate}`);
				}

				modal.setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(textInput));

				await interaction.showModal(modal);

				break;
			}

			case "nsfw": {
				const value = !config.nsfw;

				await voices.configs.edit(
					{
						id: voice.author_id,
						guildId: guild.id,
					},
					{
						nsfw: value,
					},
				);

				const embed = successEmbed.setDescription(
					`Successfully **${value ? "enabled" : "disabled"}** nsfw for your temp voice channel.`,
				);

				await interaction.reply({
					embeds: [embed],
				});

				await member.voice.channel?.edit(
					(await voices.createOptions(
						(await voices.creators.get(voice.creator_channel_id))!,
						voice.author_id,
						guild,
					)) as GuildChannelEditOptions,
				);

				break;
			}

			case "claim": {
				if (voice.author_id === member.id) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription("You are already the owner of this temp voice channel.")
								.setColor(colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				if (message.channel.members.has(voice.author_id)) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription(
									"You cannot claim this voice channel while the temp voice owner is still in the channel.",
								)
								.setColor(colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				if (!message.channel.members.has(interaction.user.id)) {
					await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription("You must join this temp voice channel to claim it.")
								.setColor(colors.error),
						],
						ephemeral: true,
					});

					return;
				}

				await voices.update(voice.id, {
					author_id: member.id,
				});

				await interaction.reply({
					embeds: [successEmbed.setDescription("Successfully claimed this temp voice channel!")],
				});

				await member.voice.channel?.edit(
					(await voices.createOptions(
						(await voices.creators.get(voice.creator_channel_id))!,
						member.id,
						guild,
					)) as GuildChannelEditOptions,
				);

				break;
			}

			case "lock": {
				config = await voices.configs.edit(configOptions, {
					lock: true,
				});

				await message.channel.edit({
					permissionOverwrites: await voices.createPermissionOverwrites(config, guild),
				});

				await message.channel.edit({
					permissionOverwrites: [
						{
							id: guild.id,
							deny: PermissionFlagsBits.ViewChannel,
						},
						...(await voices.createPermissionOverwrites(config, guild)),
					],
				});

				await interaction.reply({
					embeds: [successEmbed.setDescription("Successfully locked your temp voice channel!")],
				});

				break;
			}

			case "unlock": {
				config = await voices.configs.edit(configOptions, {
					lock: false,
				});

				await message.channel.edit({
					permissionOverwrites: await voices.createPermissionOverwrites(config, guild),
				});

				await interaction.reply({
					embeds: [successEmbed.setDescription("Successfully unlocked your temp voice channel!")],
				});

				break;
			}

			case "hide": {
				config = await voices.configs.edit(configOptions, {
					hide: true,
				});

				await message.channel.edit({
					permissionOverwrites: await voices.createPermissionOverwrites(config, guild),
				});

				await interaction.reply({
					embeds: [successEmbed.setDescription("Successfully hide your temp voice channel!")],
				});

				break;
			}

			case "show": {
				config = await voices.configs.edit(configOptions, {
					hide: false,
				});

				await message.channel.edit({
					permissionOverwrites: await voices.createPermissionOverwrites(config, guild),
				});

				await interaction.reply({
					embeds: [successEmbed.setDescription("Successfully show your temp voice channel!")],
				});

				break;
			}
		}
	}
}

export default TempVoice;
