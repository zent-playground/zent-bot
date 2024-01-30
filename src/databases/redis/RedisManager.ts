import { RedisClientType, SetOptions } from "redis";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(keys: (string | number)[]): string {
		return this.prefix + keys.join(":");
	}

	async set(keys: (string | number)[], values: T, options: SetOptions = {}): Promise<void> {
		if (values === undefined) {
			throw new Error(`No values provided to set for keys: '${keys.join(", ")}'.`);
		}

		const serializedValues = JSON.stringify(values);
		const id = this.getId(keys);

		await this.client.set(id, serializedValues, options);
	}

	async delete(keys: (string | number)[]): Promise<void> {
		const id = this.getId(keys);
		await this.client.del(id);
	}

	async get(keys: (string | number)[]): Promise<T | null> {
		const id = this.getId(keys);

		const result = await this.client.get(id);
		return result ? (JSON.parse(result) as T) : null;
	}
}

export default RedisManager;
