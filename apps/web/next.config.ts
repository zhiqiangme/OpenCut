import type { NextConfig } from "next";
import path from "path";
import { withBotId } from "botid/next/config";
import { withContentCollections } from "@content-collections/next";

// 桌面端静态导出模式：NEXT_EXPORT=1 时产出纯静态产物供 Tauri 打包
// （Docker 服务端仍用默认 standalone，二者共享同一份代码、不同构建模式）
const isExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	reactStrictMode: true,
	productionBrowserSourceMaps: true,
	// Docker 服务端 standalone；桌面端（Tauri）静态导出
	output: isExport ? "export" : "standalone",
	// monorepo 下必须指定追踪根，否则 standalone 产物无法正确追踪 bun 符号链接依赖
	outputFileTracingRoot: path.join(__dirname, "../../"),
	// 关闭 Next.js 16 内置的 DevTools 浮窗（左下角 N 图标 + 完整面板）
	devIndicators: false,
	images: {
		// 静态导出不支持 next/image 服务端优化，必须关闭
		unoptimized: isExport,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "plus.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "images.marblecms.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "api.iconify.design",
			},
			{
				protocol: "https",
				hostname: "api.simplesvg.com",
			},
			{
				protocol: "https",
				hostname: "api.unisvg.com",
			},
			{
				protocol: "https",
				hostname: "cdn.brandfetch.io",
			},
		],
	},
	// webpack 构建器专用配置（Turbopack 忽略此配置；仅在 `next build --webpack` 时生效）
	webpack: (config, { isServer }) => {
		if (isServer) {
			// server 端不加载 opencut-wasm（其模块顶层 import .wasm，SSR prerender 会失败），
			// 替换为纯计算 stub（时间/时间码等价实现，GPU 函数空实现）
			config.resolve.alias = {
				...config.resolve.alias,
				"opencut-wasm": path.resolve(
					__dirname,
					"src/wasm/opencut-wasm-stub.ts",
				),
			};
		} else {
			// client 端启用 WebAssembly 支持（opencut-wasm 的 .wasm 文件）
			config.experiments = {
				...config.experiments,
				asyncWebAssembly: true,
			};
		}
		return config;
	},
};

export default withContentCollections(withBotId(nextConfig));
