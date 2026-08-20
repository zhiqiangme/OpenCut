# OpenCut 停止脚本（需 PowerShell 7 / pwsh 运行）
# 功能：停止 Web 服务端（Next.js，端口 3000）和 Docker 后端（PostgreSQL + Redis + Upstash REST API）
# 用法：pwsh .\script\OpenCut-Stop.ps1

$ErrorActionPreference = "Stop"

try {
    Write-Host "==> [1/2] 停止 Web 服务端 (端口 3000)" -ForegroundColor Cyan

    # 优先按记录的 PID 精确终止进程树（bun -> turbo -> next 整条链）
    $killed = $false
    $pidFile = Join-Path $PSScriptRoot ".dev-server.pid"
    if (Test-Path $pidFile) {
        $devPid = (Get-Content $pidFile).Trim()
        if ($devPid -match '^\d+$') {
            Write-Host "    终止 dev server 进程树 (PID $devPid)"
            taskkill /PID $devPid /T /F 2>$null | Out-Null
            $killed = $true
        }
        Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
    }

    # 兜底：清理仍在监听 3000 端口的进程（防止 PID 文件缺失或进程残留）
    $conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $procIds) {
            Write-Host "    清理残留进程 (PID $procId)"
            taskkill /PID $procId /T /F 2>$null | Out-Null
        }
    } elseif (-not $killed) {
        Write-Host "    Web 服务端未在运行"
    } else {
        Write-Host "    Web 服务端已停止"
    }

    Write-Host "==> [2/2] 停止后端服务 (Docker)" -ForegroundColor Cyan
    # 定位 docker（与启动脚本一致，兜底 per-user 安装路径）
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        $dockerBin = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin"
        if (Test-Path (Join-Path $dockerBin "docker.exe")) {
            $env:PATH = "$dockerBin;$env:PATH"
        }
    }
    # 停止后端容器（保留数据卷，下次启动可恢复；未运行则无害跳过）
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        docker compose stop db redis serverless-redis-http *> $null
        Write-Host "    PostgreSQL + Redis + Upstash REST API 已停止"
    } else {
        Write-Host "    docker 不可用，跳过" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "停止完成" -ForegroundColor Green
    # 无报错：2 秒后窗口自动关闭
    Start-Sleep -Seconds 2
} catch {
    Write-Host ""
    Write-Error "停止过程出错：$($_.Exception.Message)"
    Write-Host "窗口保持 15 秒以便查看错误..."
    Start-Sleep -Seconds 15
    exit 1
}
