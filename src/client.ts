import { Client, Collection, GatewayIntentBits } from "discord.js";

import { loadCommands, loadComponents, loadEvents } from "./utils/loader.js";
import ClientUtils from "./utils/others/ClientUtils.js";

import "./utils/error.js";

import Managers from "./databases/Managers.js";
import MySql from "./databases/mysql/MySql.js";
import Redis from "./databases/redis/Redis.js";

import config from "./config.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildModeration,
	],
	allowedMentions: {
		repliedUser: false,
		parse: [],
	},
});

client.commands = new Collection();
client.components = {
	buttons: new Collection(),
	selectMenus: new Collection(),
	modals: new Collection(),
};
client.config = config;
client.utils = new ClientUtils(client);
client.mysql = new MySql(client.config.mysql);
client.redis = new Redis(client.config.redis);
client.managers = new Managers(client.mysql, client.redis);

await client.mysql.init();
await client.redis.init();

await loadEvents(client);
await loadCommands(client);
await loadComponents(client);

await client.login(process.env.BOT_TOKEN!);
