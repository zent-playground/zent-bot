import { DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Client } from "discord.js";

import session from "express-session";
import helmet from "helmet";

import Logger from "../utils/others/Logger.js";
import { loadControllers } from "../utils/loader.js";

@Module({})
export class AppModule {
	static async forRoot(client: Client<true>): Promise<DynamicModule> {
		return {
			module: AppModule,
			providers: [
				{
					provide: "client",
					useValue: client,
				},
			],
			controllers: await loadControllers(),
		};
	}
}

export const startApp = async (client: Client<true>): Promise<void> => {
	const appModule = await AppModule.forRoot(client);
	const app = await NestFactory.create(appModule, { logger: false });

	app.use(
		session({
			secret: client.config.sessionSecret || "zent",
			resave: false,
			saveUninitialized: true,
			cookie: {
				maxAge: 60_000,
				secure: process.env.NODE_ENV === "development" ? false : true,
			},
		}),
	);

	app.use(helmet());

	app.setGlobalPrefix("api/v1");

	await app.listen(Number(process.env.PORT));
	Logger.info("Started Nest server.");
};
