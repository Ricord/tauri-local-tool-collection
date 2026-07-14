import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Clipboard, ExternalLink, Play, RotateCcw } from "lucide-react";
import type { HttpResponse, Tool, ToolRuntime } from "../types";
import { ToolIcon } from "./ToolIcon";

interface ToolDetailProps {
  tool: Tool | null;
  onBack: () => void;
}

const runtimeLabel: Record<ToolRuntime, string> = {
  python: "Python Sidecar",
  rust: "Rust 本地后端",
  web: "Windows 默认浏览器",
  placeholder: "待实现",
};

function readableError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "操作失败，请检查输入后重试";
}

function ResultBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">输出</label>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
          <Clipboard className="h-3.5 w-3.5" />
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="max-h-96 min-h-28 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-200">
        {value}
      </pre>
    </div>
  );
}

function PythonToolPanel({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(tool.id === "json_formatter" ? '{"name":"Windows","ready":true}' : "");
  const [uuidVersion, setUuidVersion] = useState("4");
  const [uuidName, setUuidName] = useState("example.com");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setInput(tool.id === "json_formatter" ? '{"name":"Windows","ready":true}' : "");
    setResult("");
    setError("");
  }, [tool.id]);

  const run = async (action: "format" | "minify" | "encode" | "decode" | "generate") => {
    setBusy(true);
    setError("");
    try {
      let args: string[];
      if (tool.id === "json_formatter") {
        args = action === "minify" ? [input, "--minify"] : [input];
      } else if (tool.id === "base64_encoder") {
        args = [action, input];
      } else {
        args = uuidVersion === "5" ? [uuidVersion, uuidName] : [uuidVersion];
      }
      setResult(await invoke<string>("execute_python", { scriptName: tool.id, args }));
    } catch (runError) {
      setError(readableError(runError));
    } finally {
      setBusy(false);
    }
  };

  if (tool.id === "uuid_generator") {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>UUID 版本</span>
            <select value={uuidVersion} onChange={(event) => setUuidVersion(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none">
              <option value="1">v1（时间）</option>
              <option value="4">v4（随机）</option>
              <option value="5">v5（名称）</option>
            </select>
          </label>
          {uuidVersion === "5" && (
            <label className="space-y-2 text-sm text-slate-300">
              <span>名称</span>
              <input value={uuidName} onChange={(event) => setUuidName(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
            </label>
          )}
        </div>
        <button type="button" disabled={busy} onClick={() => run("generate")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50">
          <Play className="h-4 w-4" />
          {busy ? "生成中" : "生成 UUID"}
        </button>
        {error && <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
        {result && <ResultBox value={result} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <label className="block space-y-2 text-sm text-slate-300">
        <span>{tool.id === "json_formatter" ? "JSON 输入" : "UTF-8 文本"}</span>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={9} spellCheck={false} className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm leading-6 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" placeholder="请输入内容" />
      </label>
      <div className="flex flex-wrap gap-2">
        {tool.id === "json_formatter" ? (
          <>
            <button type="button" disabled={busy} onClick={() => run("format")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"><Play className="h-4 w-4" />格式化</button>
            <button type="button" disabled={busy} onClick={() => run("minify")} className="rounded-lg border border-slate-600 px-4 py-2.5 font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50">压缩</button>
          </>
        ) : (
          <>
            <button type="button" disabled={busy} onClick={() => run("encode")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"><Play className="h-4 w-4" />编码</button>
            <button type="button" disabled={busy} onClick={() => run("decode")} className="rounded-lg border border-slate-600 px-4 py-2.5 font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50">解码</button>
          </>
        )}
        <button type="button" onClick={() => { setInput(""); setResult(""); setError(""); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white"><RotateCcw className="h-4 w-4" />清空</button>
      </div>
      {error && <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
      {result && <ResultBox value={result} />}
    </div>
  );
}

function SystemInfoPanel() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setResult(await invoke<string>("get_system_info"));
    } catch (loadError) {
      setError(readableError(loadError));
    }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500"><Play className="h-4 w-4" />读取系统信息</button>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {result && <ResultBox value={result} />}
    </div>
  );
}

function HttpClientPanel() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const request = async () => {
    setBusy(true);
    setError("");
    setResponse(null);
    try {
      setResponse(await invoke<HttpResponse>("http_get", { url }));
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <label className="block space-y-2 text-sm text-slate-300">
        <span>HTTP/HTTPS 地址</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => event.key === "Enter" && request()} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
          <button type="button" disabled={busy} onClick={request} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"><Play className="h-4 w-4" />{busy ? "请求中" : "发送 GET"}</button>
        </div>
      </label>
      {error && <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
      {response && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-emerald-300">状态 {response.status}</span>
            <span className="rounded bg-slate-700 px-2.5 py-1 text-slate-300">{response.contentType ?? "未知内容类型"}</span>
            {response.truncated && <span className="rounded bg-amber-500/10 px-2.5 py-1 text-amber-300">正文已截断至 2 MiB</span>}
          </div>
          <p className="break-all text-xs text-slate-500">最终地址：{response.finalUrl}</p>
          <ResultBox value={response.body} />
        </div>
      )}
    </div>
  );
}

function WebToolPanel({ tool }: { tool: Tool }) {
  const [error, setError] = useState("");
  const open = async () => {
    try {
      setError("");
      await invoke("open_web_tool", { toolId: tool.id });
    } catch (openError) {
      setError(readableError(openError));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-400">为避免在本地 WebView 中处理第三方登录和兼容性问题，此入口会安全地调用 Windows 默认浏览器。</p>
      {tool.webUrl && <p className="break-all rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-300">{tool.webUrl}</p>}
      <button type="button" onClick={open} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500"><ExternalLink className="h-4 w-4" />在默认浏览器中打开</button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}

export function ToolDetail({ tool, onBack }: ToolDetailProps) {
  if (!tool) {
    return <div className="flex flex-1 items-center justify-center text-slate-400">请选择一个工具</div>;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />返回工具总览</button>
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300"><ToolIcon name={tool.icon} className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{tool.name}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-300">{tool.category}</span><span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{runtimeLabel[tool.runtime]}</span></div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-6 sm:p-8">
        <section className="rounded-xl border border-slate-700 bg-slate-800/70 p-5 shadow-sm sm:p-6">
          {tool.runtime === "python" && <PythonToolPanel tool={tool} />}
          {tool.id === "system_info" && <SystemInfoPanel />}
          {tool.id === "http_client" && <HttpClientPanel />}
          {tool.runtime === "web" && <WebToolPanel tool={tool} />}
        </section>
      </div>
    </main>
  );
}
