import type { Tool, ToolRuntime } from "../types";
import { ToolIcon } from "./ToolIcon";

interface ToolGridProps {
  tools: Tool[];
  onSelectTool: (toolId: string) => void;
}

const runtimeLabel: Record<ToolRuntime, string> = {
  python: "Python",
  rust: "Rust",
  web: "Web",
  placeholder: "待实现",
};

export function ToolGrid({ tools, onSelectTool }: ToolGridProps) {
  const availableCount = tools.filter((tool) => tool.enabled).length;

  return (
    <main className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">Windows 本地工具集合</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">工具总览</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              当前有 {availableCount} 个可用工具。Python 工具由安装包内置 Sidecar 执行，Rust
              工具由本地后端执行，Web 工具使用 Windows 默认浏览器打开。
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm text-slate-300">
            共 {tools.length} 个入口
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tools.map((tool) => {
            const content = (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`rounded-xl p-3 ${tool.enabled ? "bg-blue-500/10 text-blue-300" : "bg-slate-800 text-slate-500"}`}>
                    <ToolIcon name={tool.icon} className="h-7 w-7" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tool.enabled ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-slate-500"}`}>
                    {runtimeLabel[tool.runtime]}
                  </span>
                </div>
                <h2 className={`font-semibold ${tool.enabled ? "text-white group-hover:text-blue-300" : "text-slate-500"}`}>
                  {tool.name}
                </h2>
                <p className={`mt-2 min-h-10 text-sm leading-5 ${tool.enabled ? "text-slate-400" : "text-slate-600"}`}>
                  {tool.description}
                </p>
                <div className={`mt-5 border-t pt-3 text-xs ${tool.enabled ? "border-slate-700 text-slate-500 group-hover:text-blue-400" : "border-slate-800 text-slate-600"}`}>
                  {tool.enabled ? `${tool.category} · 打开工具` : `${tool.category} · 页面占位`}
                </div>
              </>
            );

            if (!tool.enabled) {
              return (
                <div key={tool.id} className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-5">
                  {content}
                </div>
              );
            }

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                className="group rounded-xl border border-slate-700 bg-slate-800/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/70 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
