import MySql from "../mysql/MySql.js";
import QueryBuilder from "../mysql/QueryBuilder.js";

export interface QueryOptions<T> {
	selectFields?: string[];
	joins?: JoinClause[];
	where?: string;
	limit?: number;
	orderBy?: { field: keyof T; direction: "ASC" | "DESC" }[];
}

interface JoinClause {
	table: string;
	condition: string;
	type?: "INNER" | "LEFT" | "RIGHT";
}

class MySqlManager<T> {
	private db: MySql;
	protected readonly table: string;

	public constructor(db: MySql, table: string) {
		this.db = db;
		this.table = table;
	}

	protected async insert(values: Partial<T>): Promise<void> {
		const query = new QueryBuilder().insert(this.table, values);
		await this.db.query(`${query}`);
	}

	protected async delete(condition: string): Promise<void> {
		if (!condition) {
			throw new Error("Attempted to delete with empty condition.");
		}

		const query = new QueryBuilder().delete(this.table, condition);
		await this.db.query(`${query}`);
	}

	protected async select(options: QueryOptions<T> = {}): Promise<T[]> {
		const query = new QueryBuilder().select(this.table, options?.selectFields);

		if (options.joins) {
			for (const entry of options.joins) {
				query.join(entry.type || "INNER", entry.table, entry.condition);
			}
		}

		if (options.where) {
			query.where(options.where);
		}

		if (options.orderBy) {
			const orderBy = options.orderBy.map((order) => ({
				field: order.field as string,
				direction: order.direction,
			}));

			query.orderBy(orderBy);
		}

		if (options?.limit) {
			query.limit(options.limit);
		}

		return await this.db.query(`${query}`);
	}

	protected async update(condition: string, values: Partial<T>): Promise<void> {
		const query = new QueryBuilder().update(this.table, values, condition);
		await this.db.query(`${query}`);
	}
}

export default MySqlManager;
