import { Client, Collection, GatewayIntentBits, Options, Partials } from "discord.js";

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
	partials: [
		Partials.Message,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember,
		Partials.GuildScheduledEvent,
	],
	allowedMentions: {
		repliedUser: false,
		parse: [],
	},
	makeCache: Options.cacheWithLimits({
		GuildMemberManager: {
			maxSize: 0,
			keepOverLimit: ({ id, client }) => id === client.user.id,
		},
		UserManager: {
			maxSize: 0,
			keepOverLimit: ({ id, client }) => id === client.user.id,
		},
	}),
	sweepers: {
		messages: {
			interval: 60,
			filter: () => (message) => {
				const { createdTimestamp, author } = message;
				return Date.now() - createdTimestamp >= 30 * 60_000 || author.bot;
			},
		},
	},
});

client.process = process;

client.config = config;

client.commands = new Collection();
client.components = new Collection();

client.mysql = new MySql(client.config.mysql);
client.redis = new Redis(client.config.redis);
client.managers = new Managers(client.mysql, client.redis);

client.utils = new ClientUtils(client);

await client.mysql.init();
await client.redis.init();

await loadEvents(client);
await loadCommands(client);
await loadComponents(client);

await client.login(process.env.BOT_TOKEN!);
