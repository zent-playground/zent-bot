import i18next, { InitOptions } from "i18next";
import HttpBackend from "i18next-http-backend";

import { init } from "./localizations.js";

const options: InitOptions = {
	lng: "en",
	fallbackLng: ["vi", "fr"],
	backend: {
		loadPath: "https://cdn.zent.lol/translations/bot/{{lng}}.json",
	},
};

await i18next.use(HttpBackend).init(options);

init();
