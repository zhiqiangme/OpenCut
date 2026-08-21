# 修复 Next.js standalone 产物在 Windows 上的符号链接问题
# 背景：nft 在 Windows 复制 bun 的目录符号链接时丢失「Directory」属性（变成 Archive），
# 导致 bun/node 读取时报 EPERM。此脚本将 standalone/node_modules 下的符号链接全部
# 展开为实际内容（复制目标），使其可被 bun 正常运行。
param(
    [string]$StandaloneRoot = "D:\Portable\Video_Cut\apps\web\.next\standalone"
)

$ErrorActionPreference = "Stop"
$links = Get-ChildItem $StandaloneRoot -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.LinkType }

Write-Output "发现符号链接 $($links.Count) 个，开始展开..."

$count = 0
foreach ($link in $links) {
    $linkPath = $link.FullName
    $target = $link.LinkTarget
    if ([string]::IsNullOrEmpty($target)) {
        Write-Warning "目标为空，跳过: $linkPath"
        continue
    }
    $isDir = [bool]($link.Attributes -band [IO.FileAttributes]::Directory)

    # 解析目标路径（相对路径基于符号链接所在目录）
    $parentDir = Split-Path $linkPath -Parent
    $targetPath = if ([IO.Path]::IsPathRooted($target)) {
        $target
    } else {
        [IO.Path]::GetFullPath((Join-Path $parentDir $target))
    }

    if (-not (Test-Path $targetPath)) {
        Write-Warning "目标不存在，跳过: $linkPath -> $target"
        continue
    }

    Remove-Item $linkPath -Force
    if ($isDir) {
        Copy-Item $targetPath $linkPath -Recurse
    } else {
        Copy-Item $targetPath $linkPath
    }
    $count++
}

Write-Output "已展开 $count 个符号链接"

# 通用补全：nft 追踪 bun 依赖不完整（很多包只复制了 package.json），从源 .bun 复制完整内容
Write-Output "通用补全 .bun 依赖..."
$bunRoot = Join-Path $StandaloneRoot "node_modules\.bun"
$bunSrcRoot = "D:\Portable\Video_Cut\node_modules\.bun"
$fixedCount = 0
if (Test-Path $bunRoot) {
    Get-ChildItem $bunRoot -Directory | ForEach-Object {
        $depName = $_.Name
        $srcDep = Join-Path $bunSrcRoot $depName
        if (Test-Path $srcDep) {
            $srcNm = Join-Path $srcDep "node_modules"
            $dstNm = Join-Path $_.FullName "node_modules"
            if (Test-Path $srcNm) {
                Get-ChildItem $srcNm | ForEach-Object {
                    $pkgName = $_.Name
                    $srcPkg = Join-Path $srcNm $pkgName
                    $dstPkg = Join-Path $dstNm $pkgName
                    if ((Test-Path $srcPkg) -and (Test-Path $dstPkg)) {
                        Copy-Item "$srcPkg\*" $dstPkg -Recurse -Force -ErrorAction SilentlyContinue
                        $fixedCount++
                    }
                }
            }
        }
    }
}
Write-Output "  通用补全 $fixedCount 个包"

# 通用扁平化：把 .bun 里所有实际包内容复制到顶层 node_modules
# 展开 next 等符号链接后，其依赖（在 .bun 同级）向上查找需要顶层有实际内容
Write-Output "扁平化依赖到顶层 node_modules..."
$flatCount = 0
Get-ChildItem $bunRoot -Directory | ForEach-Object {
    $depNodeModules = Join-Path $_.FullName "node_modules"
    if (Test-Path $depNodeModules) {
        Get-ChildItem $depNodeModules | ForEach-Object {
            $pkgName = $_.Name
            $dst = Join-Path $StandaloneRoot "node_modules\$pkgName"
            # 合并复制（scoped 包如 @next 会合并到已有 @next 目录）
            Copy-Item $_.FullName $dst -Recurse -Force -ErrorAction SilentlyContinue
            $flatCount++
        }
    }
}
Write-Output "  扁平化处理 $flatCount 个包"
