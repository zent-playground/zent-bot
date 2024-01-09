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
	await rm("dist", { recursive: true, force: false }).catch(() => void 0);

	await build(buildOptions);
})();
