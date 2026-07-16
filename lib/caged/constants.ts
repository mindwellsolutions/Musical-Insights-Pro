/**
 * CAGED System Constants
 * Based on reference: .blueprints/CAGED-music-theory-ref/caged-data.ts
 */

import type { NoteName, ChordQuality, CAGEDShapeName, CAGEDShape } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const STANDARD_TUNING: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low (string 0-5)

// Semitones from root for each interval
export const INTERVALS = {
  'R': 0,
  '3': 4,    // Major 3rd
  'b3': 3,   // Minor 3rd
  '5': 7,    // Perfect 5th
  'b5': 6,   // Diminished 5th
  '#5': 8,   // Augmented 5th
} as const;

// Chord formulas (intervals from root)
export const CHORD_FORMULAS: Record<ChordQuality, Array<'R' | '3' | 'b3' | '5' | 'b5' | '#5'>> = {
  major: ['R', '3', '5'],
  minor: ['R', 'b3', '5'],
  diminished: ['R', 'b3', 'b5'],
  augmented: ['R', '3', '#5'],
};

// The order shapes appear going UP the neck (towards higher frets)
export const CAGED_ORDER: CAGEDShapeName[] = ['E', 'D', 'C', 'A', 'G'];

// Semitone gaps between adjacent shapes (E→D→C→A→G→E)
export const SHAPE_GAPS: Record<CAGEDShapeName, number> = {
  'E': 2,  // E to D
  'D': 3,  // D to C
  'C': 2,  // C to A
  'A': 3,  // A to G
  'G': 2,  // G to E (wraps around)
};

// Where the E-shape anchor lands for each root note (fret on 6th string)
export const E_SHAPE_ROOT_FRETS: Record<NoteName, number> = {
  'E': 0, 'F': 1, 'F#': 2, 'G': 3, 'G#': 4, 'A': 5,
  'A#': 6, 'B': 7, 'C': 8, 'C#': 9, 'D': 10, 'D#': 11,
};

/**
 * Colors for each CAGED shape (for visualization)
 * Matching the reference image colors
 */
export const CAGED_COLORS: Record<CAGEDShapeName, { fill: string; stroke: string; text: string }> = {
  'C': { fill: 'rgba(59, 130, 246, 0.15)', stroke: '#3b82f6', text: '#3b82f6' },      // Blue
  'A': { fill: 'rgba(249, 115, 22, 0.15)', stroke: '#f97316', text: '#f97316' },      // Orange
  'G': { fill: 'rgba(34, 197, 94, 0.15)', stroke: '#22c55e', text: '#22c55e' },       // Green
  'E': { fill: 'rgba(168, 85, 247, 0.15)', stroke: '#a855f7', text: '#a855f7' },      // Purple
  'D': { fill: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444', text: '#ef4444' },       // Red
};

/**
 * Colors for intervals (for note markers)
 */
export const INTERVAL_COLORS: Record<string, string> = {
  'R': '#e74c3c',    // Root - Red
  '3': '#3498db',    // Major 3rd - Blue
  'b3': '#9b59b6',   // Minor 3rd - Purple
  '5': '#2ecc71',    // Perfect 5th - Green
  'b5': '#e67e22',   // Diminished 5th - Orange
  '#5': '#1abc9c',   // Augmented 5th - Teal
};

