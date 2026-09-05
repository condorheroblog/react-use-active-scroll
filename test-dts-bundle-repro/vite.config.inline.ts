import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

/**
 * This config demonstrates the expected behavior.
 * With bundleTypes: true only, unplugin-dts inlines all referenced
 * types into a single declaration file.
 */
export default defineConfig({
	build: {
		emptyOutDir: true,
		// Force this baseline config to emit into its own directory so we can
		// diff it against the buggy outDirs config side-by-side.
		outDir: "dist-inline",
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
		}),
	],
});
