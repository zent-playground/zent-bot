import { Client } from "discord.js";

import { glob } from "glob";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

import Listener from "../events/Listener.js";
import Command from "../commands/Command.js";

const _dirname = dirname(fileURLToPath(import.meta.url));

export const loadEvents = async (client: Client) => {
	const path = join(_dirname, "..", "events").replace(/\\/g, "/");

	const files = await glob(`${path}/*/**/*.js`);

	for (const file of files) {
		const listener = new (await import(`${pathToFileURL(file)}`)).default() as Listener;
		listener.client = client as Client<true>;
		client[listener.once ? "once" : "on"](listener.name, listener.execute!.bind(listener));
	}
};

export const loadCommands = async (client: Client) => {
	const path = join(_dirname, "..", "commands").replace(/\\/g, "/");

	const files = await glob(`${path}/*/**/*.js`);

	for (const file of files) {
		const command = new (await import(`${pathToFileURL(file)}`)).default() as Command;
		command.client = client as Client<true>;
		await command.initialize?.();
		client.commands.set(command.name, command);
	}
};
