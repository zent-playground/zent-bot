import "dotenv/config.js";
import { ShardingManager } from "discord.js";

import { createApp } from "./server/app.js";

import config from "./config.js";
import Logger from "./utils/Logger.js";

if (!process.env.PORT) {
	process.env.PORT = "3000";
}

const manager = new ShardingManager("dist/client.js", {
	token: config.token,
});

manager.on("shardCreate", (shard) => {
	Logger.info(`Created shard '${shard.id}'.`);
});

manager.spawn();

createApp();
