const { env } = process as unknown as {
	env: {
		[x: string]: string;
	};
};

const config = {
	colors: {
		default: 0xc8ad7f,
		error: 0xff6961,
		success: 0x7abd7e,
	},
	mysql: {
		host: env.MYSQL_HOST,
		port: Number(env.MYSQL_PORT),
		user: env.MYSQL_USER,
		database: env.MYSQL_DATABASE,
		password: env.MYSQL_PASSWORD,
	},
	redis: {
		host: env.REDIS_HOST,
		port: Number(env.REDIS_PORT),
		user: env.REDIS_USER,
		password: env.REDIS_PASSWORD,
		prefix: env.NODE_ENV === "development" ? "dev" : "prod",
	},
	token: env.BOT_TOKEN,
	sessionSecret: env.SESSION_SECRET,
};

export default config;
