import { Client } from "discord.js";
import { SetOptions } from "redis";

import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";
import QueryBuilder from "./mysql/QueryBuilder.js";

class BaseManager<T extends object> {
	private defaultExpire = 30 * 60;
	private readonly db: MySqlManager<T>;
	private readonly cache: RedisManager<T>;

	public constructor(
		public client: Client,
		table: string,
	) {
		const { redis, mysql } = client;

		this.db = new MySqlManager(mysql, table);
		this.cache = new RedisManager(redis, table);
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

	protected async _get(criteria: Partial<T>, force = false): Promise<T | null> {
		const key = this.createCacheKey(criteria);

		let data: T | undefined | null = force ? null : await this.cache?.get(key);

		if (!data || force) {
			data = (
				await this.db.select({
					where: this.createWhereClause(criteria),
					selectFields: ["*"],
				})
			)?.[0];
		}

		if (data) {
			await this.cache.set(key, data, { EX: this.defaultExpire });
		}

		return data || null;
	}

	protected async _set(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<T> {
		values = Object.assign(criteria, values);

		await this.db.insert(values);
		await this.cache.set(
			this.createCacheKey(criteria),
			values as T,
			Object.assign({ EX: this.defaultExpire }, options),
		);

		return values as T;
	}

	protected async _upd(
		criteria: Partial<T>,
		values: Partial<T>,
		options: SetOptions = {},
	): Promise<T> {
		await this.db.update(this.createWhereClause(criteria), values);
		const updatedValues = (await this._get(criteria, true))!;

		if (updatedValues) {
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

	protected async _del(criteria: Partial<T>): Promise<void> {
		await this.db.delete(this.createWhereClause(criteria));

		if (this.cache) {
			const cacheKeys = this.createCacheKey(criteria);
			await this.cache.delete(cacheKeys);
		}
	}
}

export default BaseManager;
