use serde::{Deserialize, Serialize};
use std::time::Duration;
use tauri_plugin_opener::OpenerExt;
use url::Url;

#[cfg(target_os = "windows")]
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tool {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon: String,
    pub enabled: bool,
    pub runtime: String,
    pub web_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub status: u16,
    pub final_url: String,
    pub content_type: Option<String>,
    pub body: String,
    pub truncated: bool,
}

fn tool(
    id: &str,
    name: &str,
    description: &str,
    category: &str,
    icon: &str,
    enabled: bool,
    runtime: &str,
    web_url: Option<&str>,
) -> Tool {
    Tool {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        category: category.to_string(),
        icon: icon.to_string(),
        enabled,
        runtime: runtime.to_string(),
        web_url: web_url.map(str::to_string),
    }
}

/// 工具注册表是导航、总览页与后端白名单的单一数据源。
#[tauri::command]
fn get_tools() -> Vec<Tool> {
    vec![
        tool(
            "json_formatter",
            "JSON 格式化",
            "格式化、压缩并验证 JSON 文本",
            "数据",
            "Braces",
            true,
            "python",
            None,
        ),
        tool(
            "base64_encoder",
            "Base64 编解码",
            "对 UTF-8 文本执行 Base64 编码或解码",
            "编码",
            "Binary",
            true,
            "python",
            None,
        ),
        tool(
            "uuid_generator",
            "UUID 生成器",
            "生成 UUID v1、v4 或基于名称的 v5",
            "生成器",
            "Fingerprint",
            true,
            "python",
            None,
        ),
        tool(
            "system_info",
            "系统信息",
            "查看当前系统与处理器架构",
            "系统",
            "MonitorCog",
            true,
            "rust",
            None,
        ),
        tool(
            "http_client",
            "HTTP GET 客户端",
            "通过 Rust 后端访问 HTTP/HTTPS 资源",
            "网络",
            "Network",
            true,
            "rust",
            None,
        ),
        tool(
            "github_web",
            "GitHub",
            "使用 Windows 默认浏览器打开 GitHub",
            "Web 应用",
            "Github",
            true,
            "web",
            Some("https://github.com/"),
        ),
        tool(
            "tauri_docs_web",
            "Tauri 文档",
            "使用 Windows 默认浏览器打开 Tauri v2 文档",
            "Web 应用",
            "BookOpen",
            true,
            "web",
            Some("https://v2.tauri.app/"),
        ),
        tool(
            "text_converter",
            "文本转换",
            "JSON、YAML、XML 文本格式转换",
            "文本",
            "FileText",
            false,
            "placeholder",
            None,
        ),
        tool(
            "hash_generator",
            "哈希生成器",
            "生成 SHA-256 等摘要",
            "安全",
            "LockKeyhole",
            false,
            "placeholder",
            None,
        ),
        tool(
            "qr_code",
            "二维码生成器",
            "从文本或网址生成二维码",
            "生成器",
            "QrCode",
            false,
            "placeholder",
            None,
        ),
        tool(
            "color_picker",
            "颜色选择器",
            "在 HEX、RGB、HSL 之间转换",
            "设计",
            "Palette",
            false,
            "placeholder",
            None,
        ),
        tool(
            "image_compressor",
            "图片压缩",
            "压缩并优化图片文件",
            "图片",
            "Image",
            false,
            "placeholder",
            None,
        ),
        tool(
            "regex_tester",
            "正则测试器",
            "测试和调试正则表达式",
            "开发",
            "Regex",
            false,
            "placeholder",
            None,
        ),
        tool(
            "timestamp_converter",
            "时间戳转换",
            "在 Unix 时间戳和日期之间转换",
            "时间",
            "Clock",
            false,
            "placeholder",
            None,
        ),
        tool(
            "markdown_preview",
            "Markdown 预览",
            "预览 Markdown 并转换为 HTML",
            "文本",
            "FileCode2",
            false,
            "placeholder",
            None,
        ),
        tool(
            "password_generator",
            "密码生成器",
            "生成安全的随机密码",
            "安全",
            "KeyRound",
            false,
            "placeholder",
            None,
        ),
        tool(
            "unit_converter",
            "单位转换器",
            "在常见计量单位之间转换",
            "转换",
            "Ruler",
            false,
            "placeholder",
            None,
        ),
        tool(
            "placeholder_1",
            "工具占位 1",
            "为后续工具预留的页面入口",
            "占位",
            "Plus",
            false,
            "placeholder",
            None,
        ),
        tool(
            "placeholder_2",
            "工具占位 2",
            "为后续工具预留的页面入口",
            "占位",
            "Plus",
            false,
            "placeholder",
            None,
        ),
        tool(
            "placeholder_3",
            "工具占位 3",
            "为后续工具预留的页面入口",
            "占位",
            "Plus",
            false,
            "placeholder",
            None,
        ),
    ]
}

const PYTHON_TOOLS: [&str; 3] = ["json_formatter", "base64_encoder", "uuid_generator"];
const MAX_PYTHON_ARGUMENTS: usize = 32;
const MAX_PYTHON_INPUT_BYTES: usize = 1_048_576;
const MAX_HTTP_RESPONSE_BYTES: usize = 2 * 1_048_576;
const WEB_TOOLS: [(&str, &str); 2] = [
    ("github_web", "https://github.com/"),
    ("tauri_docs_web", "https://v2.tauri.app/"),
];

