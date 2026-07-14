export type ToolRuntime = "python" | "rust" | "web" | "placeholder";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled: boolean;
  runtime: ToolRuntime;
  webUrl: string | null;
}

export interface HttpResponse {
  status: number;
  finalUrl: string;
  contentType: string | null;
  body: string;
  truncated: boolean;
}
