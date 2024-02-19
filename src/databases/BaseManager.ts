import { SetOptions } from "redis";
import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";
import QueryBuilder from "./mysql/QueryBuilder.js";

namespace BaseManager {
	export type MySql = import("./mysql/MySql.js").default;
	export type Redis = import("./redis/Redis.js").default;
}

class BaseManager<T extends object> extends MySqlManager<T> {
	private readonly cache: RedisManager<T> | null = null;

	public constructor(table: string, mysql: BaseManager.MySql, redis?: BaseManager.Redis) {
		super(mysql, table);

		if (redis) {
			this.cache = new RedisManager(redis.client, `${redis.prefix}:${table}`);
		}
	}

	private createWhereClause(criteria: Partial<T>): string {
		return Object.entries(criteria)
			.map(([k, v]) => `${k} = ${QueryBuilder.formatValue(v)}`)
			.join(" AND ");
	}

	private createCacheKey(criteria: Partial<T>): string {
		return Object.keys(criteria)
			.sort()
			.map((k) => criteria[k])
			.join(":");
	}

	public async get(criteria: Partial<T>, force = false): Promise<T | null> {
		const key = this.createCacheKey(criteria);

		let data: T | undefined | null = force ? null : await this.cache?.get(key);

		if (!data || force) {
			data = (
				await this.select({
					where: this.createWhereClause(criteria),
					selectFields: ["*"],
				})
			)?.[0];

			if (data && this.cache) {
				await this.cache.set(key, data);
			}
		}

		return data || null;
	}

	public async set(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<void> {
		values = Object.assign(criteria, values);

		await this.insert(values);

		if (this.cache) {
			await this.cache.set(this.createCacheKey(criteria), values as T, options);
		}
	}

	public async upd(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<void> {
		await super.update(this.createWhereClause(criteria), values);

		if (this.cache) {
			const key = this.createCacheKey(criteria);
			const updatedValues = (await this.get(criteria, true))!;

			await this.cache.set(key, updatedValues, options);

			let isCriteriaUpdated = false;

			for (const k of Object.keys(criteria)) {
				if (k in updatedValues && criteria[k] !== updatedValues[k]) {
					criteria[k] = updatedValues[k];
					isCriteriaUpdated = true;
				}
			}

			if (isCriteriaUpdated) {
				await this.cache.rename(key, this.createCacheKey(criteria));
			}
		}
	}

	public async del(criteria: Partial<T>): Promise<void> {
		await super.delete(this.createWhereClause(criteria));

		if (this.cache) {
			const cacheKeys = this.createCacheKey(criteria);
			await this.cache.delete(cacheKeys);
		}
	}
}

export default BaseManager;
