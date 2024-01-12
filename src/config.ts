const config = {
	colors: {
		default: 0xc8ad7f,
		error: 0xff6961,
		success: 0x7abd7e,
	},
	mysql: {
		host: process.env.MYSQL_HOST!,
		port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
		user: process.env.MYSQL_USER!,
		database: process.env.MYSQL_DATABASE!,
		password: process.env.MYSQL_PASSWORD!,
	},
	redis: {
		host: process.env.REDIS_HOST!,
		port: Number(process.env.REDIS_PORT),
		user: process.env.REDIS_USER!,
		password: process.env.REDIS_PASSWORD!,
		prefix: process.env.REDIS_PREFIX!,
	},
	token: process.env.BOT_TOKEN!,
};

export default config;
