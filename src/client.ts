import { Client, Collection, GatewayIntentBits } from "discord.js";

import { loadCommands, loadEvents } from "./utils/loader.js";
import config from "./config.js";
import ClientUtils from "./utils/ClientUtils.js";

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

loadEvents(client);
loadCommands(client);

client.login(process.env.BOT_TOKEN!);
