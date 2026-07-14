export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled: boolean;
}

export type ToolCategory = 
  | "Text"
  | "Data"
  | "Crypto"
  | "Generator"
  | "Design"
  | "Image"
  | "Encoding"
  | "Development"
  | "Time"
  | "Security"
  | "Converter"
  | "Placeholder";
