import chalk from "chalk";

enum LogLevel {
	INFO,
	WARN,
	ERROR,
}

abstract class Logger {
	private static formatMessage(level: LogLevel, messages: string[]): string {
		const timestamp = new Date().toISOString();

		const formattedLevel = (() => {
			switch (level) {
				case LogLevel.INFO:
					return chalk.blue("[INFO]");
				case LogLevel.WARN:
					return chalk.yellow("[WARN]");
				case LogLevel.ERROR:
					return chalk.red("[ERROR]");
				default:
					return "";
			}
		})();

		const formattedMessages = messages.join("\n");
		return `[${timestamp}] ${formattedLevel}: ${formattedMessages}`;
	}

	private static log(level: LogLevel, ...messages: string[]): void {
		console.log(Logger.formatMessage(level, messages));
	}

	public static Info(...messages: string[]): void {
		Logger.log(LogLevel.INFO, ...messages);
	}

	public static Warn(...messages: string[]): void {
		Logger.log(LogLevel.WARN, ...messages);
	}

	public static Error(...messages: string[]): void {
		Logger.log(LogLevel.ERROR, ...messages);
	}
}

export default Logger;
