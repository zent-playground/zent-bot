import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import Logger from "../utils/Logger.js";
import { loadControllers } from "../utils/loader.js";

@Module({
	imports: [],
	controllers: await loadControllers(),
})
class AppModule {}

export const createApp = async (): Promise<void> => {
	const app = await NestFactory.create(AppModule, { logger: false });
	await app.listen(3000);
	Logger.info("Started Nest server.");
};
