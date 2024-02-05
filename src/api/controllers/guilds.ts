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
		const guild =
			this.client.guilds.cache.get(guildId) ||
			(await this.client.guilds.fetch(guildId).catch(() => {
				throw new HttpException("Guild not found!", HttpStatus.NOT_FOUND);
			}));

		return res.status(HttpStatus.OK).json(guild.toJSON());
	}
}

export default Client;
