import { Client, Collection, GatewayIntentBits } from "discord.js";

import { loadCommands, loadEvents } from "./utils/loader.js";
import config from "./config.js";
import ClientUtils from "./utils/ClientUtils.js";
import Logger from "./utils/Logger.js";
import "./utils/i18next.js";

import Managers from "./database/Managers.js";
import MySql from "./database/mysql/MySql.js";
import Redis from "./database/redis/Redis.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	allowedMentions: {
		repliedUser: false,
		parse: [],
	},
});

client.commands = new Collection();
client.config = config;
client.utils = new ClientUtils(client);
client.mysql = new MySql(client.config.mysql);
client.redis = new Redis(client.config.redis);
client.managers = new Managers(client.mysql, client.redis);

client.mysql
	.connect()
	.then(() => Logger.Info("Mysql connected."))
	.catch((err) => {
		Logger.Error("Unable to connect to MySql:\t", err);
		process.exit(1);
	});

client.redis
	.connect()
	.then(() => client.redis.client.flushAll())
	.catch((err) => {
		Logger.Error("Unable to connect to Redis:\t");
		console.error(err);
		process.exit(1);
	});

process.on("uncaughtException", console.error);

loadEvents(client);
loadCommands(client);

client.login(process.env.BOT_TOKEN!);
