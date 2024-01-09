import { context } from "esbuild";

const buildOptions = {
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: false,
	format: "esm",
	sourcemap: true,
};

await context(buildOptions).then((ctx) => ctx.watch());
