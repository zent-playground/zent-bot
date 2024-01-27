import readline from "readline";
import { glob } from "glob";
import { readFileSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

const _dirname = dirname(fileURLToPath(import.meta.url));
const path = join(_dirname, "..", "..", "translations").replace(/\\/g, "/");

const askUser = (question) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
};

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

const mergeJsonFiles = async () => {
	const files = await glob(`${path}/*.json`);
	const errors = [];

	const customMerge = async (key, x, y) => {
		if (x === y) {
			return x;
		}

		console.warn(`Conflict detected for key '${key}': `, x, y);
		const answer = await askUser(
			`Choose a value for '${key}' (1: ${x}, 2: ${y}, 3: enter a new value): `,
		);
		switch (answer) {
			case "1":
				return x;
			case "2":
				return y;
			case "3":
				return await askUser(`Enter the new value for '${key}': `);
			default:
				return x;
		}
	};

	const mergeDeep = async (obj1, obj2) => {
		const result = {};
		for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
			if (
				obj1[key] &&
				obj2[key] &&
				typeof obj1[key] === "object" &&
				typeof obj2[key] === "object"
			) {
				result[key] = await mergeDeep(obj1[key], obj2[key]);
			} else if (obj2[key] && !obj1[key]) {
				result[key] = obj2[key];
			} else if (!obj2[key] && obj1[key]) {
				result[key] = obj1[key];
			} else {
				result[key] = await customMerge(key, obj1[key], obj2[key]);
			}
		}
	};

	for (const file of files) {
		const name = basename(file);
		const localFile = JSON.parse(readFileSync(file, "utf-8"));
		const cdnFileUrl = `https://cdn.zent.lol/translations/bot/${name}`;

		try {
			const cdnFile = await fetchWithRetry(cdnFileUrl);
			await mergeDeep(localFile, cdnFile);
		} catch (error) {
			errors.push(error.message);
		}
	}

	if (errors.length > 0) {
		errors.forEach((error) => console.error(error));
		throw new Error("There were errors merging translation files.");
	} else {
		console.log("All translation files are merged.");
	}
};

try {
	await mergeJsonFiles();
} catch (error) {
	console.error("Error in mergeJsonFiles:", error.message);
}
