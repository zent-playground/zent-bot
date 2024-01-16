import { RedisClientType } from "redis";

import Logger from "../../utils/Logger.js";

class RedisManager<T> {
	private client: RedisClientType;
	private readonly prefix: string;

	constructor(client: RedisClientType, prefix: string) {
		this.client = client;
		this.prefix = prefix;
	}

	private getId(key: string | number): string | null {
		if (!key) {
			Logger.Warn("Invalid or empty key provided in RedisManager.getId");
			return null;
		}

		return this.prefix + String(key);
	}

	async set(key: string | number, values: T, ttl?: number): Promise<void> {
		try {
			if (!values) {
				Logger.Warn(`No values provided to set for key: ${key}`);
				return;
			}

			const serializedValues = JSON.stringify(values);
			const id = this.getId(key);
			if (!id) return;

			const setOptions = ttl ? { EX: ttl } : undefined;
			await this.client.set(id, serializedValues, setOptions);
		} catch (error) {
			Logger.Error(`Error setting key ${key} with values ${JSON.stringify(values)}`, `${error}`);
		}
	}

	async delete(key: string | number): Promise<void> {
		try {
			const id = this.getId(key);
			if (!id) return;

			await this.client.del(id);
		} catch (error) {
			Logger.Error(`Error deleting key ${key}`, `${error}`);
		}
	}

	async get(key: string | number): Promise<T | null> {
		try {
			const id = this.getId(key);
			if (!id) return null;

			const result = await this.client.get(id);
			return result ? JSON.parse(result) as T : null;
		} catch (error) {
			Logger.Error(`Error retrieving key ${key}`, `${error}`);
			return null;
		}
	}

	async update(key: string | number, values: Partial<T>): Promise<void> {
		try {
			const existingValue = await this.get(key);

			if (!existingValue) {
				Logger.Warn(`No record found for updating key ${key}`);
				return;
			}

			const updatedValue = { ...existingValue, ...values };
			await this.set(key, updatedValue as T);
		} catch (error) {
			Logger.Error(`Error updating key ${key} with values ${JSON.stringify(values)}`, `${error}`);
		}
	}
}

export default RedisManager;
