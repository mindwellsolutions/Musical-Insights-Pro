// Custom Progressions types — used by all custom-progressions components and API routes

export interface IntervalStep {
  id: string;
  degree: string;          // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  degreeIndex: number;     // 0–6
  rootNote: string;        // resolved note name for current key, e.g. 'C'
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  color: string;           // TRIAD_PALETTE[degreeIndex]
}

export interface IntervalProgression {
  id: string;
  name: string;
  steps: IntervalStep[];
  key: string;             // key it was built for, e.g. 'C'
  scale: string;           // e.g. 'Major'
  createdAt: string;       // ISO date string
  source: 'manual' | 'ai';
  aiMetadata?: {
    prompt: string;
    rationale: string;
    emotionalContext: string;
    mood: string;
    complexity: number;    // 1–10
    musicTheoryBasis: string;
  };
}

export interface AIIntervalProgressionRecommendation {
  id: string;
  name: string;
  degrees: string[];       // e.g. ['I', 'vi', 'IV', 'V']
  rationale: string;
  emotionalContext: string;
  mood: string;
  complexity: number;      // 1–10
  musicTheoryBasis: string;
}
