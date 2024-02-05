import {
	AnySelectMenuInteraction,
	Awaitable,
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	Client,
	MentionableSelectMenuInteraction,
	ModalSubmitInteraction,
	PermissionResolvable,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
} from "discord.js";

import { Preconditions } from "../commands/Command.js";

interface ComponentOptions {
	memberPermissions?: PermissionResolvable;
	preconditions?: Preconditions;
}

namespace Component {
	export type Button = ButtonInteraction;
	export type SelectMenu = AnySelectMenuInteraction;
	export type ChannelSelectMenu = ChannelSelectMenuInteraction;
	export type MentionableSelectMenu = MentionableSelectMenuInteraction;
	export type StringSelectMenu = StringSelectMenuInteraction;
	export type UserSelectMenu = UserSelectMenuInteraction;
	export type Modal = ModalSubmitInteraction;
	export type Args = import("./Args.js").default;
}

class Component {
	public client!: Client<true>;
	public preconditions: Preconditions;

	public constructor(
		public key: string,
		public options: ComponentOptions = {},
	) {
		this.preconditions = options.preconditions || {};
	}

	public executeButton?(interaction: Component.Button, args: Component.Args): Awaitable<void>;

	public executeSelectMenu?(
		interaction: Component.SelectMenu,
		args: Component.Args,
	): Awaitable<void>;

	public executeChannelSelectMenu?(
		interaction: Component.ChannelSelectMenu,
		args: Component.Args,
	): Awaitable<void>;

	public executeMentionableSelectMenu?(
		interaction: Component.MentionableSelectMenu,
		args: Component.Args,
	): Awaitable<void>;

	public executeStringSelectMenu?(
		interaction: Component.StringSelectMenu,
		args: Component.Args,
	): Awaitable<void>;

	public executeUserSelectMenu?(
		interaction: Component.UserSelectMenu,
		args: Component.Args,
	): Awaitable<void>;

	public executeModal?(interaction: Component.Modal, args: Component.Args): Awaitable<void>;
}

export default Component;
