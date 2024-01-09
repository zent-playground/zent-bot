import { Collection } from "discord.js";
import Command from "../commands/Command.js";
import config from "../config.js";
import ClientUtils from "../utils/ClientUtils.js";
import Managers from "../database/Managers.js";
import MySql from "../database/mysql/MySql.js";
import Redis from "../database/redis/Redis.js";

declare module "discord.js" {
	export interface Client {
		commands: Collection<string, Command>;
		config: typeof config;
		utils: ClientUtils;
		mysql: MySql;
		redis: Redis;
		managers: Managers;
	}
}
