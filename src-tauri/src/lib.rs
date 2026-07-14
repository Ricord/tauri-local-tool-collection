use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tool {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub icon: String,
    pub enabled: bool,
}

// 获取所有工具列表
#[tauri::command]
fn get_tools() -> Vec<Tool> {
    vec![
        Tool {
            id: "text_converter".to_string(),
            name: "Text Converter".to_string(),
            description: "Convert text formats (JSON, YAML, XML)".to_string(),
            category: "Text".to_string(),
            icon: "FileText".to_string(),
            enabled: true,
        },
        Tool {
            id: "json_formatter".to_string(),
            name: "JSON Formatter".to_string(),
            description: "Format and validate JSON data".to_string(),
            category: "Data".to_string(),
            icon: "Code".to_string(),
            enabled: true,
        },
        Tool {
            id: "hash_generator".to_string(),
            name: "Hash Generator".to_string(),
            description: "Generate MD5, SHA256, and other hashes".to_string(),
            category: "Crypto".to_string(),
            icon: "Lock".to_string(),
            enabled: true,
        },
        Tool {
            id: "qr_code".to_string(),
            name: "QR Code Generator".to_string(),
            description: "Generate QR codes from text or URLs".to_string(),
            category: "Generator".to_string(),
            icon: "QrCode".to_string(),
            enabled: true,
        },
        Tool {
            id: "color_picker".to_string(),
            name: "Color Picker".to_string(),
            description: "Pick and convert colors (HEX, RGB, HSL)".to_string(),
            category: "Design".to_string(),
            icon: "Palette".to_string(),
            enabled: true,
        },
        Tool {
            id: "image_compressor".to_string(),
            name: "Image Compressor".to_string(),
            description: "Compress and optimize images".to_string(),
            category: "Image".to_string(),
            icon: "Image".to_string(),
            enabled: true,
        },
        Tool {
            id: "base64_encoder".to_string(),
            name: "Base64 Encoder/Decoder".to_string(),
            description: "Encode and decode Base64 strings".to_string(),
            category: "Encoding".to_string(),
            icon: "Code2".to_string(),
            enabled: true,
        },
        Tool {
            id: "regex_tester".to_string(),
            name: "Regex Tester".to_string(),
            description: "Test and debug regular expressions".to_string(),
            category: "Development".to_string(),
            icon: "Zap".to_string(),
            enabled: true,
        },
        Tool {
            id: "uuid_generator".to_string(),
            name: "UUID Generator".to_string(),
            description: "Generate UUIDs (v1, v4, v5)".to_string(),
            category: "Generator".to_string(),
            icon: "Sparkles".to_string(),
            enabled: true,
        },
        Tool {
            id: "timestamp_converter".to_string(),
            name: "Timestamp Converter".to_string(),
            description: "Convert between Unix timestamps and dates".to_string(),
            category: "Time".to_string(),
            icon: "Clock".to_string(),
            enabled: true,
        },
        Tool {
            id: "markdown_preview".to_string(),
            name: "Markdown Preview".to_string(),
            description: "Preview and convert Markdown to HTML".to_string(),
            category: "Text".to_string(),
            icon: "FileText".to_string(),
            enabled: true,
        },
        Tool {
            id: "password_generator".to_string(),
            name: "Password Generator".to_string(),
            description: "Generate secure random passwords".to_string(),
            category: "Security".to_string(),
            icon: "Key".to_string(),
            enabled: true,
        },
        Tool {
            id: "unit_converter".to_string(),
            name: "Unit Converter".to_string(),
            description: "Convert between different units".to_string(),
            category: "Converter".to_string(),
            icon: "Ruler".to_string(),
            enabled: true,
        },
        Tool {
            id: "placeholder_1".to_string(),
            name: "Tool Placeholder 1".to_string(),
            description: "Reserved for future tool".to_string(),
            category: "Placeholder".to_string(),
            icon: "Plus".to_string(),
            enabled: false,
        },
        Tool {
            id: "placeholder_2".to_string(),
            name: "Tool Placeholder 2".to_string(),
            description: "Reserved for future tool".to_string(),
            category: "Placeholder".to_string(),
            icon: "Plus".to_string(),
            enabled: false,
        },
        Tool {
            id: "placeholder_3".to_string(),
            name: "Tool Placeholder 3".to_string(),
            description: "Reserved for future tool".to_string(),
            category: "Placeholder".to_string(),
            icon: "Plus".to_string(),
            enabled: false,
        },
    ]
}

// 执行 Python 脚本
#[tauri::command]
fn execute_python(script_name: String, args: Vec<String>) -> Result<String, String> {
    let mut cmd = Command::new("python3");
    cmd.arg(format!("src-python/{}.py", script_name));
    for arg in args {
        cmd.arg(arg);
    }
    
    match cmd.output() {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute Python script: {}", e)),
    }
}

// 获取系统信息
#[tauri::command]
fn get_system_info() -> Result<String, String> {
    Ok(format!(
        "OS: {}, Arch: {}",
        std::env::consts::OS,
        std::env::consts::ARCH
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_tools,
            execute_python,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
