import { Client, Collection, GatewayIntentBits } from "discord.js";
import { loadCommands, loadEvents } from "./utils/loader.js";

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

loadEvents(client);
loadCommands(client);

client.login(process.env.BOT_TOKEN!);
