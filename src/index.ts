import "dotenv/config.js";
import { ShardingManager } from "discord.js";

new ShardingManager("dist/client.js", {
	token: process.env.BOT_TOKEN,
}).spawn();
