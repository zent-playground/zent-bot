import {
	ChannelType,
	Client,
	GuildChannelCreateOptions,
	OverwriteResolvable,
	PermissionFlagsBits,
} from "discord.js";

import BaseManager from "../../BaseManager.js";
import RedisManager from "../../redis/RedisManager.js";

import { TempVoice, TempVoiceConfig } from "../../../types/database.js";
import TempVoiceCreatorManager from "./TempVoiceCreatorManager.js";
import TempVoiceConfigManager from "./TempVoiceConfigManager.js";

export enum TempVoiceJoinable {
	/**
	 * Everyone can join the channel, excluding blacklisted users.
	 */
	Everyone,
	/**
	 * Only whitelisted users (provided by the owner) can join the channel.
	 */
	WhitelistedUsers,
	/**
	 * Only channel owner can join the channel.
	 */
	Owner,
}

class TempVoiceManager extends BaseManager<TempVoice> {
	public readonly cooldowns: RedisManager<number>;
	public readonly creators: TempVoiceCreatorManager;
	public readonly configs: TempVoiceConfigManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voices", mysql, redis);

		this.cooldowns = new RedisManager<number>(
			redis.client,
			`${redis.prefix}:temp_voice_cooldowns`,
		);

		this.creators = new TempVoiceCreatorManager(mysql, redis);
		this.configs = new TempVoiceConfigManager(mysql, redis);
	}

	public async createOptions(
		client: Client<true>,
		options: {
			userId: string;
			guildId: string;
		},
	): Promise<(GuildChannelCreateOptions & { type: ChannelType.GuildVoice }) | undefined> {
		const { users, guilds } = client;
		const { userId, guildId } = options;

		const user = users.cache.get(userId) || (await users.fetch(userId).catch(() => null));
		const guild = guilds.cache.get(guildId) || (await guilds.fetch(guildId).catch(() => null));

		if (!user || !guild) {
			return;
		}

		const config: TempVoiceConfig | null = await this.configs.get({ id: userId });

		return {
			name: config?.name || user.tag,
			nsfw: config?.nsfw || false,
			type: ChannelType.GuildVoice,
			permissionOverwrites: await (async () => {
				const permissionOverwrites: OverwriteResolvable[] = [
					{
						id: user.id,
						allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
					},
				];
				switch (config?.joinable) {
					case TempVoiceJoinable.Everyone: {
						for (const id of config.blacklisted_ids || []) {
							const member =
								guild.members.cache.get(id) || (await guild.members.fetch(id).catch(() => 0));

							if (!member) {
								continue;
							}

							const overwrite: OverwriteResolvable = {
								id,
								deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
							};

							permissionOverwrites.push(overwrite);
						}

						break;
					}

					case TempVoiceJoinable.WhitelistedUsers: {
						permissionOverwrites.push({
							id: guild.id,
							deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
						});

						for (const id of config.whitelisted_ids || []) {
							const member =
								guild.members.cache.get(id) || (await guild.members.fetch(id).catch(() => 0));

							if (!member) {
								continue;
							}

							const overwrite: OverwriteResolvable = {
								id,
								allow: [PermissionFlagsBits.Connect],
							};

							permissionOverwrites.push(overwrite);
						}

						break;
					}

					case TempVoiceJoinable.Owner: {
						permissionOverwrites.push({
							id: guild.id,
							deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
						});

						break;
					}
				}

				return permissionOverwrites;
			})(),
		};
	}
}

export default TempVoiceManager;
