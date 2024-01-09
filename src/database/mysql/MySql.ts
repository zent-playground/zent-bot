import { createPool, Pool } from "mysql2/promise";
import Logger from "../../utils/Logger.js";

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

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this.pool.on("connection", () => Logger.Info("MySql connected."));
	}

	public async query(sql: string, params?: never[]): Promise<any> {
		try {
			const [rows] = await this.pool.query(sql, params);
			return rows;
		} catch (error) {
			Logger.Error("Query Error:", (error as Error).message);
		}
	}

	public async connect(): Promise<void> {
		await this.pool.getConnection();
	}

	public async close(): Promise<void> {
		await this.pool.end();
	}
}

export default MySql;
