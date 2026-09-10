import { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
	// @zh 输出静态导出产物，便于作为独立站点部署。
	// @en Output static export artifacts for deployment as a standalone site.
	// output: "export",
	distDir: "dist",
	// @zh pnpm monorepo 下 next 以符号链接指向仓库根目录的 .pnpm 虚拟仓库，
	// 需将 Turbopack root 指向仓库根目录，否则根目录之外的文件不会被解析（next/package.json 找不到）。
	// @en In the pnpm monorepo `next` is symlinked to the root `.pnpm` store, so the
	// Turbopack root must be the repo root; files outside the root are never resolved.
	turbopack: {
		root: path.resolve(__dirname, "../.."),
		// @zh 包名到本地源码的映射通过 tsconfig.json 的 paths 完成
		//（Turbopack 原生支持 tsconfig paths；resolveAlias 的绝对路径会被当作
		// server-relative 请求而解析失败）。
		// @en The package-name → local-source mapping lives in tsconfig.json `paths`,
		// which Turbopack supports natively. (resolveAlias treats absolute paths as
		// server-relative requests, which Turbopack cannot resolve.)
	},
};

export default nextConfig;
