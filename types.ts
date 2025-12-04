export interface DatasetRow {
  [key: string]: string | number | boolean | null;
}

export interface ExtractedDataset {
  name?: string; // Added to distinguish A vs B
  columns: string[];
  data: DatasetRow[];
  summary: string;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export type ViewMode = 'table' | 'json';
export type AppMode = 'single' | 'versus';

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie';
  title: string;
  data: any[];
  xAxisKey: string;
  seriesKeys: string[]; // For bar/line/area (e.g., ["revenue", "profit"])
}

export interface AnalysisResponse {
  answer: string;
  chart?: ChartConfig;
}

export interface AnalysisMessage {
  role: 'user' | 'assistant';
  content: string;
  chart?: ChartConfig;
  timestamp: number;
}
