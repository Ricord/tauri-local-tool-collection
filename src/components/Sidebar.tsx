import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import type { Tool } from "../types";
import { ToolIcon } from "./ToolIcon";

interface SidebarProps {
  tools: Tool[];
  selectedToolId: string | null;
  onSelectTool: (toolId: string | null) => void;
  onSelectView: (view: "overview" | "tool") => void;
}

export function Sidebar({
  tools,
  selectedToolId,
  onSelectTool,
  onSelectView,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return tools;
    return tools.filter((tool) =>
      [tool.name, tool.description, tool.category, tool.runtime]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [tools, searchQuery]);

  const groupedTools = useMemo(() => {
    const groups = new Map<string, Tool[]>();
    for (const tool of filteredTools) {
      const categoryTools = groups.get(tool.category) ?? [];
      categoryTools.push(tool);
      groups.set(tool.category, categoryTools);
    }
    return [...groups.entries()];
  }, [filteredTools]);

  const selectOverview = () => {
    onSelectTool(null);
    onSelectView("overview");
  };

  const selectTool = (tool: Tool) => {
    if (!tool.enabled) return;
    onSelectTool(tool.id);
    onSelectView("tool");
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <aside className={`flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white transition-[width] duration-200 ${isCollapsed ? "w-[72px]" : "w-72"}`}>
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!isCollapsed && (
          <div>
            <p className="font-semibold tracking-tight">本地工具箱</p>
            <p className="text-xs text-slate-500">Windows Edition</p>
          </div>
        )}
        <button type="button" title={isCollapsed ? "展开导航" : "收起导航"} onClick={() => setIsCollapsed((value) => !value)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="border-b border-slate-800 p-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索工具、分类或运行时" className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
          </label>
        </div>
      )}

      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        <button type="button" onClick={selectOverview} title="工具总览" className={`mb-2 flex w-full items-center rounded-lg text-left transition ${isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"} ${selectedToolId === null ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
          <LayoutGrid className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">工具总览</span>}
        </button>

        {isCollapsed ? (
          <div className="space-y-1 border-t border-slate-800 pt-2">
            {tools.filter((tool) => tool.enabled).map((tool) => (
              <button key={tool.id} type="button" title={tool.name} onClick={() => selectTool(tool)} className={`flex w-full justify-center rounded-lg p-3 transition ${selectedToolId === tool.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <ToolIcon name={tool.icon} className="h-5 w-5" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1 border-t border-slate-800 pt-2">
            {groupedTools.map(([category, categoryTools]) => {
              const categoryCollapsed = collapsedCategories.has(category);
              return (
                <div key={category}>
                  <button type="button" onClick={() => toggleCategory(category)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-900 hover:text-slate-300">
                    {categoryCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="flex-1 text-left">{category}</span>
                    <span className="font-normal text-slate-600">{categoryTools.length}</span>
                  </button>
                  {!categoryCollapsed && (
                    <div className="mb-1 space-y-1">
                      {categoryTools.map((tool) => (
                        <button key={tool.id} type="button" disabled={!tool.enabled} onClick={() => selectTool(tool)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${selectedToolId === tool.id ? "bg-blue-600 text-white" : tool.enabled ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "cursor-not-allowed text-slate-600"}`}>
                          <ToolIcon name={tool.icon} className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{tool.name}</span>
                            <span className={`block truncate text-xs ${selectedToolId === tool.id ? "text-blue-100" : "text-slate-500"}`}>{tool.enabled ? tool.runtime : "待实现"}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {groupedTools.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate-600">没有匹配的工具</p>}
          </div>
        )}
      </nav>
    </aside>
  );
}
