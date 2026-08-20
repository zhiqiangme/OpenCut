# OpenCut 启动脚本（需 PowerShell 7 / pwsh 运行）
# 功能：启动 Docker 后端（PostgreSQL + Redis + Upstash REST API），再后台启动 Web 服务端（Next.js）
# 用法：pwsh .\script\OpenCut-Start.ps1
# 停止：pwsh .\script\OpenCut-Stop.ps1

$ErrorActionPreference = "Stop"

# 项目根目录（script 的上一级）
$root = Split-Path -Parent $PSScriptRoot

Write-Host "==> [1/2] 启动后端服务 (Docker: PostgreSQL + Redis + Upstash REST API)" -ForegroundColor Cyan

# 定位 docker 命令（per-user 安装已在用户 PATH，这里显式兜底防止 PATH 未刷新）
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $dockerBin = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin"
    if (Test-Path (Join-Path $dockerBin "docker.exe")) {
        $env:PATH = "$dockerBin;$env:PATH"
    } else {
        Write-Warning "未找到 docker，请先安装 Docker Desktop"
        Start-Sleep -Seconds 5
        exit 1
    }
}

# 检查 Docker daemon 是否运行，未运行则拉起 Docker Desktop 并等待就绪
$daemonReady = $false
docker info *> $null
if ($LASTEXITCODE -eq 0) {
    $daemonReady = $true
} else {
    Write-Host "    Docker Desktop 未运行，正在启动..." -ForegroundColor Yellow
    $ddExe = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\Docker Desktop.exe"
    if (Test-Path $ddExe) { Start-Process $ddExe }
    # 等待 daemon 就绪（最多 80 秒）
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 2
        docker info *> $null
        if ($LASTEXITCODE -eq 0) { $daemonReady = $true; break }
    }
    if (-not $daemonReady) {
        Write-Warning "Docker Desktop 启动超时，请手动启动后重试"
        Start-Sleep -Seconds 5
        exit 1
    }
}

# 启动后端容器（幂等：已在运行则跳过；首次会拉取镜像）
docker compose up -d db redis serverless-redis-http *> $null

# 等待后端就绪：轮询 8079 端口（serverless-redis-http 就绪即说明 redis 链路正常）
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $conn8079 = Get-NetTCPConnection -LocalPort 8079 -State Listen -ErrorAction SilentlyContinue
    if ($conn8079) { $backendReady = $true; break }
}

if ($backendReady) {
    Write-Host "    PostgreSQL (docker): 运行中" -ForegroundColor Green
    Write-Host "    Redis (docker): 运行中" -ForegroundColor Green
    Write-Host "    Upstash REST API (8079): 就绪" -ForegroundColor Green
} else {
    Write-Warning "后端服务启动异常，请运行 docker compose ps 检查"
}

Write-Host "==> [2/2] 启动 Web 服务端 (bun dev:web)" -ForegroundColor Cyan

# 检测端口 3000 是否已被占用，避免重复启动
$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "    Web 服务端已在运行" -ForegroundColor Yellow
    # 已运行时直接打开浏览器
    Start-Process "http://localhost:3000"
    Write-Host "已在浏览器打开 http://localhost:3000" -ForegroundColor Green
    # 3 秒后窗口自动关闭
    Start-Sleep -Seconds 3
    exit 0
}

# 定位 bun 可执行文件
# 优先级：~/.bun/bin（独立持久位置，不依赖 PATH）> PATH 中 bun.cmd shim 解析 > bun.exe
$bunExe = $null
$localBun = Join-Path $HOME ".bun\bin\bun.exe"
if (Test-Path $localBun) {
    $bunExe = $localBun
} else {
    $bunCmd = Get-Command bun.cmd -ErrorAction SilentlyContinue
    if ($bunCmd) {
        $candidate = Join-Path (Split-Path -Parent $bunCmd.Source) "node_modules\bun\bin\bun.exe"
        if (Test-Path $candidate) { $bunExe = $candidate }
    }
    if (-not $bunExe) {
        $bunExe = (Get-Command bun.exe -ErrorAction SilentlyContinue).Source
    }
}
if (-not $bunExe -or -not (Test-Path $bunExe)) {
    throw "未找到 bun 可执行文件，请先安装：npm install -g bun"
}

# 关键：把 bun 所在目录注入 PATH
# dev:web 实际执行 `turbo run dev`，而 package.json 的 packageManager 指定了 bun
# turbo 需要通过 PATH 查找 bun 二进制，否则报 "Unable to find package manager binary"
# 双击快捷方式的干净环境里没有 ~/.bun/bin，必须手动注入
$bunDir = Split-Path -Parent $bunExe
if ($env:PATH -notlike "*$bunDir*") {
    $env:PATH = "$bunDir;$env:PATH"
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

# 等待 dev server 就绪（轮询端口 3000，最多 30 秒）
Write-Host "    等待服务就绪..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $ready = $true; break }
}

if ($ready) {
    Write-Host "    服务已就绪" -ForegroundColor Green
    # 自动用默认浏览器打开
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "启动完成！已在浏览器打开 http://localhost:3000" -ForegroundColor Green
    Write-Host "停止程序：pwsh .\script\OpenCut-Stop.ps1"
    # 3 秒后窗口自动关闭
    Start-Sleep -Seconds 3
} else {
    Write-Warning "dev server 启动超时，请检查日志 $logDir\dev-server.log"
    Start-Sleep -Seconds 5
}
