# Windows 兼容性审计

## 结论

当前版本只能证明前端和 Rust 代码曾在 Linux 环境编译，**并不是可交付的 Windows 版本**。主要阻塞点如下。

| 问题 | 当前实现 | Windows 影响 | 修复方向 |
| --- | --- | --- | --- |
| Python 启动命令 | `Command::new("python3")` | Windows 通常不存在 `python3.exe`，且用户未必安装 Python | 将 Python 工具用 PyInstaller 打成独立 Sidecar EXE |
| Python 路径 | 使用相对路径 `src-python/*.py` | 安装后的工作目录不包含源码目录 | 使用 Tauri `externalBin` 打包 Sidecar，不依赖源码路径 |
| Python 资源 | `src-python` 未进入安装包 | 发布版找不到脚本 | 由统一 `tool_runner.py` 生成单文件 EXE |
| Tauri 权限 | `capabilities` 目录不存在 | 无法安全开放 Sidecar/插件能力 | 恢复 Windows 主窗口能力配置 |
| Sidecar 支持 | 未安装或初始化 Shell 插件 | Tauri 无法按官方机制运行外部工具 | 添加 `tauri-plugin-shell` 并从 Rust 调用 Sidecar |
| 网络功能 | README 声称已配置，代码中并无 HTTP 插件或 Rust 网络命令 | Web 工具无法可靠联网 | 增加受控 Rust HTTP 命令与外部 URL 打开命令 |
| Windows 构建 | 没有 PowerShell 脚本和 Windows CI | 无法稳定生成 `.msi` / `-setup.exe` | 添加 Windows 构建脚本和 GitHub Actions |
| 安装包验证 | 仅执行 Linux `cargo build` | 不能证明 Windows 安装包可用 | 在 `windows-latest` 自动构建并上传安装包产物 |
| 工具状态 | 多个未实现工具被标记为启用 | 用户进入后只看到占位界面 | 仅将已接线的示例工具标记为可用，其余保留为占位项 |

## Windows 重构目标

重构后，开发者在 Windows 10/11 上运行一次 PowerShell 构建脚本即可完成 Python Sidecar 生成和 Tauri 安装包构建。最终用户无需预装 Python。GitHub Actions 将在 Windows Runner 上构建并保存 MSI 与 NSIS 安装包。

## 参考

[1]: https://v2.tauri.app/develop/sidecar/ "Tauri v2 — Embedding External Binaries"
[2]: https://v2.tauri.app/plugin/shell/ "Tauri v2 — Shell Plugin"

Tauri 官方将打包后的 Python CLI 作为 Sidecar 的典型用例，并要求 `externalBin` 对应的二进制文件使用目标三元组后缀。[1] Shell 插件支持 Windows，并提供从 Rust 运行 Sidecar 的接口。[2]

## 官方配置规则补充

Tauri v2 会自动读取 `src-tauri/tauri.windows.conf.json`，并按照 JSON Merge Patch 规则与主配置合并。因此，Windows 专用的 `bundle.externalBin`、安装器选项和 WebView2 安装策略应放在该文件中，避免 Linux/macOS 校验时要求存在 Windows EXE。[3]

Sidecar 配置中的相对路径以 `src-tauri/tauri.conf.json` 所在目录为基准。配置 `"externalBin": ["binaries/tool-python"]` 后，Windows x64 构建要求文件名为 `tool-python-x86_64-pc-windows-msvc.exe`；从 Rust 调用时只传文件名 `tool-python`，不传完整路径。[1]

[3]: https://v2.tauri.app/develop/configuration-files/ "Tauri v2 — Configuration Files"
