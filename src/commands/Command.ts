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

interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[]
}

namespace Command {
	export type ChatInput = ChatInputCommandInteraction;
	export type ContextMenu = ContextMenuCommandInteraction;
	export type UserContextMenu = UserContextMenuCommandInteraction;
	export type MessageContextMenu = MessageContextMenuCommandInteraction;
	export type Autocomplete = AutocompleteInteraction;
	export type HybridContext = import("./HybridContext.js").HybridContext;
}

class Command {
	public name: string;
	public description: string;
	public aliases: string[];
	public applicationCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	public client!: Client<true>;

	public constructor(public options: CommandOptions) {
		this.name = options.name;
		this.description = options.description;
		this.aliases = options.aliases || [];
	}

	public initialize?(): Awaitable<void>;
	public executeAutocomplete?(interaction: Command.Autocomplete): Awaitable<void>;
	public executeChatInput?(interaction: Command.ChatInput): Awaitable<void>;
	public executeContextMenu?(interaction: Command.ContextMenu): Awaitable<void>;
	public executeHybrid?(context: Command.HybridContext, args: string[]): Awaitable<void>;
	public executeMessage?(message: Message, args: string[]): Awaitable<void>;
	public executeMessageContextMenu?(interaction: Command.MessageContextMenu): Awaitable<void>;
	public executeUserContextMenu?(interaction: Command.UserContextMenu): Awaitable<void>;
}

export default Command;
