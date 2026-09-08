import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { codeInspectorPlugin } from "code-inspector-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite 演示应用配置。
 * 仅负责把 React + React Router 应用打包为静态站点，与根目录库构建无关。
 */
export default defineConfig({
	plugins: [codeInspectorPlugin({ bundler: "vite" }), react(), tailwindcss()],
	base: "/react-use-active-scroll/",
	resolve: {
		alias: {
			// 将包名映射到本地源码，避免演示项目依赖已构建产物。
			"react-use-active-scroll": path.resolve(__dirname, "../../src"),
		},
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
});
