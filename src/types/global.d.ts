import { Collection } from "discord.js";
import Command from "../commands/Command.js";

declare module "discord.js" {
	export interface Client {
		commands: Collection<string, Command>;
	}
}
