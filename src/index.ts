import "dotenv/config.js";
import { ShardingManager } from "discord.js";

import config from "./config.js";
import Logger from "./utils/others/Logger.js";

if (!process.env.PORT) {
	process.env.PORT = "3000";
}

const manager = new ShardingManager("dist/client.js", {
	token: config.token,
});

manager.on("shardCreate", (shard) => {
	Logger.info(`Created shard '${shard.id}'.`);
});

await manager.spawn({
	timeout: 60_000,
	delay: 5_000,
});
