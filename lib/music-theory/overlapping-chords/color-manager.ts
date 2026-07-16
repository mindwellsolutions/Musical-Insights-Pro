/**
 * Overlapping Chords Feature - Color Manager
 * Assigns distinct colors to selected chords for fretboard display
 */

import { OverlappingChord, ChordColorAssignment } from './types';

/**
 * Color palette for chord visualization
 * These colors are chosen for good contrast and visibility
 */
export const CHORD_COLOR_PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
  '#6366f1', // indigo
];

/**
 * Assign colors to selected chords
 * @param selectedChords Array of selected chords
 * @returns Array of color assignments
 */
export function assignChordColors(
  selectedChords: OverlappingChord[]
): ChordColorAssignment[] {
  return selectedChords.map((chord, index) => ({
    chordId: `${chord.rootNote}-${chord.quality}`,
    color: CHORD_COLOR_PALETTE[index % CHORD_COLOR_PALETTE.length],
  }));
}

/**
 * Get a color for a specific chord index
 * @param index Index of the chord in the selection
 * @returns Hex color code
 */
export function getChordColor(index: number): string {
  return CHORD_COLOR_PALETTE[index % CHORD_COLOR_PALETTE.length];
}

/**
 * Generate a unique ID for a chord
 * @param rootNote Root note of the chord
 * @param quality Chord quality
 * @returns Unique chord identifier
 */
export function getChordId(rootNote: string, quality: string): string {
  return `${rootNote}-${quality}`;
}

