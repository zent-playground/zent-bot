import MySql from "../mysql/MySql.js";
import QueryBuilder from "../mysql/QueryBuilder.js";

import Logger from "../../utils/Logger.js";

interface QueryOptions<T> {
	selectFields?: string[];
	joins?: JoinClause[];
	where?: string;
	limit?: number;
	orderBy?: { field: keyof T, direction: "ASC" | "DESC" }[];
}

interface JoinClause {
	table: string;
	condition: string;
	type?: "INNER" | "LEFT" | "RIGHT";
}

class MySqlManager<T> {
	private db: MySql;
	public readonly table: string;

	public constructor(db: MySql, table: string) {
		this.db = db;
		this.table = table;
	}

	public async insert(values: Partial<T>): Promise<void> {
		const builder = new QueryBuilder().insert(this.table, values);
		try {
			const query = builder.build();
			await this.db.query(query);
		} catch (error) {
			Logger.Error(`Error in MySqlManager.insert: ${error}`, `Query: ${builder.build()}`);
		}
	}

	public async delete(condition: string): Promise<void> {
		if (!condition) {
			Logger.Warn("Attempted to delete with empty condition in MySqlManager.delete");
			return;
		}

		const builder = new QueryBuilder().delete(this.table, condition);
		try {
			const query = builder.build();
			await this.db.query(query);
		} catch (error) {
			Logger.Error(`Error in MySqlManager.delete: ${error}`, `Condition: ${condition}`);
		}
	}

	public async select(options?: QueryOptions<T>): Promise<T[]> {
		const builder = new QueryBuilder().select(this.table, options?.selectFields);

		options?.joins?.forEach(join => {
			builder.join(join.type || "INNER", join.table, join.condition);
		});

		if (options?.where) {
			builder.where(options.where);
		}

		if (options?.orderBy) {
			const orderBy = options?.orderBy?.map(order => ({
				field: order.field as string,
				direction: order.direction
			}));

			builder.orderBy(orderBy);
		}

		if (options?.limit) {
			builder.limit(options.limit);
		}

		try {
			const query = builder.build();
			return await this.db.query(query);
		} catch (error) {
			Logger.Error(`Error in MySqlManager.select: ${error}`, `Options: ${JSON.stringify(options)}`);
			return [];
		}
	}

	public async update(condition: string, values: Partial<T>): Promise<void> {
		if (!condition) {
			Logger.Warn("Attempted to update with invalid condition in MySqlManager.update");
			return;
		}

		const builder = new QueryBuilder().update(this.table, values, condition);
		try {
			const query = builder.build();
			await this.db.query(query);
		} catch (error) {
			Logger.Error(`Error in MySqlManager.update: ${error}`, `Condition: ${condition}`, `Values: ${JSON.stringify(values)}`);
		}
	}
}

export default MySqlManager;

