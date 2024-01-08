import { Collection } from "discord.js";
import Command from "../commands/Command.js";
import config from "../config.js";
import ClientUtils from "../utils/ClientUtils.js";

declare module "discord.js" {
	export interface Client {
		commands: Collection<string, Command>;
		config: typeof config;
		utils: ClientUtils;
	}
}
