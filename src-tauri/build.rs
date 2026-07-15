use std::{env, path::PathBuf, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=../src-python/tool_runner.py");
    println!("cargo:rerun-if-changed=../src-python/requirements-build.txt");
    println!("cargo:rerun-if-changed=../scripts/build-python-sidecar.ps1");

    if env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        prepare_windows_sidecar();
    }

    tauri_build::build()
}

fn prepare_windows_sidecar() {
    let manifest_dir = PathBuf::from(
        env::var_os("CARGO_MANIFEST_DIR")
            .expect("Cargo 未提供 CARGO_MANIFEST_DIR，无法定位 Windows Sidecar 构建脚本"),
    );
    let script = manifest_dir
        .parent()
        .expect("src-tauri 目录缺少项目根目录")
        .join("scripts")
        .join("build-python-sidecar.ps1");
    let target =
        env::var("TARGET").expect("Cargo 未提供 TARGET，无法确定 Windows Sidecar 的目标三元组");

    if !script.is_file() {
        panic!(
            "找不到 Windows Sidecar 构建脚本：{}。请确认仓库文件完整。",
            script.display()
        );
    }

    println!("cargo:warning=正在检查 Windows Python Sidecar（目标：{target}）");

    let status = Command::new("powershell.exe")
        .args([
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
        ])
        .arg(&script)
        .args(["-TargetTriple", &target])
        .status()
        .unwrap_or_else(|error| {
            panic!(
                "无法启动 powershell.exe 来生成 Windows Sidecar：{error}。请在 Windows PowerShell 中手动运行 `pnpm windows:sidecar`。"
            )
        });

    if !status.success() {
        panic!(
            "Windows Python Sidecar 生成失败（退出码：{}）。请确认已安装 64 位 Python 3，然后运行 `pnpm windows:sidecar` 查看完整错误。",
            status.code().map_or_else(|| "未知".to_string(), |code| code.to_string())
        );
    }
}
