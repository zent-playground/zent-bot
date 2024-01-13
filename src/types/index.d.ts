import { Collection } from "discord.js";
import Component from "../components/Component";

export type ClientComponents = {
	buttons: Collection<string, Component>;
	selectMenus: Collection<string, Component>;
	modals: Collection<string, Component>;
};
