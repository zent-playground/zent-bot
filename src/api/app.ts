import { DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Client } from "discord.js";

import session from "express-session";
import helmet from "helmet";

import Logger from "../utils/others/Logger.js";
import { loadControllers } from "../utils/loader.js";

const controllers = await loadControllers();

process.env.PORT = process.env.PORT || "3000";

@Module({})
class AppModule {
	static async forRoot(client: Client<true>): Promise<DynamicModule> {
		return {
			module: AppModule,
			providers: [
				{
					provide: "client",
					useValue: client,
				},
			],
			controllers,
		};
	}
}

export const startApp = async (client: Client<true>): Promise<void> => {
	const module = await AppModule.forRoot(client);
	const app = await NestFactory.create(module, {
		logger: false,
		cors: true,
	});

	const requestHandler = session({
		secret: client.config.sessionSecret || "zent",
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 60_000,
			secure: process.env.NODE_ENV !== "development",
		},
	});

	app.use(requestHandler, helmet());

	await app.listen(Number(process.env.PORT));

	Logger.info(`Started Nest server with ${controllers.length} controllers.`);
};
