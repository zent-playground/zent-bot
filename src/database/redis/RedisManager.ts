import { RedisClientType } from "redis";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(key: string): string {
		return this.prefix + key;
	}

	async insert(key: string, values: T): Promise<void> {
		const serializedValues = JSON.stringify(values);
		await this.client.set(this.getId(key), serializedValues);
	}

	async delete(key: string): Promise<void> {
		await this.client.del(this.getId(key));
	}

	async find(key: string): Promise<T | null> {
		const result = await this.client.get(this.getId(key));

		if (!result) {
			return null;
		}

		return JSON.parse(result) as T;
	}

	async update(key: string, values: Partial<T>): Promise<void> {
		const existingValue = await this.find(this.getId(key));

		if (!existingValue) {
			throw new Error(`No record found for id ${key}`);
		}

		const updatedValue = { ...existingValue, ...values };
		await this.insert(this.getId(key), updatedValue as T);
	}
}

export default RedisManager;
