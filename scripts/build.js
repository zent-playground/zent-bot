import { build } from "esbuild";
import { rm } from "fs/promises";

const buildOptions = {
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: true,
	format: "esm",
	sourcemap: false,
};

(async () => {
	await rm("dist", { recursive: true, force: false }).catch(err => {
		throw err;
	});

	await build(buildOptions);
})();
