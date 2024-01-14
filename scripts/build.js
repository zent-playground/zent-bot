import { build } from "esbuild";
import { rm } from "fs/promises";

const buildOptions = {
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: process.env.NODE_ENV !== "development",
	format: "esm",
	sourcemap: false,
};

await rm("dist", { recursive: true, force: false }).catch(() => void 0);
await build(buildOptions);
