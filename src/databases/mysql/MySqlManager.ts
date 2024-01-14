import MySql from "./MySql.js";

class MySqlManager<T> {
	private db: MySql;
	private readonly table: string;

	public constructor(db: MySql, table: string) {
		this.db = db;
		this.table = table;
	}

	public async insert(values: Partial<T>) {
		const columns = Object.keys(values);

		await this.db.query(
			`INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${columns
				.map((key) => {
					const value = (values as any)[key];
					return `${value === null ? value : `'${value}'`}`;
				})
				.join(", ")})`,
		);
	}

	public async delete(condition?: string) {
		await this.db.query(`DELETE FROM ${this.table} ${condition ? `WHERE ${condition}` : ""}`);
	}

	public async select(condition?: string): Promise<T[]> {
		return await this.db.query(
			`SELECT * FROM ${this.table} ${condition ? `WHERE ${condition}` : ""}`,
		);
	}

	public async update(condition: string, values: Partial<T>) {
		const updates = Object.keys(values)
			.map((key) => {
				const value = (values as any)[key];
				return `${key} = ${value === null ? value : `'${value}'`}`;
			})
			.join(", ");

		await this.db.query(`UPDATE ${this.table} SET ${updates} WHERE ${condition}`);
	}
}

export default MySqlManager;
