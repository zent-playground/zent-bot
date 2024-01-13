import i18next from "i18next";
import { Collection } from "discord.js";

export interface Localization {
	names: Record<string, string>;
	descriptions: Record<string, string>;
	options: Record<string, Localization>;
}

interface CommandData {
	[key: string]: any;
}

const localizations = new Collection<string, Localization>();

const initLocalization = () => {
	Object.keys(i18next.store.data).forEach(lang => {
		const commands: Record<string, { data?: CommandData }> = (i18next.store.data[lang]["translation"] as any).interactions || {};

		Object.entries(commands).forEach(([name, { data }]) => {
			if (!data) return;

			const command = localizations.get(name) ?? { names: {}, descriptions: {}, options: {} };
			localizations.set(name, command);

			command.names[lang] = data.name ?? command.names[lang];
			command.descriptions[lang] = data.description ?? command.descriptions[lang];

			initOptions(command.options, data.options, lang);
		});
	});
};

const initOptions = (entry: Record<string, Localization>, data: CommandData, lang: string) => {
	if (!data) return;

	Object.entries(data).forEach(([key, { name, description, options }]) => {
		const option = entry[key] ?? { names: {}, descriptions: {}, options: {} };
		entry[key] = option;

		option.names[lang] = name ?? option.names[lang];
		option.descriptions[lang] = description ?? option.descriptions[lang];

		if (options) {
			initOptions(option.options, options, lang);
		}
	});
};

export { localizations, initLocalization as init };
