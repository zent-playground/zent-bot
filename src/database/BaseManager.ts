import { SetOptions } from "redis";
import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";
import QueryBuilder from "./mysql/QueryBuilder.js";

namespace BaseManager {
	export type MySql = import("./mysql/MySql.js").default;
	export type Redis = import("./redis/Redis.js").default;
}

class BaseManager<T extends object> {
	private readonly db: MySqlManager<T>;
	private readonly cache: RedisManager<T> | null;

	public constructor(table: string, mysql: BaseManager.MySql, redis?: BaseManager.Redis) {
		this.db = new MySqlManager(mysql, table);
		this.cache = redis ? new RedisManager(redis.client, `${redis.prefix}:${table}`) : null;
	}

	private createWhereClause(criteria: Partial<T>): string {
		return Object.entries(criteria)
			.map(([k, v]) => `${k} = ${QueryBuilder.formatValue(v)}`)
			.join(" AND ");
	}

	private createCacheKey(criteria: Partial<T>): string {
		return Object.keys(criteria)
			.sort()
			.map((k) => `'${k}'='${criteria[k]}'`)
			.join(":");
	}

	public async _get(criteria: Partial<T>, force = false): Promise<T | null> {
		const key = this.createCacheKey(criteria);

		let data: T | undefined | null = force ? null : await this.cache?.get(key);

		if (!data || force) {
			data = (
				await this.db.select({
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

	public async _set(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<T> {
		values = Object.assign(criteria, values);

		await this.db.insert(values);

		if (this.cache) {
			await this.cache.set(this.createCacheKey(criteria), values as T, options);
		}

		return values as T;
	}

	public async _upd(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<T> {
		await this.db.update(this.createWhereClause(criteria), values);
		const updatedValues = (await this._get(criteria, true))!;

		if (this.cache) {
			const key = this.createCacheKey(criteria);

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

		return updatedValues;
	}

	public async _del(criteria: Partial<T>): Promise<void> {
		await this.db.delete(this.createWhereClause(criteria));

		if (this.cache) {
			const cacheKeys = this.createCacheKey(criteria);
			await this.cache.delete(cacheKeys);
		}
	}
}

export default BaseManager;
