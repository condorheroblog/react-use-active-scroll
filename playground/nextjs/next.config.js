const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// 输出静态导出产物，便于作为独立站点部署。
	output: "export",
	distDir: "dist",
	// 避免 Next.js 把外层仓库根目录误判为 workspace root。
	outputFileTracingRoot: __dirname,
	// 演示项目不强制安装 ESLint，构建时跳过 ESLint 检查。
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		// 将包名映射到本地源码，开发时无需先构建根目录包。
		config.resolve.alias["react-use-active-scroll"] = path.resolve(
			__dirname,
			"../../src",
		);
		return config;
	},
};

module.exports = nextConfig;
