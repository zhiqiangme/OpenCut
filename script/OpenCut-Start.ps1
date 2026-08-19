# OpenCut 启动脚本（需 PowerShell 7 / pwsh 运行）
# 功能：启动 WSL2 数据库（PostgreSQL + Redis），再后台启动 Web 服务端（Next.js）
# 用法：pwsh .\script\OpenCut-Start.ps1
# 停止：pwsh .\script\OpenCut-Stop.ps1

$ErrorActionPreference = "Stop"

# 项目根目录（script 的上一级）
$root = Split-Path -Parent $PSScriptRoot

Write-Host "==> [1/2] 启动数据库 (WSL2: PostgreSQL + Redis)" -ForegroundColor Cyan
# 启动 WSL2 里的数据库服务（已在运行则无害跳过）
wsl -u root -e bash -lc "service postgresql start 2>/dev/null; service redis-server start 2>/dev/null" | Out-Null

# 校验数据库是否就绪
$redisPing = (wsl -u root -e bash -lc "redis-cli ping 2>/dev/null").Trim()
if ($redisPing -ne "PONG") {
    Write-Warning "Redis 未就绪，请检查 WSL2 环境（可手动运行：wsl -u root -e bash -lc 'service redis-server start'）"
} else {
    Write-Host "    PostgreSQL: 运行中" -ForegroundColor Green
    Write-Host "    Redis: PONG" -ForegroundColor Green
}

Write-Host "==> [2/2] 启动 Web 服务端 (bun dev:web)" -ForegroundColor Cyan

# 检测端口 3000 是否已被占用，避免重复启动
$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "    Web 服务端已在运行，访问 http://localhost:3000" -ForegroundColor Yellow
    exit 0
}

# 定位 bun 可执行文件（npm 全局装的 bun 通过 .cmd shim 指向真实 bun.exe，需解析真实路径）
$bunExe = $null
$bunCmd = Get-Command bun.cmd -ErrorAction SilentlyContinue
if ($bunCmd) {
    $candidate = Join-Path (Split-Path -Parent $bunCmd.Source) "node_modules\bun\bin\bun.exe"
    if (Test-Path $candidate) { $bunExe = $candidate }
}
if (-not $bunExe) {
    $bunExe = (Get-Command bun.exe -ErrorAction SilentlyContinue).Source
}
if (-not $bunExe -or -not (Test-Path $bunExe)) {
    throw "未找到 bun 可执行文件，请先安装：npm install -g bun"
}

# 日志写入 .workbuddy 目录，便于排查
$logDir = Join-Path $root ".workbuddy"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$outLog = Join-Path $logDir "dev-server.log"
$errLog = Join-Path $logDir "dev-server.err.log"

# 后台启动 dev server，输出/错误重定向到日志文件
$proc = Start-Process -FilePath $bunExe `
    -ArgumentList "dev:web" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -PassThru

# 记录 PID，供停止脚本精确终止进程树
$pidFile = Join-Path $PSScriptRoot ".dev-server.pid"
$proc.Id | Set-Content -Path $pidFile -Encoding ascii

Write-Host "    dev server 已后台启动 (PID $($proc.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "启动完成！访问 http://localhost:3000" -ForegroundColor Green
Write-Host "停止程序：pwsh .\script\OpenCut-Stop.ps1"
