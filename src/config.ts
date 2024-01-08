const config = {
	mysql: {
		host: process.env.MYSQL_HOST,
		port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
		user: process.env.MYSQL_USER,
		database: process.env.MYSQL_DATABASE,
		password: process.env.MYSQL_PASSWORD,
	},
	redis: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
	},
	token: process.env.BOT_TOKEN!,
};

export default config;
