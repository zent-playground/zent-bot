const { env } = process;

const config = {
	colors: {
		default: 0xc8ad7f,
		error: 0xff6961,
		warn: 0xffcc00,
		success: 0x7abd7e,
	},
	emojis: {
		error: "<:ZentError:1203438354503434281>",
		warn: "<:ZentWarn:1203438406542168094>",
		success: "<:ZentSuccess:1203438311163559967>",
		bitrate: "<:ZentBitrate:1203436505352241223>",
		claim: "<:ZentClaim:1203437977066541116>",
		gaming: "<:ZentGaming:1203436782390222848>",
		ghost: "<:ZentGhost:1203436821376143370>",
		invite: "<:ZentInvite:1203437227569451118>",
		limit: "<:ZentLimit:1203438062143676466>",
		lock: "<:ZentLock:1203438183484751962>",
		name: "<:ZentName:1203438685761310770>",
		nsfw: "<:ZentNsfw:1203437399019880538>",
		permit: "<:ZentPermit:1204180099746766929>",
		rule: "<:ZentRule:1203438631205867592>",
		reject: "<:ZentReject:1204180146786148452>",
		settings: "<:ZentSettings:1203438464108994651>",
		text: "<:ZentText:1203437741698715689>",
		unghost: "<:ZentUnghost:1203437884489859122>",
		unlock: "<:ZentUnlock:1203438253428965417>",
	},
	images: {
		settings:
			"https://cdn.discordapp.com/attachments/1203447102076751972/1203447157684961332/Discord_settings.png?ex=65d12081&is=65beab81&hm=d2c47f0726f032c27701d77f699fd5e994e27f75e0f525a2d8eea82f2f409b3a&",
	},
	mysql: {
		host: env.MYSQL_HOST!,
		port: Number(env.MYSQL_PORT),
		user: env.MYSQL_USER!,
		database: env.MYSQL_DATABASE!,
		password: env.MYSQL_PASSWORD!,
	},
	redis: {
		host: env.REDIS_HOST!,
		port: Number(env.REDIS_PORT),
		user: env.REDIS_USER!,
		password: env.REDIS_PASSWORD!,
		prefix: env.NODE_ENV === "development" ? "dev" : "prod",
	},
	token: env.BOT_TOKEN!,
	sessionSecret: env.SESSION_SECRET!,
};

export default config;
