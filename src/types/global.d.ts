import { Collection } from "discord.js";

import config from "../config.js";

import ClientUtils from "../utils/others/ClientUtils.js";

import Managers from "../databases/Managers.js";
import MySql from "../databases/mysql/MySql.js";
import Redis from "../databases/redis/Redis.js";

declare module "discord.js" {
	export interface Client {
		config: typeof config;
		process: NodeJS.Process;
		commands: Collection<string, import("../commands/Command.js").default>;
		components: Collection<string, import("../components/Component.js").default>;
		managers: Managers;
		mysql: MySql;
		redis: Redis;
		utils: ClientUtils;
	}
}
