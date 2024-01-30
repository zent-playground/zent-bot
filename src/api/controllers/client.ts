import { Controller, Get, Inject, Res, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { Client as DiscordClient } from "discord.js";

@Controller("client")
class Client {
	public constructor(@Inject("client") private readonly client: DiscordClient<true>) {}

	@Get()
	async information(@Res() res: Response) {
		if (!this.client.user) {
			throw new HttpException(
				"Client user information is not available.",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return res.status(HttpStatus.OK).json(this.client.user.toJSON());
	}

	@Get("status")
	async status(@Res() res: Response) {
		if (!this.client.ws) {
			throw new HttpException(
				"WebSocket information is not available.",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		let databasePing: number;
		try {
			databasePing = await this.client.mysql.ping();
		} catch (error) {
			throw new HttpException("Database ping failed.", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res.status(HttpStatus.OK).json({
			api: this.client.ws.ping,
			online: this.client.ws.status,
			database: databasePing,
		});
	}

	@Get("commands")
	async commands(@Res() res: Response) {
		if (!this.client.commands) {
			throw new HttpException("Commands are not available.", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return res
			.status(HttpStatus.OK)
			.json(this.client.commands.map((command) => command.applicationCommands).flat());
	}
}

export default Client;
