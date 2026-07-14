[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$env:PYTHONUTF8 = "1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Runner = Join-Path $ProjectRoot "src-python\tool_runner.py"
$Requirements = Join-Path $ProjectRoot "src-python\requirements-build.txt"
$VenvDir = Join-Path $ProjectRoot ".venv-windows"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$BuildRoot = Join-Path $ProjectRoot "build\python-sidecar"
$DistDir = Join-Path $BuildRoot "dist"
$WorkDir = Join-Path $BuildRoot "work"
$SpecDir = Join-Path $BuildRoot "spec"
$BinariesDir = Join-Path $ProjectRoot "src-tauri\binaries"

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

if (-not (Test-Path $Runner)) {
    throw "找不到 Python Sidecar 入口：$Runner"
}
if (-not (Test-Path $Requirements)) {
    throw "找不到 Python 构建依赖文件：$Requirements"
}
if ($null -eq (Get-Command rustc -ErrorAction SilentlyContinue)) {
    throw "未找到 rustc。请安装 Rust MSVC 工具链：https://rustup.rs/"
}

$VerboseVersion = (& rustc -vV | Out-String)
if ($LASTEXITCODE -ne 0) {
    throw "无法读取 Rust 工具链信息。"
}
$HostLine = ($VerboseVersion -split "`r?`n" | Where-Object { $_ -like "host:*" } | Select-Object -First 1)
if ([string]::IsNullOrWhiteSpace($HostLine)) {
    throw "rustc -vV 未返回 host 目标三元组。"
}
$TargetTriple = ($HostLine -replace "^host:\s*", "").Trim()
if ($TargetTriple -notmatch "windows-msvc$") {
    throw "此脚本需要 Windows MSVC Rust 工具链，当前目标为：$TargetTriple"
}

$OutputBinary = Join-Path $BinariesDir "tool-python-$TargetTriple.exe"
$SourceFiles = Get-ChildItem (Join-Path $ProjectRoot "src-python") -File | Where-Object { $_.Extension -in ".py", ".txt" }
$NewestSourceTime = ($SourceFiles | Measure-Object -Property LastWriteTimeUtc -Maximum).Maximum
if ((-not $Force) -and (Test-Path $OutputBinary)) {
    $OutputTime = (Get-Item $OutputBinary).LastWriteTimeUtc
    if ($OutputTime -ge $NewestSourceTime) {
        Write-Host "Python Sidecar 已是最新版本：$OutputBinary" -ForegroundColor Green
        exit 0
    }
}

if (-not (Test-Path $VenvPython)) {
    if ($null -ne (Get-Command py -ErrorAction SilentlyContinue)) {
        Invoke-Checked "py" "-3" "-m" "venv" $VenvDir
    } elseif ($null -ne (Get-Command python -ErrorAction SilentlyContinue)) {
        Invoke-Checked "python" "-m" "venv" $VenvDir
    } else {
        throw "未找到 Python 3。开发者请安装 64 位 Python；应用最终用户无需安装 Python。"
    }
}

Invoke-Checked $VenvPython "-m" "pip" "install" "--disable-pip-version-check" "-r" $Requirements

New-Item -ItemType Directory -Force -Path $DistDir, $WorkDir, $SpecDir, $BinariesDir | Out-Null
Invoke-Checked $VenvPython "-m" "PyInstaller" `
    "--noconfirm" `
    "--clean" `
    "--onefile" `
    "--noupx" `
    "--name" "tool-python" `
    "--distpath" $DistDir `
    "--workpath" $WorkDir `
    "--specpath" $SpecDir `
    $Runner

$BuiltBinary = Join-Path $DistDir "tool-python.exe"
if (-not (Test-Path $BuiltBinary)) {
    throw "PyInstaller 未生成预期文件：$BuiltBinary"
}

Copy-Item -Force $BuiltBinary $OutputBinary
Write-Host "Windows Python Sidecar 已生成：$OutputBinary" -ForegroundColor Green
Write-Host "Tauri 将通过 externalBin 自动把它打包进 NSIS 安装器。"
