# OpenCut 桌面端完整构建脚本
# 串联：Next.js standalone 构建 → 复制 static/public → 展开符号链接 → Tauri 打包
$ErrorActionPreference = "Stop"

$root = "D:\Portable\Video_Cut"
$web = Join-Path $root "apps\web"
$tauri = Join-Path $root "apps\tauri"

# 1. Next.js standalone 构建
Write-Host "=== 1. Next.js standalone 构建 ===" -ForegroundColor Cyan
Set-Location $web
bun run build
if ($LASTEXITCODE -ne 0) { throw "Next.js 构建失败" }

# 2. 复制 static/public 到 standalone
Write-Host "=== 2. 复制 static/public ===" -ForegroundColor Cyan
$standaloneWeb = Join-Path $web ".next\standalone\apps\web"
Copy-Item (Join-Path $web ".next\static") (Join-Path $standaloneWeb ".next\static") -Recurse -Force
Copy-Item (Join-Path $web "public") (Join-Path $standaloneWeb "public") -Recurse -Force

# 3. 展开符号链接（修复 Windows 下 bun 符号链接的 nft 追踪问题）
Write-Host "=== 3. 展开符号链接 ===" -ForegroundColor Cyan
& (Join-Path $web "scripts\fix-standalone-symlinks.ps1")

# 3.5. 复制 standalone 到 src-tauri/standalone（resources 打包用，避免 .next 隐藏目录被 glob 忽略）
Write-Host "=== 3.5. 复制 standalone 到 src-tauri ===" -ForegroundColor Cyan
$standaloneOut = Join-Path $tauri "src-tauri\standalone"
if (Test-Path $standaloneOut) { Remove-Item $standaloneOut -Recurse -Force }
New-Item -ItemType Directory -Path $standaloneOut | Out-Null
robocopy (Join-Path $web ".next\standalone") $standaloneOut /E /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "复制 standalone 失败（robocopy 退出码 $LASTEXITCODE）" }

# 4. Tauri 打包
Write-Host "=== 4. Tauri 打包 ===" -ForegroundColor Cyan
Set-Location $tauri
$env:PATH = "C:\Users\Mydei\.rustup\toolchains\stable-x86_64-pc-windows-msvc\bin;$env:PATH"
& (Join-Path $tauri "node_modules\.bin\tauri.exe") build
if ($LASTEXITCODE -ne 0) { throw "Tauri 打包失败" }

Write-Host "=== 构建完成 ===" -ForegroundColor Green
