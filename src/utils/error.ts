import Logger from "./Logger.js";

process.on("uncaughtException", async (error) => {
	Logger.error(error);

	if (process.env.NODE_ENV !== "development") {
		// Webhook message
	}
});
