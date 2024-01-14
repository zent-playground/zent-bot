import {
	AnySelectMenuInteraction,
	Awaitable,
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	Client,
	ModalSubmitInteraction,
	PermissionResolvable,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
} from "discord.js";

interface ComponentOptions {
	memberPermissions?: PermissionResolvable;
}

namespace Component {
	export type Button = ButtonInteraction;
	export type Modal = ModalSubmitInteraction;
	export type SelectMenu = AnySelectMenuInteraction;
	export type StringSelectMenu = StringSelectMenuInteraction;
	export type UserSelectMenu = UserSelectMenuInteraction;
	export type ChannelSelectMenu = ChannelSelectMenuInteraction;
	export type Args = import("./Args.js").default;
}

class Component {
	public client!: Client<true>;
	public subCustomId!: string;

	public constructor(
		public preCustomId: string,
		public options?: ComponentOptions,
	) {}

	public execute?(
		interaction: Component.Button | Component.Modal | Component.SelectMenu,
		args: Component.Args,
	): Awaitable<void>;
}

export default Component;
