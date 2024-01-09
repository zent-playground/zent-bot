import { Client, Collection, GatewayIntentBits } from "discord.js";

import { loadCommands, loadEvents } from "./utils/loader.js";
import config from "./config.js";
import ClientUtils from "./utils/ClientUtils.js";
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

client.mysql.connect().catch(err => { throw new Error(err); } );
client.redis.connect().catch(err => { throw new Error(err); } );

loadEvents(client);
loadCommands(client);

client.login(process.env.BOT_TOKEN!);
