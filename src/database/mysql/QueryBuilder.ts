class QueryBuilder {
	protected query: string;

	constructor() {
		this.query = "";
	}

	public static formatValue(value: any): string {
		if (value === null || value === undefined) {
			return "NULL";
		}

		switch (typeof value) {
			default: {
				return `'${JSON.stringify(value)}'`;
			}

			case "string": {
				return `'${value.replace(/'/g, "''")}'`;
			}

			case "boolean": {
				return `'${value ? 1 : 0}'`;
			}

			case "number": {
				return `'${value}'`;
			}
		}
	}

	public select(table: string, fields: string[] = ["*"]): this {
		this.query = `SELECT ${fields
			.map((x) => (x === "*" ? x : `\`${x}\``))
			.join(", ")} FROM ${table}`;
		return this;
	}

	public join(type: string, table: string, condition: string): this {
		this.query += ` ${type.toUpperCase()} JOIN ${table} ON ${condition}`;
		return this;
	}

	public where(condition: string): this {
		this.query += ` WHERE ${condition}`;
		return this;
	}

	public orderBy(orderBy: { field: string; direction: "ASC" | "DESC" }[]): this {
		const orderClause = orderBy.map((order) => `\`${order.field}\` ${order.direction}`).join(", ");
		this.query += ` ORDER BY ${orderClause}`;
		return this;
	}

	public limit(limit: number): this {
		this.query += ` LIMIT ${limit}`;
		return this;
	}

	public insert(table: string, data: { [key: string]: any }): this {
		const keys = Object.keys(data);
		const values = keys.map((key) => QueryBuilder.formatValue(data[key]));

		this.query = `INSERT INTO ${table} (${keys
			.map((k) => `\`${k}\``)
			.join(", ")}) VALUES (${values.join(", ")})`;

		return this;
	}

	public update(table: string, data: { [key: string]: any }, condition: string): this {
		const updates = Object.keys(data)
			.map((key) => `\`${key}\` = ${QueryBuilder.formatValue(data[key])}`)
			.join(", ");

		if (!updates) {
			throw new Error("Missing values.");
		}

		this.query = `UPDATE ${table} SET ${updates} WHERE ${condition}`;

		return this;
	}

	public delete(table: string, condition: string): this {
		this.query = `DELETE FROM ${table} WHERE ${condition}`;
		return this;
	}

	public toString(): string {
		return this.query;
	}
}

export default QueryBuilder;
