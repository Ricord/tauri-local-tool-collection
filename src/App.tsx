import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { ToolDetail } from "./components/ToolDetail";
import { ToolGrid } from "./components/ToolGrid";
import type { Tool } from "./types";
import "./App.css";

function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"overview" | "tool">("overview");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoadError("");
        setTools(await invoke<Tool[]>("get_tools"));
      } catch (error) {
        setLoadError(typeof error === "string" ? error : "无法从 Tauri 后端加载工具注册表");
      } finally {
        setLoading(false);
      }
    };

    void loadTools();
  }, []);

  const selectedTool = tools.find((tool) => tool.id === selectedToolId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
      <Sidebar
        tools={tools}
        selectedToolId={selectedToolId}
        onSelectTool={setSelectedToolId}
        onSelectView={setCurrentView}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
              <p className="text-sm text-slate-400">正在加载 Windows 工具注册表</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-lg rounded-xl border border-red-900/60 bg-red-950/30 p-6 text-center">
              <h1 className="font-semibold text-red-200">工具加载失败</h1>
              <p className="mt-2 text-sm leading-6 text-red-300/80">{loadError}</p>
              <p className="mt-4 text-xs text-slate-500">请通过 Tauri 启动应用，而不是直接在浏览器中打开前端页面。</p>
            </div>
          </div>
        ) : currentView === "overview" ? (
          <ToolGrid
            tools={tools}
            onSelectTool={(toolId) => {
              setSelectedToolId(toolId);
              setCurrentView("tool");
            }}
          />
        ) : (
          <ToolDetail
            tool={selectedTool}
            onBack={() => {
              setCurrentView("overview");
              setSelectedToolId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
