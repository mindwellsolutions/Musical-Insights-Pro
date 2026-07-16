/**
 * Type definitions for Chord-Scale Compatibility System
 */

/**
 * Compatible scale information for a chord
 */
export interface CompatibleScale {
  scaleName: string;
  scaleDbKey: string;
  compatibilityScore: number; // 1-10
  relationship: string;
  musicalContext: string;
  chordTones: string[]; // Scale degrees (e.g., ["1", "3", "5", "7"])
  tensions: string[]; // Available tensions (e.g., ["9th", "13th"])
  avoidNotes: string[]; // Notes to avoid (e.g., ["11th (4th)"])
  musicGenreRecommendations: string;
  difficultyLevel: number; // 1-5
  commonUse?: string;
  famousExamples?: string;
}

/**
 * Chord quality compatibility data
 */
export interface ChordScaleCompatibility {
  chordQuality: string; // e.g., "maj7", "m7", "dom7"
  displayName: string; // e.g., "Major 7th"
  suffix: string; // e.g., "maj7", "m7", "7"
  version: string;
  lastUpdated: string;
  description: string;
  intervals: number[]; // Semitone intervals from root
  compatibleScales: CompatibleScale[];
}

/**
 * Chord type index entry
 */
export interface ChordTypeIndex {
  quality: string;
  displayName: string;
  suffix: string;
  file: string;
  examples: string[];
}

/**
 * Master index of all chord types
 */
export interface ChordScaleIndex {
  version: string;
  lastUpdated: string;
  chordTypes: ChordTypeIndex[];
}

/**
 * Request parameters for chord-scale compatibility API
 */
export interface ChordScaleCompatibilityRequest {
  chord: string; // e.g., "Cmaj7", "Dm7", "G7"
}

/**
 * Response from chord-scale compatibility API
 */
export interface ChordScaleCompatibilityResponse {
  chord: string;
  chordQuality: string;
  displayName: string;
  compatibleScales: CompatibleScale[];
  error?: string;
}

