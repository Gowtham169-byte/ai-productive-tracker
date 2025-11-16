
export interface Session {
    id: string;
    taskName: string;
    startTime: number;
    endTime: number;
    tags: string[];
    appId?: string;
    notes?: string;
}

export interface TrackedApp {
    id: string;
    name: string;
    dailyGoalMinutes: number;
}

export interface GeminiInsight {
    summary: string;
    peak_productivity: string;
    suggestions: string[];
    motivation: string;
}

export interface GroundingChunkWeb {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web: GroundingChunkWeb;
}

export interface GeminiInsightResult {
    insight: GeminiInsight;
    sources: GroundingChunk[];
}