import {
	AutocompleteInteraction,
	Awaitable,
	ChatInputCommandInteraction,
	Client,
	ContextMenuCommandInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
	UserContextMenuCommandInteraction,
} from "discord.js";

import { Subcommand, SubcommandBody } from "../types/subcommand.js";
import Args from "../utils/others/Args.js";

export class CommandArgs extends Args {
	prefix!: string;
	language!: string;
	entrySubcommand?: SubcommandBody;
	parentSubcommand?: Subcommand;
}

namespace Command {
	export type ChatInput = ChatInputCommandInteraction;
	export type ContextMenu = ContextMenuCommandInteraction;
	export type UserContextMenu = UserContextMenuCommandInteraction;
	export type MessageContextMenu = MessageContextMenuCommandInteraction;
	export type Autocomplete = AutocompleteInteraction;
	export type HybridContext = import("./HybridContext.js").HybridContext;
	export type Args = CommandArgs;
}

export interface CommandOptions {
	name: string;
	aliases?: string[];
	subcommands?: Subcommand[];
}

class Command {
	public name: string;
	public aliases: string[];
	public applicationCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	public client!: Client<true>;
	public subcommand?: Subcommand;

	public constructor(public options: CommandOptions) {
		this.name = options.name;
		this.aliases = options.aliases || [];
	}

	public initialize?(): Awaitable<void>;
	public executeAutocomplete?(interaction: Command.Autocomplete): Awaitable<void>;
	public executeChatInput?(interaction: Command.ChatInput): Awaitable<void>;
	public executeContextMenu?(interaction: Command.ContextMenu): Awaitable<void>;
	public executeHybrid?(context: Command.HybridContext, args: Command.Args): Awaitable<void>;
	public executeMessage?(message: Message, args: Command.Args): Awaitable<void>;
	public executeMessageContextMenu?(interaction: Command.MessageContextMenu): Awaitable<void>;
	public executeUserContextMenu?(interaction: Command.UserContextMenu): Awaitable<void>;
}

export default Command;
