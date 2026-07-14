import React from "react";
import { Tool } from "../types";
import { ArrowLeft } from "lucide-react";

interface ToolDetailProps {
  tool: Tool | null;
  onBack: () => void;
}

export const ToolDetail: React.FC<ToolDetailProps> = ({ tool, onBack }) => {
  if (!tool) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Select a tool to view details</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <div className="flex items-start gap-4">
          <div className="text-5xl">{tool.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
            <p className="text-gray-400 mt-2">{tool.description}</p>
            <div className="mt-3">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded">
                {tool.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Tool Interface
            </h2>
            <p className="text-gray-400 mb-4">
              This is a placeholder for the {tool.name} tool interface.
            </p>
            <p className="text-gray-500 text-sm">
              The specific tool implementation will be added here based on the
              tool type.
            </p>

            {/* Tool-specific content examples */}
            {tool.id === "text_converter" && (
              <div className="mt-6 space-y-4">
                <textarea
                  placeholder="Enter text to convert..."
                  className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                    Convert
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {tool.id === "json_formatter" && (
              <div className="mt-6 space-y-4">
                <textarea
                  placeholder="Paste JSON here..."
                  className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                    Format
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                    Minify
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">
                    Copy
                  </button>
                </div>
              </div>
            )}

            {tool.id === "color_picker" && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      defaultValue="#3b82f6"
                      className="w-20 h-20 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-2">
                      HEX
                    </label>
                    <input
                      type="text"
                      value="#3b82f6"
                      readOnly
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool.id === "uuid_generator" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Generated UUID
                  </label>
                  <input
                    type="text"
                    value="550e8400-e29b-41d4-a716-446655440000"
                    readOnly
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                    Generate UUID v4
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-600">
              <p className="text-xs text-gray-500">
                💡 Tip: Each tool can be extended with Python or Rust backend
                logic. The interface above is a template that will be customized
                for each tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
