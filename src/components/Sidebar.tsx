import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Tool, ToolCategory } from "../types";

interface SidebarProps {
  tools: Tool[];
  selectedToolId: string | null;
  onSelectTool: (toolId: string) => void;
  onSelectView: (view: "overview" | "tool") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tools,
  selectedToolId,
  onSelectTool,
  onSelectView,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 按分类分组工具
  const groupedTools = useMemo(() => {
    const groups: Record<ToolCategory, Tool[]> = {
      Text: [],
      Data: [],
      Crypto: [],
      Generator: [],
      Design: [],
      Image: [],
      Encoding: [],
      Development: [],
      Time: [],
      Security: [],
      Converter: [],
      Placeholder: [],
    };

    tools.forEach((tool) => {
      if (
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        groups[tool.category as ToolCategory].push(tool);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [tools, searchQuery]);

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } border-r border-gray-700`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-lg font-bold">Tools</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Button */}
        <button
          onClick={() => {
            onSelectView("overview");
            onSelectTool("");
          }}
          className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition flex items-center gap-2 ${
            selectedToolId === "" ? "bg-blue-600" : ""
          }`}
        >
          {!isCollapsed && <span>📊 Overview</span>}
          {isCollapsed && <span>📊</span>}
        </button>

        {/* Categories */}
        {groupedTools.map(([category, categoryTools]) => (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition flex items-center gap-2 text-sm font-semibold"
            >
              {collapsedCategories.has(category) ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {!isCollapsed && <span>{category}</span>}
            </button>

            {!collapsedCategories.has(category) && (
              <div className="pl-4">
                {categoryTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      onSelectView("tool");
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition ${
                      selectedToolId === tool.id ? "bg-blue-600" : ""
                    } ${!tool.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!tool.enabled}
                  >
                    {!isCollapsed && (
                      <>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {tool.description}
                        </div>
                      </>
                    )}
                    {isCollapsed && <span title={tool.name}>{tool.icon}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
