// 静态导出构建脚本（供 Tauri 打包使用）
// 说明：`output: "export"` 不支持服务端 route handler（POST / 读取请求的 GET）。
// 本项目 `src/app/api`（feedback/health/sounds-search）与 `rss.xml` 属于服务端专用，
// 仅在 Docker standalone 构建时参与。这里在 export 构建前将其移出 app 目录（Next.js
// 会扫描 app 下所有含 route.ts 的目录，重命名目录无效，必须移出 app），构建后恢复。
import { renameSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const appDir = join(webRoot, "src", "app");
// app 目录外的临时存放位置，Next.js 不会扫描
const disabledDir = join(webRoot, "src", ".export-disabled");

// 需要在静态导出时临时移出的服务端/SEO 路由（相对 src/app 的路径）
const ROUTES_TO_DISABLE = ["api", "rss.xml", "sitemap.ts", "robots.ts"];

/** 记录被移走的路径，用于 finally 恢复 */
const moved = [];

function disable() {
	for (const route of ROUTES_TO_DISABLE) {
		const src = join(appDir, route);
		const dst = join(disabledDir, route);
		// 清理历史残留：若上次构建异常中断，先恢复
		if (existsSync(dst) && !existsSync(src)) {
			renameSync(dst, src);
		}
		if (existsSync(src) && !existsSync(dst)) {
			mkdirSync(dirname(dst), { recursive: true });
			renameSync(src, dst);
			moved.push({ src, dst });
		}
	}
}

function restore() {
	for (const { src, dst } of moved) {
		if (existsSync(dst) && !existsSync(src)) {
			renameSync(dst, src);
		}
	}
}

try {
	disable();
	// 使用 webpack 构建器：Turbopack 在 output:export 下存在 _global-error prerender 回归 bug
	execSync("next build --webpack", {
		stdio: "inherit",
		cwd: webRoot,
		env: { ...process.env, NEXT_EXPORT: "1" },
	});
} finally {
	restore();
}
