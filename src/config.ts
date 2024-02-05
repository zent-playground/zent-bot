const { env } = process as unknown as {
	env: {
		[x: string]: string;
	};
};

const config = {
	colors: {
		default: 0xc8ad7f,
		error: 0xff6961,
		warn: 0xffcc00,
		success: 0x7abd7e,
	},
	emojis: {
		error: "<:zent_error:1202351007116566629>",
		warn: "<:zent_warn:1202351050003324928>",
		success: "<:zent_success:1202350909888405504>",
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
