/**
 * TypeScript types for the Progression Interval Compatible Chords system.
 * Used by Feature A — Progression Interval Chord Selector.
 */

export interface CompatibleChordEntry {
  symbol: string;       // e.g., "Cmaj7"
  displayName: string;  // e.g., "C Major 7"
  quality: string;      // e.g., "major7"
  notes: string[];      // e.g., ["C", "E", "G", "B"]
  intervals: number[];  // semitones from root
  suitability: number;  // 1–10
  context: string;      // musical use description
  genres: string[];     // applicable genres
}

export interface ScaleDegreeEntry {
  primaryChord: string;    // e.g., "C"
  primaryQuality: string;  // e.g., "major"
  rootNote: string;        // e.g., "C"
  compatibleChords: CompatibleChordEntry[];
}

export interface IntervalChordDatabase {
  key: string;
  version: string;
  scaleDegrees: Record<string, ScaleDegreeEntry>;
  // keys: "I", "ii", "iii", "IV", "V", "vi", "vii°", "bVII", "bVI", "bIII", "bII"
}

/** Per-slot chord selection made by the user in ProgressionIntervalChordSelector */
export type ProgressionChordSelections = Record<number, CompatibleChordEntry>;
