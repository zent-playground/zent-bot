import Logger from "./others/Logger.js";

process.on("uncaughtException", async (error) => {
	Logger.error(error);
});

process.on("SIGUSR2", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
