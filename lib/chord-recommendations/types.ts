/**
 * Type definitions for Chord Recommendations System
 */

/**
 * Recommended chord information
 */
export interface RecommendedChord {
  degree: string; // Roman numeral (e.g., "I", "ii", "V7")
  symbol: string; // Chord symbol (e.g., "C", "Dm", "G7")
  fullName: string; // Full chord name (e.g., "C Major", "D Minor 7th")
  quality: string; // Chord quality (e.g., "major", "minor", "dom7")
  notes: string[]; // Chord notes (e.g., ["C", "E", "G"])
  function: string; // Harmonic function (e.g., "Tonic - Home base")
  commonUse: string; // When to use this chord
  compatibilityScore: number; // 1-10
  borrowedFrom?: string; // For modal interchange chords
}

/**
 * Chord recommendations for a key-scale combination
 */
export interface ChordRecommendations {
  key: string; // Root note (e.g., "C", "D", "F#")
  scale: string; // Scale name (e.g., "Ionian", "Dorian")
  quality: string; // Scale quality (e.g., "major", "minor")
  version?: string;
  lastUpdated?: string;
  diatonicChords: RecommendedChord[]; // In-key chords
  extendedChords: RecommendedChord[]; // Jazz voicings (7ths, 9ths, etc.)
  modalInterchangeChords: RecommendedChord[]; // Borrowed chords
}

/**
 * Request parameters for chord recommendations API
 */
export interface ChordRecommendationsRequest {
  key: string; // Root note
  scale: string; // Scale name
}

/**
 * Response from chord recommendations API
 */
export interface ChordRecommendationsResponse {
  key: string;
  scale: string;
  quality: string;
  diatonicChords: RecommendedChord[];
  extendedChords: RecommendedChord[];
  modalInterchangeChords: RecommendedChord[];
  error?: string;
}

