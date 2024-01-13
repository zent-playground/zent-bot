import { Collection } from "discord.js";
import Command from "../commands/Command.js";
import { ClientComponents } from "./index.js";
import config from "../config.js";
import ClientUtils from "../utils/ClientUtils.js";
import Managers from "../databases/Managers.js";
import MySql from "../databases/mysql/MySql.js";
import Redis from "../databases/redis/Redis.js";

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
