import i18next, { InitOptions } from "i18next";
import Backend, { FsBackendOptions } from "i18next-fs-backend";
import { init } from "./localizations.js";

const options: InitOptions & { backend: FsBackendOptions } = {
	lng: "en",
	fallbackLng: ["vi", "fr"],
	backend: {
		loadPath: "languages/{{lng}}.json",
		addPath: "languages/{{lng}}.json",
	}
};

await i18next.use(Backend).init(options);

init();
