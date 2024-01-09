import MySql from "./MySql";

class MySqlManager<T> {
	private db: MySql;
	private readonly table: string;

	public constructor(
		db: MySql,
		table: string
	) {
		this.db = db;
		this.table = table;
	}

	/**
	 * @param options `Column: values`
	 * @example
	 * ```js
	 * await manager.insert({
	 *     "name": "Louis",
	 *     "level": "3"
	 * });
	 * ```
	 */
	public async insert(values: Partial<T>) {
		const columns = Object.keys(values);

		await this.db.query(
			`INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${columns
				.map(key => {
					const value = (values as any)[key];
					return `${value === null ? value : `'${value}'`}`;
				})
				.join(", ")})`
		);
	}

	/**
	 * @param condition
	 * @example
	 * ```js
	 * await manager.delete("name = 'Louis' OR level < 5");
	 * await manager.delete();
	 * ```
	 */
	public async delete(condition?: string) {
		await this.db.query(`DELETE FROM ${this.table} ${condition ? `WHERE ${condition}` : ""}`);
	}

	/**
	 * @param condition
	 * @param columns
	 * @example
	 * ```js
	 * await manager.select();
	 * await manager.select("name = 'Louis' OR level < 5");
	 * ```
	 */
	public async select(condition?: string): Promise<T[]> {
		return await this.db.query(
			`SELECT * FROM ${this.table} ${condition ? `WHERE ${condition}` : ""}`
		);
	}

	/**
	 * @param values
	 * @param condition
	 * @example
	 * ```js
	 * await manager.update({ "level": "5" }, "name = 'Louis'");
	 * ```
	 */
	public async update(values: Partial<T>, condition: string) {
		const updates = Object.keys(values)
			.map(key => {
				const value = (values as any)[key];
				return `${key} = ${value === null ? value : `'${value}'`}`;
			})
			.join(", ");

		await this.db.query(`UPDATE ${this.table} SET ${updates} WHERE ${condition}`);
	}
}

export default MySqlManager;
