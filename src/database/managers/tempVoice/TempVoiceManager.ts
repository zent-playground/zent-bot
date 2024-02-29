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

import { getGuildMaxBitrate } from "../../../utils/others/ClientUtils.js";

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

	public async get(id: string) {
		return await super._get({ id });
	}

	public async delete(id: string) {
		return await super._del({ id });
	}

	public async set(id: string, values: Partial<TempVoice>) {
		return await super._set({ id }, values);
	}

	public async update(id: string, values: Partial<TempVoice>) {
		return await super._upd({ id }, values);
	}

	public async createPermissionOverwrites(
		config: TempVoiceConfig,
		guild: Guild,
	): Promise<OverwriteResolvable[]> {
		const { id, lock, hide, whitelisted_ids, blacklisted_ids } = config;

		const permissionOverwrites: OverwriteResolvable[] = [
			{
				id,
				allow: [
					PermissionFlagsBits.Connect,
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.ReadMessageHistory,
					PermissionFlagsBits.SendMessages,
				],
			},
		];

		if (hide) {
			permissionOverwrites.push({
				id: guild.id,
				deny: [PermissionFlagsBits.ViewChannel],
			});

			for (const id of whitelisted_ids || []) {
				const member = await guild.members.fetch(id).catch(() => 0);

				if (member) {
					permissionOverwrites.push({
						id,
						allow: [
							PermissionFlagsBits.ViewChannel,
							PermissionFlagsBits.Connect,
							PermissionFlagsBits.ReadMessageHistory,
							PermissionFlagsBits.SendMessages,
						],
					});
				}
			}
		} else if (lock) {
			permissionOverwrites.push({
				id: guild.id,
				deny: [
					PermissionFlagsBits.ReadMessageHistory,
					PermissionFlagsBits.Connect,
					PermissionFlagsBits.SendMessages,
				],
			});

			for (const id of whitelisted_ids || []) {
				const member = await guild.members.fetch(id).catch(() => 0);

				if (member) {
					permissionOverwrites.push({
						id,
						allow: [
							PermissionFlagsBits.ViewChannel,
							PermissionFlagsBits.Connect,
							PermissionFlagsBits.ReadMessageHistory,
							PermissionFlagsBits.SendMessages,
						],
					});
				}
			}
		} else {
			for (const id of blacklisted_ids || []) {
				const member = await guild.members.fetch(id).catch(() => 0);

				if (member) {
					permissionOverwrites.push({
						id,
						deny: [
							PermissionFlagsBits.Connect,
							PermissionFlagsBits.ManageChannels,
							PermissionFlagsBits.ReadMessageHistory,
							PermissionFlagsBits.ViewChannel,
						],
					});
				}
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
		const { premiumTier } = guild;
		const { displayName } = member;

		const options: GuildChannelCreateOptions = {
			name: affix ? `${affix} ` : "",
		};

		let config = await this.configs.get({ id: member.id, is_global: true });

		if (!config) {
			config = await this.configs.get({ id: member.id, guild_id: guild.id });
		}

		if (config) {
			const { name, user_limit, nsfw, bitrate } = config;

			if (allow_custom_name) {
				options.name += name || displayName;
			}

			if (user_limit) {
				options.userLimit = user_limit;
			}

			options.nsfw = nsfw;
			options.bitrate = (bitrate === -1 ? getGuildMaxBitrate(premiumTier) : bitrate) * 1000;
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
