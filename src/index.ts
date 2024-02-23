import "dotenv/config.js";

import { Client, Collection, GatewayIntentBits, Options, Partials } from "discord.js";

import { loadCommands, loadComponents, loadEvents } from "./utils/loader.js";
import ClientUtils from "./utils/others/ClientUtils.js";

import "./utils/process.js";

import Database from "./database/Database.js";
import MySql from "./database/mysql/MySql.js";
import Redis from "./database/redis/Redis.js";

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
	partials: [
		Partials.Message,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember,
		Partials.GuildScheduledEvent,
	],
	allowedMentions: {
		repliedUser: false,
		parse: ["users", "roles"],
	},
	shards: "auto",
	makeCache: Options.cacheWithLimits({
		UserManager: {
			maxSize: 100,
			keepOverLimit: ({ id, client }) => id === client.user.id,
		},
		GuildMemberManager: {
			maxSize: 100,
			keepOverLimit: ({ id, client }) => id === client.user.id,
		},
		ReactionManager: 100,
	}),
	sweepers: {
		messages: {
			interval: 15 * 60,
			lifetime: 15 * 60,
		},
		users: {
			interval: 15 * 60,
			filter:
				() =>
				({ bot, id, client }) =>
					bot && id !== client.user.id,
		},
	},
});

client.process = process;

client.config = config;

client.commands = new Collection();
client.components = new Collection();

client.mysql = new MySql(client.config.mysql);
client.redis = new Redis(client.config.redis);
client.database = new Database(client.mysql, client.redis);

client.utils = new ClientUtils(client);

await client.mysql.init();
await client.redis.init();

await loadEvents(client);
await loadCommands(client);
await loadComponents(client);

await client.login(config.token);
