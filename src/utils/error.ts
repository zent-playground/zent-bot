// import Logger from "./Logger.js";

process.on("uncaughtException", async (error) => {
	console.log(error);

	if (process.env.NODE_ENV !== "development") {
		// Webhook message
	}
});
