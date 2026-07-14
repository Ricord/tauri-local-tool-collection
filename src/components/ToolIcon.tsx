import {
  Binary,
  BookOpen,
  Braces,
  Clock,
  FileCode2,
  FileText,
  Fingerprint,
  GitFork,
  Image,
  KeyRound,
  LockKeyhole,
  MonitorCog,
  Network,
  Palette,
  Plus,
  QrCode,
  Regex,
  Ruler,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Binary,
  BookOpen,
  Braces,
  Clock,
  FileCode2,
  FileText,
  Fingerprint,
  Github: GitFork,
  Image,
  KeyRound,
  LockKeyhole,
  MonitorCog,
  Network,
  Palette,
  Plus,
  QrCode,
  Regex,
  Ruler,
};

interface ToolIconProps {
  name: string;
  className?: string;
}

export function ToolIcon({ name, className = "h-6 w-6" }: ToolIconProps) {
  const Icon = icons[name] ?? Wrench;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />;
}
