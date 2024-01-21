import { build } from "esbuild";
import { replaceTscAliasPaths } from "tsc-alias";
import { rm } from "fs/promises";

await rm("dist", { recursive: true, force: false }).catch(() => void 0);

await build({
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: process.env.NODE_ENV !== "development",
	format: "esm",
	sourcemap: false,
});

await replaceTscAliasPaths({
	outDir: "dist"
});
