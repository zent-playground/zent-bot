import i18next from "i18next";
import { Collection } from "discord.js";

export interface Localization {
	names: { [x: string]: string };
	descriptions: { [x: string]: string };
	options: { [x: string]: Localization };
}

const localizations = new Collection<string, Localization>();

function init() {
	for (const k of Object.keys(i18next.store.data)) {
		const { commands } = i18next.store.data[k]["translation"] as any;

		for (const name of Object.keys(commands)) {
			const { data } = commands[name];

			if (!data) {
				continue;
			}

			let command = localizations.get(name);

			if (!command) {
				command = { names: {}, descriptions: {}, options: {} };
				localizations.set(name, command);
			}

			if (data.name) {
				command.names[k] = data.name;
			}

			if (data.description) {
				command.descriptions[k] = data.description;
			}

			initOptions(command.options, data.options, k);
		}
	}
}

function initOptions(entry: Localization["options"], data: any, lang: string) {
	if (!data) return;

	for (const k of Object.keys(data || {})) {
		const { name, description, options } = data[k];

		entry[k] = entry[k] || {
			names: {},
			descriptions: {},
			options: {},
		};

		if (name) {
			entry[k].names[lang] = name;
		}

		if (description) {
			entry[k].descriptions[lang] = description;
		}

		if (options && Object.keys(options).length) {
			initOptions(entry[k].options, options, lang);
		}
	}
}

export { localizations, init };
