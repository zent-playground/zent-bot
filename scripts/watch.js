// watch.js
import { build } from "esbuild";
import { rm } from "fs/promises";
import chalk from "chalk";

// Remove the 'dist' folder if it exists
rm("dist", { recursive: true, force: true })
	.catch(() => void 0)
	.then(() => {
		console.log(chalk.blue("Cleaned up the dist folder!"));

		build({
			entryPoints: ["src/**/*.ts"],
			outdir: "dist",
			minify: false,
			format: "esm",
			sourcemap: true,
			watch: {
				onRebuild(error) {
					if (error) console.error(chalk.red("Build failed:"), error);
					else console.log(chalk.green("Rebuild completed!"));
				},
			},
		});

		console.log(chalk.yellow("Watching for changes..."));
	});
