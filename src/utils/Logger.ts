import chalk from "chalk";

import { formatTimestamp } from "./index.js";

enum LogLevel {
	Info,
	Warn,
	Error,
}

abstract class Logger {
	private static formatMessage(level: LogLevel, messages: string[]): string {
		const formattedLevel = (() => {
			switch (level) {
				case LogLevel.Info:
					return chalk.blue("[INFO]");
				case LogLevel.Warn:
					return chalk.yellow("[WARN]");
				case LogLevel.Error:
					return chalk.red("[ERROR]");
				default:
					return "";
			}
		})();

		const formattedMessages = messages.join("\n");
		return `[${formatTimestamp()}] ${formattedLevel}: ${formattedMessages}`;
	}

	private static log(level: LogLevel, ...messages: string[]): void {
		console.log(Logger.formatMessage(level, messages));
	}

	public static info(...messages: string[]): void {
		Logger.log(LogLevel.Info, ...messages);
	}

	public static warn(...messages: string[]): void {
		Logger.log(LogLevel.Warn, ...messages);
	}

	public static error(...messages: string[]): void {
		Logger.log(LogLevel.Error, ...messages);
	}
}

export default Logger;
