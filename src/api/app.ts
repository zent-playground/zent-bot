import { DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Client } from "discord.js";

import Logger from "../utils/Logger.js";
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

	app.setGlobalPrefix("api/v1");

	await app.listen(Number(process.env.PORT));
	Logger.info("Started Nest server.");
};
