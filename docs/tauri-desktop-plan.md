# OpenCut Tauri 桌面化方案（Windows exe）

> 状态：方案评审稿，未实施任何代码改动。
> 目标：在**服务端继续以 Docker 运行**的前提下，用 Tauri 给现有 Next.js 前端套一个 Windows exe 入口。

---

## 一、结论先行

| 判断 | 说明 |
|---|---|
| 可行性 | **高**。核心编辑器 100% 前端本地运行，服务端仅承担 2 个边缘 API，Tauri 化几乎不触碰核心逻辑 |
| 推荐方案 | Tauri 2 + 前端静态化 + 保留 Docker 服务端（API 地址运行时可配置） |
| 主要工作量 | 集中在「Next.js 静态导出」这一项，其余为脚手架与打包 |
| 关键前提 | WebView2 运行时（Windows 通常已内置，可随包附带兜底） |

核心事实：本仓库的**视频编辑器（项目/时间线/素材/音效/字幕/预览）完全依赖浏览器本地能力**——IndexedDB + OPFS 存数据，`opencut-wasm` 渲染，`@huggingface/transformers` 本地 AI 转写。Docker 里的 Postgres/Redis/Next.js server **只服务于两个边缘功能**。因此「exe 只承载 UI、服务端继续 Docker」的目标与现状高度契合。

---

## 二、现状盘点（已核实）

### 2.1 前端入口
- `apps/web/`：Next.js 16.1.3（App Router），`bun dev:web` → `http://localhost:3000`
- 构建配置 `next.config.ts`：`output: "standalone"`（当前产出自包含 Node server）
- 部署目标：Cloudflare（`opennextjs-cloudflare` + `wrangler`）与 Docker 双通道

### 2.2 核心编辑器 = 纯前端本地
| 能力 | 实现 | 是否依赖服务端 |
|---|---|---|
| 项目/时间线/场景 | `src/services/storage/service.ts`（IndexedDB） | 否 |
| 素材文件 | `src/services/storage/opfs-adapter.ts`（OPFS） | 否 |
| 数据迁移 | `services/storage/migrations`（v0→v31） | 否 |
| 媒体时间计算/渲染 | `opencut-wasm`（Rust 编译 wasm） | 否 |
| 字幕转写 | `@huggingface/transformers`（浏览器本地推理） | 否 |
| 视频处理 | `mediabunny` | 否 |
| 编辑器页面 | `app/projects/page.tsx`、`app/editor/[project_id]/page.tsx` 均为 `"use client"` | 否 |

### 2.3 服务端（Docker）实际承担范围
`docker-compose.yml` 定义：`postgres:17`、`redis:7`、`hiett/serverless-redis-http`、Next.js standalone（`:3100`）。

- **Postgres**：仅一张表 `feedback`（`src/db/schema.ts`），用于用户反馈
- **Redis**：速率限制（`@upstash/ratelimit`）
- **API 路由仅 3 个**（`src/app/api/`）：
  - `/api/feedback` — 写 Postgres
  - `/api/health` — 健康检查
  - `/api/sounds/search` — 代理 Freesound API（因 key 保密）
- **前端 API 调用仅 2 处**：
  - `feedback/components/feedback-popover.tsx` → `/api/feedback`
  - `sounds/use-sound-search.ts`、`sounds/components/assets-view.tsx` → `/api/sounds/search`
- **无账户/登录系统**（`.env` 中 `BETTER_AUTH_SECRET` 为预留，代码未引用）
- **Marble CMS**（博客/changelog/landing 内容）：客户端经 `NEXT_PUBLIC_MARBLE_API_URL` 直连云端，不经过本地 Docker

### 2.4 Rust 核心
`rust/crates/{gpu, compositor, effects, masks, time, bridge}` + `rust/wasm`。桌面骨架 `apps/desktop`（GPUI 0.2.2）仅为占位，`main.rs` 只渲染标题，未接业务。

---

## 三、目标架构

```
┌───────────────────── opencut.exe (Tauri) ─────────────────────┐
│  WebView2（Edge Chromium）                                     │
│   └─ 加载静态化后的 Next.js 前端产物（本地 frontendDist）         │
│                                                                 │
│  Rust 后端（可选，后续接入 rust/crates 原生渲染提升预览性能）      │
└──────────────────────────────────────────────────────────────────┘
                          │  HTTPS（仅 2 个边缘 API）
                          ▼
┌───────────────────── Docker（保持不变）────────────────────────┐
│  Next.js standalone (:3100)  →  /api/feedback、/api/sounds/search│
│  Postgres :5432（feedback 表）    Redis :6379 + serverless-http   │
└──────────────────────────────────────────────────────────────────┘
                          │  HTTPS（客户端直连云端，不经本地）
                          ▼
                    Marble CMS（博客/更新日志内容）
```

**要点**：exe 内只放前端静态产物 + WebView 壳，不含 Node 运行时、不含数据库、不含 Redis。Docker 服务端职责不变。

---

## 四、技术路线选型

| 方案 | 做法 | 评价 |
|---|---|---|
| **A（主推）** | 前端 `output: "export"` 静态化；`/api/feedback`、`/api/sounds/search` 保留在 Docker，前端 API base URL 改为运行时可配置 | 严格满足「服务端继续 Docker、exe 只跑 UI」；体积最小；核心逻辑零改动 |
| B（备选） | 用 Tauri Rust command 重写这 2 个 API（feedback 本地/远程存储；sounds 由 Rust 调 Freesound，key 藏 exe） | exe 彻底离线、可不跑 Docker；但偏离既定前提，且需额外维护 Rust 端逻辑 |
| C（不推荐） | Tauri sidecar 内嵌 standalone Node server，WebView 指向 localhost | exe 内塞入 Node + server，违背「服务端独立」初衷，体积/复杂度上升 |

