const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// @zh 输出静态导出产物，便于作为独立站点部署。
	// @en Output static export artifacts for deployment as a standalone site.
	output: "export",
	distDir: "dist",
	// @zh 避免 Next.js 把外层仓库根目录误判为 workspace root。
	// @en Prevent Next.js from mistaking the outer repo root as the workspace root.
	outputFileTracingRoot: __dirname,
	// @zh 演示项目不强制安装 ESLint，构建时跳过 ESLint 检查。
	// @en The demo does not require ESLint; skip ESLint checks during build.
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		// @zh 将包名映射到本地源码，开发时无需先构建根目录包。
		// @en Map the package name to local source so no pre-built root package is needed in dev.
		config.resolve.alias["react-use-active-scroll"] = path.resolve(
			__dirname,
			"../../src",
		);
		return config;
	},
};

module.exports = nextConfig;
