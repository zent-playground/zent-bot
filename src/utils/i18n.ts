import i18next from "i18next";
import Backend from "i18next-fs-backend";

await i18next.use(Backend).init({
	fallbackLng: "en",
	backend: {
		loadPath: "../../languages/{{lng}}.json",
	},
});

abstract class Translator {
	public static Lng: string = "en";

	public static Text(key: string, options: any = {}): string {
		return i18next.t(key, { ...options, lng: Translator.Lng }) as string;
	}
}

export { Translator };
// export default i18next
