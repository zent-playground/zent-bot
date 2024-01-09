import { context } from "esbuild";

const buildOptions = {
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: false,
	format: "esm",
	sourcemap: true,
};

(async () => {
	const result = await context(buildOptions);
	await result.watch();
})();
