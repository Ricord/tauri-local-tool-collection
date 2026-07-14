export function getIconComponent(iconName: string): string {
  const iconMap: Record<string, string> = {
    FileText: "📄",
    Code: "💻",
    Lock: "🔒",
    QrCode: "📱",
    Palette: "🎨",
    Image: "🖼️",
    Code2: "⚙️",
    Zap: "⚡",
    Sparkles: "✨",
    Clock: "⏰",
    Key: "🔑",
    Ruler: "📏",
    Plus: "➕",
  };

  return iconMap[iconName] || "🔧";
}
