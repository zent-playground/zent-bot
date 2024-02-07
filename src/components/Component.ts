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
import Args from "../utils/others/Args.js";

export class ComponentArgs extends Args {
	language!: string;
}

interface ComponentOptions {
	memberPermissions?: PermissionResolvable;
	preconditions?: Preconditions;
}

namespace Component {
	export type Button = ButtonInteraction<"cached">;
	export type SelectMenu = AnySelectMenuInteraction<"cached">;
	export type ChannelSelectMenu = ChannelSelectMenuInteraction<"cached">;
	export type MentionableSelectMenu = MentionableSelectMenuInteraction<"cached">;
	export type StringSelectMenu = StringSelectMenuInteraction<"cached">;
	export type UserSelectMenu = UserSelectMenuInteraction<"cached">;
	export type Modal = ModalSubmitInteraction<"cached">;
	export type Args = ComponentArgs;
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