**结论：采用方案 A**。方案 B 作为后续「完全离线版」的可选演进，方案 C 排除。

---

## 五、实施步骤（分阶段）

### 阶段 0 — Tauri 脚手架 + 可运行验证
1. 新建 `apps/tauri/`（Tauri 2），**保留** `apps/desktop`（GPUI 骨架不动，二者并存，后续再取舍）。
2. 决策：是否加入根 `Cargo.toml` workspace。建议**独立 workspace**，避免 Tauri 重依赖拖慢根 workspace 全量编译。
3. 先用 `devUrl` 指向 `http://localhost:3000` 跑通 hello world，验证 WebView2 能正常加载页面与 `opencut-wasm`。

### 阶段 1 — 前端静态化（核心工作量）
1. `next.config.ts` 将 `output` 改为 `"export"`，`images.unoptimized = true`（静态导出不支持 next/image 优化）。
2. 处理服务端组件/动态路由：
   - `app/page.tsx`（landing，server component）与 blog/changelog 内容页：改为客户端 fetch Marble，或构建期 SSG 预渲染。
   - `app/editor/[project_id]/page.tsx`：动态路由需配置 `generateStaticParams` 或 `dynamicParams = true` 兜底。
3. 移除/改造 3 个 route handler（见阶段 2）。
4. 验证 `next build` 产物为纯静态 HTML/CSS/JS（无 Node server 依赖）。

### 阶段 2 — API 抽离 + 地址可配置
1. 新增前端运行时 API base 配置：`NEXT_PUBLIC_API_BASE_URL`（默认指向 Docker 服务端，如 `http://localhost:3100`）。
2. 改造两处调用点，把相对路径 `/api/...` 改为 `${API_BASE}/api/...`：
   - `feedback/components/feedback-popover.tsx`
   - `sounds/use-sound-search.ts`、`sounds/components/assets-view.tsx`
3. 服务端（Docker 的 Next.js）保留这 2 个 API，逻辑不动。

### 阶段 3 — Rust 侧接入
1. `tauri.conf.json` 的 `build.frontendDist` 指向静态产物目录。
2. 配置 CSP，允许本地资源 + 远程 API 域名（`connect-src` 需放行 Docker 服务端与 Marble 域名）。
3. （可选）将 `opencut-wasm` 替换为原生 `rust/crates/gpu`/`compositor`，通过 Tauri command 调用，提升预览/导出性能。

### 阶段 4 — 打包与签名
1. `tauri build` 产出 `.exe` + NSIS/MSI 安装器，配置图标、版本号。
2. 兜底检查 WebView2 Runtime：缺失时随安装器附带或引导安装。

### 阶段 5 — 验证清单
- [ ] 双击 exe 直接进入项目列表页
- [ ] 新建项目 → 导入素材（OPFS 落盘）→ 编辑 → 关闭重开数据不丢
- [ ] 字幕转写（本地 transformers）可用
- [ ] 音效搜索可返回结果（经 Docker `/api/sounds/search`）
- [ ] 反馈提交可写入（经 Docker `/api/feedback`）
- [ ] Docker 服务端关闭时，编辑器核心功能仍可用（除音效搜索/反馈）

---

## 六、关键技术决策点

1. **前端静态化 vs 内嵌 server**：本方案选静态化。代价是需逐个处理 server components 与动态路由，收益是 exe 纯净、无运行时。
2. **两 API 去向**：方案 A 保留在 Docker（改前端地址）；方案 B 下沉 Rust（彻底离线）。首期按 A 执行。
3. **Freesound key 保密**：A 方案下 key 仍在 Docker 服务端，安全；若将来走 B 方案，key 藏 exe 存在逆向风险，需权衡。
4. **WebView2 运行时**：Windows 10/11 多数已内置；发行时建议做缺失检测。
5. **OPFS/IndexedDB 持久化**：WebView2 数据目录需固定到 exe 侧（`dataDirectory`），避免清理浏览器缓存时误删项目数据。

---

## 七、风险与注意事项

| 风险 | 说明 | 应对 |
|---|---|---|
| server components 静态化工作量 | landing/blog/changelog 依赖服务端渲染或构建期数据 | 改为客户端 fetch Marble；内容页可在构建期预渲染 |
| 本地 AI 在 WebView2 的性能 | `@huggingface/transformers` wasm 推理较重 | WebView2 与 Chrome 内核一致，预期与浏览器持平；必要时下沉 Rust |
| OPFS 配额 | 素材文件占用本地磁盘，受浏览器配额约束 | WebView2 可放宽存储配额；后续可改 Rust 侧直写磁盘 |
| CSP 误拦 | 静态本地 + 远程 API 混合，需正确放行 | 阶段 3 显式配置 CSP |
| GPUI 骨架取舍 | `apps/desktop` 与 Tauri 并存，长期可能重复 | 本阶段并存不动，待 exe 稳定后再决定是否废弃 GPUI |

---

## 八、工作量估算（粗估，单人）

| 阶段 | 工作量 | 说明 |
|---|---|---|
| 0 脚手架 | 0.5 天 | Tauri 2 初始化 + devUrl 跑通 |
| 1 前端静态化 | 2–3 天 | 核心风险项，取决于 server components 数量 |
| 2 API 抽离 | 0.5–1 天 | 仅 2 处调用点 + 环境变量 |
| 3 Rust 接入 + CSP | 0.5–1 天 | 不含 wasm→原生下沉（另计） |
| 4 打包签名 | 0.5 天 | 含 WebView2 兜底 |
| **合计** | **4–6 天** | wasm→原生渲染下沉为可选扩展，另估 3–5 天 |
