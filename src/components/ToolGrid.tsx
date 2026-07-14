import React from "react";
import { Tool } from "../types";

interface ToolGridProps {
  tools: Tool[];
  onSelectTool: (toolId: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, onSelectTool }) => {
  const enabledTools = tools.filter((tool) => tool.enabled);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Tool Collection</h1>
      <p className="text-gray-400 mb-8">
        A comprehensive collection of useful tools for developers and designers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {enabledTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group relative p-6 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{tool.icon}</div>
              <div className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                {tool.category}
              </div>
            </div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-400">{tool.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 group-hover:text-blue-400 transition">
              Click to open →
            </div>
          </button>
        ))}
      </div>

      {/* Placeholder cards for future tools */}
      {tools
        .filter((tool) => !tool.enabled)
        .slice(0, 4)
        .map((tool) => (
          <div
            key={tool.id}
            className="p-6 bg-gray-900 border border-dashed border-gray-600 rounded-lg text-center"
          >
            <div className="text-3xl mb-3 opacity-30">{tool.icon}</div>
            <h3 className="font-semibold text-gray-500 mb-1">{tool.name}</h3>
            <p className="text-sm text-gray-600">Coming soon...</p>
          </div>
        ))}
    </div>
  );
};
