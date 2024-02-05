import Logger from "./others/Logger.js";

process.on("uncaughtException", async (error) => Logger.error(error));
