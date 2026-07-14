import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { ToolGrid } from "./components/ToolGrid";
import { ToolDetail } from "./components/ToolDetail";
import { Tool } from "./types";
import "./App.css";

function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"overview" | "tool">(
    "overview"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const toolsList = await invoke<Tool[]>("get_tools");
        setTools(toolsList);
      } catch (error) {
        console.error("Failed to load tools:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const selectedTool = tools.find((t) => t.id === selectedToolId) || null;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        tools={tools}
        selectedToolId={selectedToolId}
        onSelectTool={setSelectedToolId}
        onSelectView={setCurrentView}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tools...</p>
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
