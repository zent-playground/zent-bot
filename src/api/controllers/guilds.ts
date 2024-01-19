import { Controller, Get, HttpStatus, Inject, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { Client as DiscordClient, Guild } from "discord.js";

@Controller("guilds")
class Client {
	public constructor(@Inject("client") private readonly client: DiscordClient<true>) {}

	@Get(":id")
	async information(@Param("id") guildId: string, @Res() res: Response) {
		let guild: Guild | undefined = this.client.guilds.cache.get(guildId);

		if (!guild) {
			try {
				guild = await this.client.guilds.fetch(guildId);
			} catch (error) {
				return res.status(HttpStatus.NOT_FOUND).json({ message: "Guild not found!" });
			}
		}

		const guildInfo = {
			id: guild.id,
			name: guild.name,
			memberCount: guild.memberCount,
			// maybe other information
		};

		return res.status(HttpStatus.OK).json(guildInfo);
	}
}

export default Client;
