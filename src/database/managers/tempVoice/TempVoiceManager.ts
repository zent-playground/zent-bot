import {
	Guild,
	GuildChannelCreateOptions,
	GuildMemberResolvable,
	OverwriteResolvable,
	PermissionFlagsBits,
} from "discord.js";

import BaseManager from "../../BaseManager.js";
import RedisManager from "../../redis/RedisManager.js";

import { TempVoice, TempVoiceConfig, TempVoiceCreator } from "../../../types/database.js";
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
	public readonly cooldowns: RedisManager<boolean>;
	public readonly creators: TempVoiceCreatorManager;
	public readonly configs: TempVoiceConfigManager;

	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("temp_voices", mysql);

		this.cooldowns = new RedisManager<boolean>(
			redis.client,
			`${redis.prefix}:temp_voice_cooldowns`,
		);

		this.creators = new TempVoiceCreatorManager(mysql, redis);
		this.configs = new TempVoiceConfigManager(mysql, redis);
	}

	public async createPermissionOverwrites(
		config: TempVoiceConfig,
		guild: Guild,
	): Promise<OverwriteResolvable[]> {
		const { id, joinable, whitelisted_ids, blacklisted_ids } = config;

		const permissionOverwrites: OverwriteResolvable[] = [
			{
				id,
				allow: [PermissionFlagsBits.Connect],
			},
		];

		switch (joinable) {
			case TempVoiceJoinable.Everyone: {
				for (const id of blacklisted_ids || []) {
					const member = await guild.members.fetch(id).catch(() => 0);

					if (!member) {
						continue;
					}

					permissionOverwrites.push({
						id,
						deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
					});
				}

				break;
			}

			case TempVoiceJoinable.WhitelistedUsers: {
				permissionOverwrites.push({
					id: guild.id,
					deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
				});

				for (const id of whitelisted_ids || []) {
					const member = await guild.members.fetch(id).catch(() => 0);

					if (!member) {
						continue;
					}

					permissionOverwrites.push({
						id,
						allow: [PermissionFlagsBits.Connect],
					});
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
	}

	public async createOptions(
		creator: TempVoiceCreator,
		member: GuildMemberResolvable,
		guild: Guild,
	): Promise<GuildChannelCreateOptions> {
		member = await guild.members.fetch(member);

		const { affix, generic_name, generic_limit, allow_custom_name } = creator;
		const { displayName } = member;

		const options: GuildChannelCreateOptions = {
			name: affix ? `${affix} ` : "",
		};

		let config = await this.configs.get({ id: member.id, is_global: true });

		if (!config) {
			config = await this.configs.get({ id: member.id, guild_id: guild.id });
		}

		if (config) {
			if (allow_custom_name) {
				options.name += config.name || displayName;
			}

			if (config.user_limit) {
				options.userLimit = config.user_limit;
			}

			options.nsfw = config.nsfw;
			options.bitrate = config.bitrate * 1000;
			options.permissionOverwrites = await this.createPermissionOverwrites(config, guild);
		}

		if (generic_name) {
			options.name = generic_name;
		} else if (!options.name || options.name === `${affix} `) {
			options.name += displayName;
		}

		if (generic_limit) {
			options.userLimit = generic_limit;
		}

		return options;
	}
}

export default TempVoiceManager;
