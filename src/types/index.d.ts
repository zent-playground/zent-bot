import { Collection } from "discord.js";

export type ClientComponents = {
	buttons: Collection<string, Component>;
	selectMenus: Collection<string, Component>;
	modals: Collection<string, Component>;
};
