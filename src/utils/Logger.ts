import chalk from "chalk";

enum LogLevel {
	Info,
	Warn,
	Error,
}

abstract class Logger {
	private static log(level: LogLevel, ...args: any[]): void {
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

		const formattedTimestamp = chalk.cyanBright(`[${new Date().toISOString()}]`);
		
		console.log(`${formattedTimestamp} ${formattedLevel}`, ...args);
	}

	public static info(...args: any[]): void {
		Logger.log(LogLevel.Info, ...args);
	}

	public static warn(...args: any[]): void {
		Logger.log(LogLevel.Warn, ...args);
	}

	public static error(...args: any[]): void {
		Logger.log(LogLevel.Error, ...args);
	}
}

export default Logger;
