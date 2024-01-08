import "dotenv/config.js";
import { ShardingManager } from "discord.js";
import config from "./config.js";

new ShardingManager("dist/client.js", {
	token: config.token,
}).spawn();
