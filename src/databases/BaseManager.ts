import { SetOptions } from "redis";
import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";

namespace BaseManager {
	export type MySql = import("./mysql/MySql.js").default;
	export type Redis = import("./redis/Redis.js").default;
}

class BaseManager<T> extends MySqlManager<T> {
	private readonly cache: RedisManager<T> | null = null;

	public constructor(table: string, mysql: BaseManager.MySql, redis?: BaseManager.Redis) {
		super(mysql, table);

		if (redis) {
			this.cache = new RedisManager(redis.client, `${redis.prefix}${table}:`);
		}
	}

	private buildWhereClause(criteria: Partial<T>): string {
		return Object.entries(criteria)
			.map(
				([field, value]) =>
					`${field} = '${typeof value === "boolean" ? (value ? 1 : 0) : value}'`,
			)
			.join(" AND ");
	}

	private criteriaToCacheKey(criteria: Partial<T>): (string | number)[] {
		return Object.values(criteria);
	}

	public async get(criteria: Partial<T>, force = false): Promise<T | null> {
		const cacheKeys = this.criteriaToCacheKey(criteria);
		let data: T | undefined | null = force ? null : await this.cache?.get(cacheKeys);

		if (!data || force) {
			const whereClause = this.buildWhereClause(criteria);
			data = (
				await this.select({
					where: whereClause,
					selectFields: ["*"],
				})
			)?.[0];

			console.log(data);
		}

		return data;
	}

	public async set(
		criteria: Partial<T>,
		values: Partial<T>,
		_options: SetOptions = {},
	): Promise<void> {
		await this.insert({ ...criteria, ...values } as T);

		if (this.cache) {
			const cacheKey = this.criteriaToCacheKey(criteria);
			await this.cache.set(cacheKey, { ...criteria, ...values } as T, _options);
		}
	}

	public async upd(
		criteria: Partial<T>,
		values: Partial<T>,
		_options: SetOptions = {},
	): Promise<void> {
		const whereClause = this.buildWhereClause(criteria);
		await super.update(whereClause, values);

		if (this.cache) {
			const cacheKey = this.criteriaToCacheKey(criteria);
			console.log(cacheKey);
			await this.cache.set(cacheKey, (await this.get(criteria, true))!, _options);
		}
	}

	public async del(criteria: Partial<T>): Promise<void> {
		const whereClause = this.buildWhereClause(criteria);
		await super.delete(whereClause);

		if (this.cache) {
			const cacheKeys = this.criteriaToCacheKey(criteria);
			await this.cache.delete(cacheKeys);
		}
	}
}

export default BaseManager;
