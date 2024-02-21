import { createClient, RedisClientType } from "redis";
import Logger from "../../utils/others/Logger.js";

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
	}

	public async init(): Promise<void> {
		await this.client.connect();
		await this.client.flushAll();

		Logger.info("Connected to Redis server.");
	}
}

export default Redis;