fn validate_python_request(script_name: &str, args: &[String]) -> Result<(), String> {
    if !PYTHON_TOOLS.contains(&script_name) {
        return Err(format!("不允许执行未知 Python 工具：{script_name}"));
    }
    if args.len() > MAX_PYTHON_ARGUMENTS {
        return Err(format!(
            "参数数量过多：最多允许 {MAX_PYTHON_ARGUMENTS} 个参数"
        ));
    }
    let input_size = args.iter().map(String::len).sum::<usize>();
    if input_size > MAX_PYTHON_INPUT_BYTES {
        return Err("输入内容过大：Python 工具最多接收 1 MiB 文本".to_string());
    }
    Ok(())
}

/// Windows 发布版调用随安装包分发的 PyInstaller Sidecar。
/// 最终用户不需要安装 Python，并且调用不依赖当前工作目录。
#[cfg(target_os = "windows")]
#[tauri::command]
async fn execute_python(
    app: tauri::AppHandle,
    script_name: String,
    args: Vec<String>,
) -> Result<String, String> {
    validate_python_request(&script_name, &args)?;

    let mut sidecar_args = Vec::with_capacity(args.len() + 1);
    sidecar_args.push(script_name);
    sidecar_args.extend(args);

    let output = app
        .shell()
        .sidecar("tool-python")
        .map_err(|error| format!("无法创建 Python Sidecar 命令：{error}"))?
        .args(sidecar_args)
        .output()
        .await
        .map_err(|error| format!("无法启动 Python Sidecar：{error}"))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout)
            .trim_end_matches(['\r', '\n'])
            .to_string())
    } else {
        let message = String::from_utf8_lossy(&output.stderr)
            .trim_end_matches(['\r', '\n'])
            .to_string();
        Err(if message.is_empty() {
            format!("Python 工具执行失败，退出码：{:?}", output.status.code())
        } else {
            message
        })
    }
}

/// 非 Windows 环境仅用于贡献者开发与 CI 静态检查。
#[cfg(not(target_os = "windows"))]
#[tauri::command]
async fn execute_python(script_name: String, args: Vec<String>) -> Result<String, String> {
    validate_python_request(&script_name, &args)?;

    let runner =
        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-python/tool_runner.py");
    let output = tokio::process::Command::new("python3")
        .arg(runner)
        .arg(script_name)
        .args(args)
        .output()
        .await
        .map_err(|error| format!("开发环境无法启动 python3：{error}"))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout)
            .trim_end_matches(['\r', '\n'])
            .to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr)
            .trim_end_matches(['\r', '\n'])
            .to_string())
    }
}

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "操作系统：{}\n处理器架构：{}\nTauri 后端：Rust",
        std::env::consts::OS,
        std::env::consts::ARCH
    )
}

/// 只允许 HTTP/HTTPS，限制重定向、超时与返回正文大小。
#[tauri::command]
async fn http_get(url: String) -> Result<HttpResponse, String> {
    let parsed = Url::parse(url.trim()).map_err(|error| format!("网址无效：{error}"))?;
    if !matches!(parsed.scheme(), "http" | "https") {
        return Err("仅允许访问 http:// 或 https:// 网址".to_string());
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("ToolCollection/0.2 (Tauri; Windows)")
        .build()
        .map_err(|error| format!("无法初始化网络客户端：{error}"))?;

    let response = client
        .get(parsed)
        .send()
        .await
        .map_err(|error| format!("网络请求失败：{error}"))?;

    if response
        .content_length()
        .is_some_and(|length| length > MAX_HTTP_RESPONSE_BYTES as u64)
    {
        return Err("响应正文超过 2 MiB 限制".to_string());
    }

    let status = response.status().as_u16();
    let final_url = response.url().to_string();
    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_string);
    let bytes = response
        .bytes()
        .await
        .map_err(|error| format!("读取响应正文失败：{error}"))?;
    let truncated = bytes.len() > MAX_HTTP_RESPONSE_BYTES;
    let visible = if truncated {
        &bytes[..MAX_HTTP_RESPONSE_BYTES]
    } else {
        &bytes
    };

    Ok(HttpResponse {
        status,
        final_url,
        content_type,
        body: String::from_utf8_lossy(visible).to_string(),
        truncated,
    })
}

/// Web 工具只能打开注册表中的固定地址，使用 Windows 默认浏览器。
#[tauri::command]
fn open_web_tool(app: tauri::AppHandle, tool_id: String) -> Result<(), String> {
    let (_, url) = WEB_TOOLS
        .iter()
        .find(|(id, _)| *id == tool_id)
        .ok_or_else(|| format!("未注册的 Web 工具：{tool_id}"))?;

    app.opener()
        .open_url(*url, None::<String>)
        .map_err(|error| format!("无法打开默认浏览器：{error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_tools,
            execute_python,
            get_system_info,
            http_get,
            open_web_tool
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
