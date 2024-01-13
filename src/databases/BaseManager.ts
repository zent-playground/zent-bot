import MySqlManager from "./mysql/MySqlManager.js";
import RedisManager from "./redis/RedisManager.js";

namespace BaseManager {
	export type MySql = import("./mysql/MySql.js").default;
	export type Redis = import("./redis/Redis.js").default;
}

class BaseManager<T> extends MySqlManager<T> {
	public cache: RedisManager<T>;

	public constructor(
		mysql: BaseManager.MySql,
		redis: BaseManager.Redis,
		table: string,
	) {
		super(mysql, table);
		this.cache = new RedisManager(redis.client, redis.prefix);
	}
}

export default BaseManager;
