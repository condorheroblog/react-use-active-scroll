import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

/**
 * This config reproduces the bug.
 * With bundleTypes: true plus outDirs, unplugin-dts emits a single
 * declaration file per module format, but its content references
 * non-existent sibling .d.ts files instead of inlining the types.
 */
export default defineConfig({
	build: {
		emptyOutDir: true,
		lib: {
			entry: "src/index.ts",
			name: "TestDtsBundleRepro",
			formats: ["es", "cjs"],
			fileName: (format) => {
				if (format === "es") return "index.mjs";
				if (format === "cjs") return "index.cjs";
				return `index.${format}`;
			},
		},
		rollupOptions: {
			external: [],
		},
	},
	plugins: [
		dts({
			bundleTypes: true,
			outDirs: [
				{ dir: "dist", moduleFormat: "esm" },
				{ dir: "dist", moduleFormat: "cjs" },
			],
		}),
	],
});
