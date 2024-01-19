import { createPool, Pool } from "mysql2/promise";

interface MySqlConfig {
	host: string;
	port: number;
	user: string;
	database: string;
	password: string;
}

class MySql {
	private pool: Pool;

	constructor(config: MySqlConfig) {
		this.pool = createPool({
			host: config.host,
			port: config.port,
			user: config.user,
			database: config.database,
			password: config.password,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});
	}

	public async query(sql: string, params?: never[]): Promise<any> {
		const [rows] = await this.pool.query(sql, params);
		return rows;
	}

	public async ping(): Promise<number> {
		const start = Date.now();
		await this.query("SELECT 1");

		return Date.now() - start;
	}

	public async connect(): Promise<void> {
		await this.pool.getConnection();
	}

	public async close(): Promise<void> {
		await this.pool.end();
	}
}

export default MySql;
