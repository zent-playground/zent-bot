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

export enum TempVoiceTargets {
	Everyone,
	WhitelistedUsers,
	Author,
}

class TempVoiceManager extends BaseManager<TempVoice> {
	public readonly cooldowns: RedisManager<boolean>;
	public readonly creators: TempVoiceCreatorManager;
	public readonly configs: TempVoiceConfigManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voices", mysql, redis);

		this.cooldowns = new RedisManager<boolean>(
			redis.client,
			`${redis.prefix}temp_voice_cooldowns`,
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

		const config: TempVoiceConfig = (await this.configs.get(userId)) || {
			id: userId,
			name: user.tag,
			target: 0,
			nsfw: false,
			blacklisted_ids: [],
			whitelisted_ids: [],
		};

		return {
			name: config.name!,
			nsfw: config.nsfw,
			type: ChannelType.GuildVoice,
			permissionOverwrites: await (async () => {
				const permissionOverwrites: OverwriteResolvable[] = [
					{
						id: user.id,
						allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
					},
				];

				switch (config.target) {
					case TempVoiceTargets.Everyone: {
						for (const id of config.blacklisted_ids) {
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

					case TempVoiceTargets.WhitelistedUsers: {
						permissionOverwrites.push({
							id: guild.id,
							deny: [PermissionFlagsBits.Connect],
						});

						for (const id of config.whitelisted_ids) {
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

					case TempVoiceTargets.Author: {
						permissionOverwrites.push({
							id: guild.id,
							deny: [PermissionFlagsBits.Connect],
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
