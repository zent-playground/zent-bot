import { Collection } from "discord.js";

import config from "../config.js";

import Command from "../commands/Command.js";

import ClientUtils from "../utils/others/ClientUtils.js";

import Managers from "../databases/Managers.js";
import MySql from "../databases/mysql/MySql.js";
import Redis from "../databases/redis/Redis.js";

import { ClientComponents } from "./index.js";

declare module "discord.js" {
	export interface Client {
		commands: Collection<string, Command>;
		components: ClientComponents;
		config: typeof config;
		utils: ClientUtils;
		mysql: MySql;
		redis: Redis;
		managers: Managers;
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN?: string;
			MYSQL_HOST?: string;
			MYSQL_PORT?: string;
			MYSQL_USER?: string;
			MYSQL_DATABASE?: string;
			MYSQL_PASSWORD?: string;
			REDIS_HOST?: string;
			REDIS_PORT?: string;
			REDIS_USER?: string;
			REDIS_PASSWORD?: string;
			REDIS_PREFIX?: string;
			NODE_ENV?: string;
			PNPM_HOME?: string;
			PATH?: string;
		}
	}
}
