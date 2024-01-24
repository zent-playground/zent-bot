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
	public readonly table: string;

	public constructor(db: MySql, table: string) {
		this.db = db;
		this.table = table;
	}

	protected async insert(values: Partial<T>): Promise<void> {
		const builder = new QueryBuilder().insert(this.table, values);
		const query = builder.build();
		await this.db.query(query);
	}

	protected async delete(condition: string): Promise<void> {
		if (!condition) {
			throw new Error("Attempted to delete with empty condition.");
		}

		const builder = new QueryBuilder().delete(this.table, condition);
		const query = builder.build();

		await this.db.query(query);
	}

	protected async select(options?: QueryOptions<T>): Promise<T[]> {
		const builder = new QueryBuilder().select(this.table, options?.selectFields);

		options?.joins?.forEach((join) => {
			builder.join(join.type || "INNER", join.table, join.condition);
		});

		if (options?.where) {
			builder.where(options.where);
		}

		if (options?.orderBy) {
			const orderBy = options?.orderBy?.map((order) => ({
				field: order.field as string,
				direction: order.direction,
			}));

			builder.orderBy(orderBy);
		}

		if (options?.limit) {
			builder.limit(options.limit);
		}

		const query = builder.build();

		return await this.db.query(query);
	}

	protected async update(condition: string, values: Partial<T>): Promise<void> {
		const builder = new QueryBuilder().update(this.table, values, condition);
		const query = builder.build();
		await this.db.query(query);
	}
}

export default MySqlManager;
