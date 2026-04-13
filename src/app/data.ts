export interface Source {
  name: string;
  url: string;
  isOfficial: boolean;
}

export interface DateEntry {
  date: string;
  type: "current" | "previous";
  confidence: number;
  sourceCount: number;
  sources: Source[];
}

export interface Platform {
  name: string;
  confirmed: boolean;
  launchDay: boolean;
}

export interface TimelineEvent {
  date: string;
  event: string;
}

export interface Prediction {
  probability: number;
  title: string;
  active: boolean;
  updatedAt: string;
}

export interface GameData {
  title: string;
  developer: string;
  status: string;
  dates: DateEntry[];
  platforms: Platform[];
  timeline: TimelineEvent[];
  summary: string;
  lastUpdated: string;
  totalSourcesAnalyzed: number;
  predictions: Prediction[];
  generatedAt: string;
}
