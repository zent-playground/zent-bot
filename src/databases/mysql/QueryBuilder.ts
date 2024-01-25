class QueryBuilder {
	private query: string;

	constructor() {
		this.query = "";
	}

	private static FormatValue(value: any): string {
		if (value === null || value === undefined) {
			return "NULL";
		} else if (typeof value === "string") {
			return `'${value.replace(/'/g, "''")}'`;
		} else if (typeof value === "boolean") {
			return `${value}`;
		} else {
			return `'${JSON.stringify(value)}'`;
		}
	}

	select(table: string, fields: string[] = ["*"]): QueryBuilder {
		this.query = `SELECT ${fields.join(", ")} FROM ${table}`;
		return this;
	}

	join(type: string, table: string, condition: string): QueryBuilder {
		this.query += ` ${type.toUpperCase()} JOIN ${table} ON ${condition}`;
		return this;
	}

	where(condition: string): QueryBuilder {
		this.query += ` WHERE ${condition}`;
		return this;
	}

	orderBy(orderBy: { field: string, direction: "ASC" | "DESC" }[]): QueryBuilder {
		const orderClause = orderBy.map(order => `${order.field} ${order.direction}`).join(", ");
		this.query += ` ORDER BY ${orderClause}`;
		return this;
	}

	limit(limit: number): QueryBuilder {
		this.query += ` LIMIT ${limit}`;
		return this;
	}

	insert(table: string, data: { [key: string]: any }): QueryBuilder {
		const keys = Object.keys(data);
		const values = keys.map(key => QueryBuilder.FormatValue(data[key]));
		this.query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${values.join(", ")})`;
		return this;
	}

	update(table: string, data: { [key: string]: any }, condition: string): QueryBuilder {
		const updates = Object.keys(data)
			.map(key => `${key} = ${QueryBuilder.FormatValue(data[key])}`)
			.join(", ");
		this.query = `UPDATE ${table} SET ${updates} WHERE ${condition}`;
		return this;
	}

	delete(table: string, condition: string): QueryBuilder {
		this.query = `DELETE FROM ${table} WHERE ${condition}`;
		return this;
	}

	build(): string {
		return this.query;
	}
}

export default QueryBuilder;
