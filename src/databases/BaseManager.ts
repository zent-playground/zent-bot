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
		const a = Object.entries(criteria)
			.map(([k, v]) => `${k} = ${QueryBuilder.formatValue(v)}`)
			.join(" AND ");
		return a;
	}

	private createCacheKey(criteria: Partial<T>): (string | number)[] {
		return Object.keys(criteria)
			.sort()
			.map((k) => criteria[k]);
	}

	public async get(criteria: Partial<T>, force = false): Promise<T | null> {
		const key = this.createCacheKey(criteria);

		let data: T | undefined | null = force ? null : await this.cache?.get(key);

		if (!data || force) {
			const whereClause = this.createWhereClause(criteria);

			data =
				(
					await this.select({
						where: whereClause,
						selectFields: ["*"],
					})
				)?.[0] || null;

			if (data !== null && this.cache) {
				await this.cache.set(key, data);
			}
		}

		return data;
	}

	public async set(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<void> {
		values = Object.assign(criteria, values);

		await this.insert(values);

		if (this.cache) {
			const key = this.createCacheKey(criteria);
			await this.cache.set(key, values as T, options);
		}
	}

	public async upd(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<void> {
		const whereClause = this.createWhereClause(criteria);

		await super.update(whereClause, values);

		if (this.cache) {
			let key = this.createCacheKey(criteria);

			const updatedValues = (await this.get(criteria, true))!;

			const isCriteriaUpdated = (() => {
				let result = false;

				for (const k of Object.keys(criteria)) {
					if (k in updatedValues && criteria[k] !== updatedValues[k]) {
						criteria[k] = updatedValues[k];
						result = true;
					}
				}

				return result;
			})();

			if (isCriteriaUpdated) {
				await this.cache.delete(key);
				key = this.createCacheKey(criteria);
			}

			await this.cache.set(key, updatedValues, options);
		}
	}

	public async del(criteria: Partial<T>): Promise<void> {
		const whereClause = this.createWhereClause(criteria);

		await super.delete(whereClause);

		if (this.cache) {
			const cacheKeys = this.createCacheKey(criteria);
			await this.cache.delete(cacheKeys);
		}
	}
}

export default BaseManager;
