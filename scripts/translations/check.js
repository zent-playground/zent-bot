import { glob } from "glob";
import { readFileSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

const _dirname = dirname(fileURLToPath(import.meta.url));
const path = join(_dirname, "..", "..", "translations").replace(/\\/g, "/");

const fetchWithRetry = async (url, retries = 3) => {
	while (retries > 0) {
		try {
			const response = await fetch(url);

			if (response.ok) {
				return await response.json();
			}
		} catch (error) {
			console.error(`Fetch error for ${url}: ${error.message}`);
		}

		retries--;
	}

	throw new Error(`Failed to fetch ${url} after multiple attempts.`);
};

const checkTranslationFiles = async () => {
	const files = await glob(`${path}/*.json`);
	const errors = [];

	for (const file of files) {
		const name = basename(file);
		const localFile = JSON.parse(readFileSync(file, "utf-8"));
		const cdnFileUrl = `https://cdn.zent.lol/translations/bot/${name}`;

		try {
			const cdnFile = await fetchWithRetry(cdnFileUrl);

			if (localFile.updated !== cdnFile.updated) {
				errors.push(`The file ${name} is not synchronized with the CDN.`);
			}
		} catch (error) {
			errors.push(error.message);
		}
	}

	if (errors.length > 0) {
		errors.forEach((error) => console.error(error));
		throw new Error("There were errors checking translation files.");
	} else {
		console.log("All translation files are synchronized.");
	}
};

try {
	await checkTranslationFiles();
} catch (error) {
	console.error("Error in checkTranslationFiles:", error.message);
}
