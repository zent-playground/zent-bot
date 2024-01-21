import {
	ChannelType,
	Events,
	VoiceState,
	PermissionFlagsBits,
	EmbedBuilder,
} from "discord.js";

import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		const { managers, config } = this.client;
		const { voices, users } = managers;

		const handleCreation = async () => {
			const { channel, guild, member } = newState;

			if (!member || !channel) {
				return;
			}

			const creator = await voices.creators.get(channel.id);
			const user = await users.get(member.id);

			if (creator) {
				const cooldown = await voices.cooldowns.get(member.id);

				if (cooldown !== null) {
					if (!cooldown) {
						await member.user.send({
							embeds: [
								new EmbedBuilder()
									.setDescription("You can only create a temp voice channel every 10 seconds.")
									.setColor(config.colors.error),
							],
						});

						await voices.cooldowns.edit(member.id, true).catch(() => 0);
					}

					await member.voice.setChannel(null);

					return;
				}

				const temp = await guild.channels.create({
					name: user?.voice_name || member.user.tag,
					type: ChannelType.GuildVoice,
					parent: channel.parent,
					permissionOverwrites: [
						{
							id: member.id,
							allow: [PermissionFlagsBits.ManageChannels],
						},
					],
				});

				await voices.set(temp.id, {
					name: temp.name,
					author_id: member.id,
					guild_id: guild.id,
				});

				await voices.cooldowns.set(member.id, false, { EX: 10 });
				await member.voice.setChannel(temp);
			}
		};

		const handleDeletion = async () => {
			const { channel } = oldState;

			if (!channel) {
				return;
			}

			const temp = await voices.get(channel.id);

			if (temp && channel.members.size === 0) {
				await channel.delete();
				await voices.delete(channel.id);
			}
		}

		if (oldState.channelId !== newState.channelId) {
			handleCreation();
			handleDeletion();
		}
	}
}

export default VoiceStateUpdate;
