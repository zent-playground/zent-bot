import { build } from "esbuild";
import { rm } from "fs/promises";

await rm("dist", { recursive: true }).catch(() => void 0);

await build({
	entryPoints: ["src/**/*.ts"],
	outdir: "dist",
	minify: false,
	format: "esm",
});
