import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";

namespace BaseManager {
	export type MySql = import("./mysql/MySql.js").default;
	export type Redis = import("./redis/Redis.js").default;
	export type Optional<T, K extends string = string> = Omit<Partial<T>, K>;
}

class BaseManager<T> extends MySqlManager<T> {
	public cache!: RedisManager<T>;

	public constructor(table: string, mysql: BaseManager.MySql, redis?: BaseManager.Redis) {
		super(mysql, table);

		if (redis) {
			this.cache = new RedisManager(redis.client, `${redis.prefix}${table}:`);
		}
	}

	public async get(id: string, force = false): Promise<T | null> {
		let data: T | null = force ? null : await this.cache?.get(id);

		if (!data || force) {
			data = (
				await this.select({
					where: `id = '${id}'`,
				})
			)?.[0];

			if (data) {
				await this.cache.set(id, data);
			}
		}

		return data;
	}

	public async set(
		id: string,
		values: Partial<T>,
		options: {
			overwrite?: boolean;
			ttl?: number;
		} = {},
	): Promise<void> {
		values = Object.assign(values, { id });

		if (options?.overwrite) {
			if (await this.get(id)) {
				await this.update(`id = '${id}'`, values);
			} else {
				await this.insert(values);
			}
		} else {
			await this.insert(values);
		}

		await this.cache.set(id, await this.get(id, true) as T, { EX: options.ttl || 10 * 60 });
	}

	public async edit(id: string, values: Partial<T>): Promise<void> {
		await super.update(`id = '${id}'`, values);
		await this.cache.set(id, await this.get(id, true) as T);
	}

	public async delete(id: string): Promise<void> {
		await super.delete(`id = '${id}'`);
		await this.cache.clear(id);
	}
}

export default BaseManager;
