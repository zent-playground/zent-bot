import { Events, VoiceState, EmbedBuilder } from "discord.js";
import Listener from "../Listener.js";

class VoiceStateUpdate extends Listener {
	public constructor() {
		super(Events.VoiceStateUpdate);
	}

	public async execute(oldState: VoiceState, newState: VoiceState) {
		if (oldState.channelId !== newState.channelId) {
			await Promise.all([this.handleCreation(newState), this.handleDeletion(oldState)]);
		}
	}

	private async handleCreation(newState: VoiceState) {
		const { channel, guild, member } = newState;
		if (!member || !channel) return;

		const creator = await this.client.managers.voices.creators.get({ id: channel.id });
		if (!creator) return;

		if (member.user.bot) {
			member.voice.setChannel(null).catch(() => void 0);
			return;
		}

		const cooldown = await this.client.managers.voices.cooldowns.get([member.id]);
		if (cooldown && Date.now() < cooldown) {
			await member.user
				.send({
					embeds: [
						new EmbedBuilder()
							.setDescription("You can only create a temp voice channel every 10 seconds.")
							.setColor(this.client.config.colors.error),
					],
				})
				.catch(() => void 0);

			return;
		}

		const createOptions = await this.client.managers.voices.createOptions(this.client, {
			userId: member.id,
			guildId: guild.id,
		});
		const temp = await guild.channels.create(
			Object.assign({ parent: channel.parent }, createOptions),
		);

		await this.client.managers.voices.set(
			{ id: temp.id },
			{
				author_id: member.id,
				guild_id: guild.id,
			},
		);
		await this.client.managers.voices.cooldowns.set([member.id], Date.now() + 10 * 1000, {
			EX: 10,
		});
		await member.voice.setChannel(temp);
	}

	private async handleDeletion(oldState: VoiceState) {
		const { channel } = oldState;
		if (!channel) return;

		const temp = await this.client.managers.voices.get({ id: channel.id });
		if (temp && channel.members.size === 0) {
			await channel.delete().catch(() => void 0);
			await this.client.managers.voices.del({ id: channel.id }).catch(() => void 0);
		}
	}
}

export default VoiceStateUpdate;
