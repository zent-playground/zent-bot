import { Events, VoiceState, EmbedBuilder, ChannelType } from "discord.js";

import Listener from "./Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		if (oldState.channelId !== newState.channelId) {
			this.handleCreation(newState);
			this.handleDeletion(oldState);
		}
	}

	private async handleCreation(newState: VoiceState) {
		const { channel, guild, member } = newState;

		if (!member || !channel) {
			return;
		}

		const { voices } = this.client.managers;
		const creator = await voices.creators.get({ id: channel.id });

		if (!creator) {
			return;
		}

		if (member.user.bot) {
			await member.voice.setChannel(null).catch(() => void 0);
			return;
		}

		const cooldown = await this.client.managers.voices.cooldowns.get([member.id]);

		if (cooldown) {
			await member.user
				.send({
					embeds: [
						new EmbedBuilder()
							.setAuthor({ name: guild.name, iconURL: guild.iconURL({ forceStatic: true })! })
							.setDescription(
								"You can only create a temporary voice channel every 10 seconds.",
							)
							.setTimestamp()
							.setColor(this.client.config.colors.error),
					],
				})
				.catch(() => void 0);

			await member.voice.setChannel(null).catch(() => void 0);

			return;
		}

		const options = await voices.createOptions(creator, member, guild);

		const temp = await guild.channels.create({
			...options,
			type: ChannelType.GuildVoice,
			parent: channel.parent,
		});

		await voices.set(
			{ id: temp.id },
			{ author_id: member.id, guild_id: guild.id, creator_id: channel.id },
		);

		await voices.cooldowns.set([member.id, guild.id], true, { EX: 10 });
		await member.voice.setChannel(temp).catch(() => void 0);
	}

	private async handleDeletion(oldState: VoiceState) {
		const { channel } = oldState;

		if (!channel) {
			return;
		}

		const { voices } = this.client.managers;
		const temp = await voices.get({ id: channel.id });

		if (temp && channel.members.size === 0) {
			await channel.delete().catch(() => void 0);
			await voices.upd({ id: channel.id }, { active: false }).catch(() => void 0);
		}
	}
}

export default VoiceStateUpdate;
