/**
 * Type definitions for Progression Analyzer and Recommendations System
 */

/**
 * Scale recommendation for a chord in a progression
 */
export interface ScaleRecommendation {
  scaleName: string;
  compatibilityScore: number; // 1-10
  usage: string; // Description of when/how to use
}

/**
 * Chord progression definition
 */
export interface ChordProgression {
  id: string; // Unique identifier (e.g., "i-iv-v-i")
  name: string; // Display name (e.g., "I-IV-V-I")
  description: string; // What makes this progression special
  chords: string[]; // Chord symbols (e.g., ["C", "F", "G", "C"])
  romanNumerals: string[]; // Roman numeral notation (e.g., ["I", "IV", "V", "I"])
  genre: string[]; // Applicable genres (e.g., ["Rock", "Blues", "Country"])
  difficulty: number; // 1-5 stars
  musicalCharacter: string; // Emotional/musical quality
  famousSongs: string[]; // Examples of songs using this progression
  scaleRecommendations: Record<string, ScaleRecommendation[]>; // Scales per chord
}

/**
 * Progression recommendations for a key
 */
export interface ProgressionRecommendations {
  key: string; // Root note (e.g., "C", "D", "F#")
  version?: string;
  lastUpdated?: string;
  progressions: ChordProgression[];
}

/**
 * Request parameters for progression recommendations API
 */
export interface ProgressionRecommendationsRequest {
  key: string; // Root note
  genre?: string; // Optional genre filter
  difficulty?: number; // Optional difficulty filter (1-5)
}

/**
 * Response from progression recommendations API
 */
export interface ProgressionRecommendationsResponse {
  key: string;
  progressions: ChordProgression[];
  error?: string;
}

/**
 * Analysis of a chord progression
 */
export interface ProgressionAnalysis {
  currentChord: string;
  currentIndex: number;
  totalChords: number;
  previousChords: string[];
  nextChordSuggestions: string[]; // Suggested next chords
  compatibleScales: ScaleRecommendation[]; // Scales for current chord
  progressionType?: string; // e.g., "I-IV-V", "ii-V-I"
  musicalContext?: string; // Analysis of the progression
}

/**
 * Dynamic recommendation context
 */
export interface DynamicRecommendationContext {
  songList: string[]; // Current "Add to Song" list
  currentPosition: number; // Current position in the list
  key: string; // Current key
  scale: string; // Current scale
}

