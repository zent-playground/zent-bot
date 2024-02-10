import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Inject,
	Param,
	Res,
} from "@nestjs/common";
import { Response } from "express";
import { Client as DiscordClient } from "discord.js";

@Controller("guilds")
class Client {
	public constructor(@Inject("client") private readonly client: DiscordClient<true>) {}

	@Get(":id")
	async information(@Param("id") guildId: string, @Res() res: Response) {
		const guild = await this.client.guilds.fetch(guildId).catch(() => {
			throw new HttpException("Guild not found!", HttpStatus.NOT_FOUND);
		});

		const data = guild.toJSON() as any;

		delete data.members;

		return res.status(HttpStatus.OK).json(data);
	}
}

export default Client;
