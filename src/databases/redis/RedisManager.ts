import { RedisClientType, SetOptions } from "redis";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(key: string | number): string | null {
		return this.prefix + String(key);
	}

	async set(key: string | number, values: T, options: SetOptions = {}): Promise<void> {
		if (values === undefined) {
			throw new Error(`No values provided to set for key: ${key}`);
		}

		const serializedValues = JSON.stringify(values);
		const id = this.getId(key);

		if (!id) {
			return;
		}

		options.EX = options.EX || 30 * 60;

		await this.client.set(id, serializedValues, options);
	}

	async clear(key: string | number): Promise<void> {
		const id = this.getId(key);

		if (!id) {
			return;
		}

		await this.client.del(id);
	}

	async get(key: string | number): Promise<T | null> {
		const id = this.getId(key);

		if (!id) {
			return null;
		}

		const result = await this.client.get(id);

		return result ? (JSON.parse(result) as T) : null;
	}

	async edit(key: string | number, values: Partial<T>): Promise<void> {
		const existingValue = await this.get(key);

		if (existingValue !== null) {
			return;
		}

		const updatedValue = { ...existingValue, ...values };

		await this.set(key, updatedValue as T, { KEEPTTL: true });
	}
}

export default RedisManager;
