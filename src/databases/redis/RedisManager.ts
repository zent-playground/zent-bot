import { RedisClientType, SetOptions } from "redis";

import Logger from "@/utils/Logger.js";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(key: string | number): string | null {
		if (!key) {
			Logger.warn("Invalid or empty key provided in RedisManager.getId");
			return null;
		}

		return this.prefix + String(key);
	}

	async set(key: string | number, values: T, options: SetOptions = {}): Promise<void> {
		try {
			if (values === undefined) {
				Logger.warn(`No values provided to set for key: ${key}`);
				return;
			}

			const serializedValues = JSON.stringify(values);
			const id = this.getId(key);
			if (!id) return;

			await this.client.set(id, serializedValues, options);
		} catch (error) {
			Logger.error(
				`Error setting key ${key} with values ${JSON.stringify(values)}`,
				`${error}`,
			);
		}
	}

	async clear(key: string | number): Promise<void> {
		try {
			const id = this.getId(key);
			if (!id) return;

			await this.client.del(id);
		} catch (error) {
			Logger.error(`Error deleting key ${key}`, `${error}`);
		}
	}

	async get(key: string | number): Promise<T | null> {
		try {
			const id = this.getId(key);
			if (!id) return null;

			const result = await this.client.get(id);
			return result ? (JSON.parse(result) as T) : null;
		} catch (error) {
			Logger.error(`Error retrieving key ${key}`, `${error}`);
			return null;
		}
	}

	async edit(key: string | number, values: Partial<T>): Promise<void> {
		const existingValue = await this.get(key);

		if (!existingValue) {
			throw new Error(`No record found for updating key '${key}'.`);
		}

		const updatedValue = { ...existingValue, ...values };
		await this.set(key, updatedValue as T, { KEEPTTL: true });
	}
}

export default RedisManager;
