import { RedisClientType, SetOptions } from "redis";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getFullKey(key: string): string {
		return `${this.prefix}:${key}`;
	}

	public async set(key: string, values: T, options: SetOptions = {}): Promise<void> {
		await this.client.set(this.getFullKey(key), JSON.stringify(values), options);
	}

	public async delete(key: string): Promise<void> {
		await this.client.del(this.getFullKey(key));
	}

	public async get(key: string): Promise<T | null> {
		const result = await this.client.get(this.getFullKey(key));
		return result ? (JSON.parse(result) as T) : null;
	}

	public async rename(key: string, newKey: string): Promise<string> {
		return await this.client.rename(this.getFullKey(key), this.getFullKey(newKey));
	}
}

export default RedisManager;
