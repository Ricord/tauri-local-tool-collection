[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$ForceSidecar
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ($env:OS -ne "Windows_NT") {
    throw "Windows 安装包必须在 Windows 10/11 或 windows-latest CI Runner 上构建。"
}

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

function Assert-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    if ($null -eq (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "未找到命令：$Name。请先按 README 安装 Windows 开发环境。"
    }
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Program,
        [Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments
    )
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "命令执行失败（退出码 $LASTEXITCODE）：$Program $($Arguments -join ' ')"
    }
}

Assert-Command "pnpm"
Assert-Command "cargo"
Assert-Command "rustc"

if (-not $SkipInstall) {
    Invoke-Checked "pnpm" "install" "--frozen-lockfile"
}

$SidecarScript = Join-Path $PSScriptRoot "build-python-sidecar.ps1"
if ($ForceSidecar) {
    & $SidecarScript -Force
} else {
    & $SidecarScript
}
if ($LASTEXITCODE -ne 0) {
    throw "Python Sidecar 构建失败。"
}

# Tauri 在 Windows 上会自动合并 src-tauri/tauri.windows.conf.json，
# 并将 tool-python-<target-triple>.exe 加入 NSIS 安装程序。
Invoke-Checked "pnpm" "tauri" "build"

$BundleDir = Join-Path $ProjectRoot "src-tauri\target\release\bundle\nsis"
$Installers = @(Get-ChildItem $BundleDir -Filter "*.exe" -ErrorAction SilentlyContinue)
if ($Installers.Count -eq 0) {
    throw "构建结束但未找到 NSIS 安装程序：$BundleDir"
}

Write-Host "Windows 安装程序构建成功：" -ForegroundColor Green
$Installers | ForEach-Object { Write-Host "  $($_.FullName)" }
