import { createClient, RedisClientType } from "redis";

import Logger from "@/utils/Logger.js";

interface RedisConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	prefix: string;
}

class Redis {
	public client: RedisClientType;
	public prefix: string;

	public constructor(config: RedisConfig) {
		this.client = createClient({
			url: `redis://${config.user}:${config.password}@${config.host}:${config.port}`,
		});
		this.prefix = config.prefix;

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this.client.on("error", (err) => Logger.error("Redis Client Error.\t", err));
		this.client.on("connect", () => Logger.info("Redis connected."));
		this.client.on("end", () => Logger.info("Redis disconnected."));
	}

	public async connect(): Promise<void> {
		await this.client.connect();
	}

	public async disconnect(): Promise<void> {
		await this.client.quit();
	}
}

export default Redis;
