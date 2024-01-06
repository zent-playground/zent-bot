import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

client.on("ready", (client) => {
	console.log(`Successfully logged as '${client.user.tag}'.`);
});

client.login(process.env.BOT_TOKEN!);
