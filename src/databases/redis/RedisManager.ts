import { RedisClientType } from "redis";
import Logger from "../../utils/Logger.js";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(key: string | number): string {
		return this.prefix + String(key);
	}

	async set(key: string | number, values: T): Promise<void> {
		if (!values) return;
		const serializedValues = JSON.stringify(values);
		await this.client.set(this.getId(key), serializedValues);
	}

	async delete(key: string | number): Promise<void> {
		await this.client.del(this.getId(key));
	}

	async get(key: string | number): Promise<T | null> {
		const result = await this.client.get(this.getId(key));
		if (!result) return null;
		return JSON.parse(result) as T;
	}

	async update(key: string | number, values: Partial<T>): Promise<void> {
		const existingValue = await this.get(this.getId(key));

		if (!existingValue) {
			Logger.Warn(`No record found for id ${key}`);
			return;
		}

		const updatedValue = { ...existingValue, ...values };
		await this.set(this.getId(key), updatedValue as T);
	}
}

export default RedisManager;
