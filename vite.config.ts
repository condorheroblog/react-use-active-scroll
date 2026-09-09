import { copyFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

const pkg = JSON.parse(
	readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
);

const banner = `/**
 * Name: ${pkg.name}
 * Version: ${pkg.version}
 * Author: ${pkg.author?.name ?? pkg.author}
 * Homepage: ${pkg.homepage}
 * License ${pkg.license} © 2026-Present
 */
`;

export default defineConfig({
	build: {
		emptyOutDir: true,

		lib: {
			entry: "src/index.ts",
			name: "react-use-active-scroll",
			formats: ["es", "cjs"],
			fileName: (format) => {
				if (format === 'es') return 'index.mjs'
				if (format === 'cjs') return 'index.cjs'
				return `index.${format}`
			}
		},
		rolldownOptions: {
			external: ["react"],
			output: {
				minify: {
					compress: {
						dropConsole: true,
					},
				},
				postBanner:banner,
			},
		},
	},
	plugins: [
		dts({
			bundleTypes: true,
			// @zh 不配置 outDirs：配合 bundleTypes 时它会让 .d.cts/.d.mts 变成路径引用而非内联类型，
			// 且引用的文件并不存在。依赖默认输出得到 index.d.mts，再在 afterBuild 中复制为 .d.cts。
			// @en Do not configure outDirs: with bundleTypes it would turn .d.cts/.d.mts into path references
			// instead of inlined types, and the referenced files do not exist. Rely on the default output to
			// produce index.d.mts, then copy it to .d.cts in afterBuild.
			afterBuild: () => {
				const dtsMts = fileURLToPath(new URL("./dist/index.d.mts", import.meta.url));
				const dtsCts = fileURLToPath(new URL("./dist/index.d.cts", import.meta.url));
				copyFileSync(dtsMts, dtsCts);
			},
		}),
	],
});
