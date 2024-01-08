import {
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	InteractionReplyOptions,
	Message,
	MessagePayload,
	MessageReplyOptions,
	User,
} from "discord.js";

export class BasedHybridContext {
	public author: User;
	public guild: Guild;
	public member: GuildMember;
	public channel: GuildTextBasedChannel;
	public createdTimestamp: number;

	public constructor(public context: ChatInputCommandInteraction | Message<true>) {
		this.author = "author" in context ? context.author : context.user;
		this.member = context.member as GuildMember;
		this.guild = context.guild as Guild;
		this.channel = context.channel as GuildTextBasedChannel;
		this.createdTimestamp = context.createdTimestamp;
	}

	public get message(): Message | undefined {
		return this.isMessage() ? (this.context as Message) : void 0;
	}

	public get interaction(): ChatInputCommandInteraction | undefined {
		return this.isInteraction() ? (this.context as ChatInputCommandInteraction) : void 0;
	}

	public isMessage(): this is HybridContextMessage {
		return this.context instanceof Message;
	}

	public isInteraction(): this is HybridContextInteraction {
		return this.context instanceof ChatInputCommandInteraction;
	}

	public async send(
		options: InteractionReplyOptions | MessagePayload | MessageReplyOptions,
	): Promise<Message> {
		options = Object.assign({ fetchReply: true }, options);
		if (this.isInteraction()) {
			const isSent = this.context.replied || this.context.deferred;
			return (await this.context[isSent ? "followUp" : "reply"](
				options as InteractionReplyOptions,
			)) as Message;
		} else {
			return (await this.context.reply(options as MessagePayload)) as Message;
		}
	}
}

export class HybridContextInteraction extends BasedHybridContext {
	public declare context: ChatInputCommandInteraction;
	public get interaction(): ChatInputCommandInteraction {
		return this.context as ChatInputCommandInteraction;
	}
}

export class HybridContextMessage extends BasedHybridContext {
	public declare context: Message<true>;
	public get message(): Message<true> {
		return this.context as Message<true>;
	}
}

export type HybridContext = HybridContextInteraction | HybridContextMessage;
