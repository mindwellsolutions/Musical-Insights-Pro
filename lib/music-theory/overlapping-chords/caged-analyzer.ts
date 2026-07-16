/**
 * Overlapping Chords Feature - CAGED Analyzer
 * Analyzes CAGED shape areas and determines note boundaries
 */

import { CAGEDShape, FretBoundary, FretNote } from './types';

/**
 * CAGED shape fret patterns relative to root position
 * Each shape defines the fret span and string range it covers
 */
const CAGED_SHAPE_PATTERNS: Record<CAGEDShape, {
  fretSpan: number;  // Number of frets the shape spans
  stringRange: [number, number];  // [min, max] string indices
  relativePositions: { string: number; fretOffset: number }[];  // Note positions relative to root
}> = {
  C: {
    fretSpan: 4,
    stringRange: [1, 5],  // Strings 2-6 (0-indexed: 1-5)
    relativePositions: [
      { string: 1, fretOffset: 0 },
      { string: 2, fretOffset: 0 },
      { string: 3, fretOffset: 2 },
      { string: 4, fretOffset: 3 },
      { string: 5, fretOffset: 3 },
    ],
  },
  A: {
    fretSpan: 4,
    stringRange: [0, 4],  // Strings 1-5 (0-indexed: 0-4)
    relativePositions: [
      { string: 0, fretOffset: 0 },
      { string: 1, fretOffset: 2 },
      { string: 2, fretOffset: 2 },
      { string: 3, fretOffset: 2 },
      { string: 4, fretOffset: 0 },
    ],
  },
  G: {
    fretSpan: 4,
    stringRange: [0, 5],  // All strings
    relativePositions: [
      { string: 0, fretOffset: 3 },
      { string: 1, fretOffset: 2 },
      { string: 2, fretOffset: 0 },
      { string: 3, fretOffset: 0 },
      { string: 4, fretOffset: 0 },
      { string: 5, fretOffset: 3 },
    ],
  },
  E: {
    fretSpan: 4,
    stringRange: [0, 5],  // All strings
    relativePositions: [
      { string: 0, fretOffset: 0 },
      { string: 1, fretOffset: 2 },
      { string: 2, fretOffset: 2 },
      { string: 3, fretOffset: 1 },
      { string: 4, fretOffset: 0 },
      { string: 5, fretOffset: 0 },
    ],
  },
  D: {
    fretSpan: 4,
    stringRange: [1, 4],  // Strings 2-5 (0-indexed: 1-4)
    relativePositions: [
      { string: 1, fretOffset: 0 },
      { string: 2, fretOffset: 2 },
      { string: 3, fretOffset: 3 },
      { string: 4, fretOffset: 2 },
    ],
  },
};

/**
 * Get fret boundaries for a CAGED shape at a specific position
 * @param shape CAGED shape (C, A, G, E, or D)
 * @param position Root fret position (0-12)
 * @returns Fret boundary object
 */
export function getCagedFretBoundaries(
  shape: CAGEDShape,
  position: number
): FretBoundary {
  const pattern = CAGED_SHAPE_PATTERNS[shape];
  
  return {
    minFret: position,
    maxFret: position + pattern.fretSpan,
    minString: pattern.stringRange[0],
    maxString: pattern.stringRange[1],
  };
}

/**
 * Check if a note falls within any CAGED boundary
 * @param note Fret note to check
 * @param boundaries Array of fret boundaries
 * @returns True if note is within any boundary
 */
export function isNoteInCagedArea(
  note: FretNote,
  boundaries: FretBoundary[]
): boolean {
  return boundaries.some(boundary =>
    note.fret >= boundary.minFret &&
    note.fret <= boundary.maxFret &&
    note.string >= boundary.minString &&
    note.string <= boundary.maxString
  );
}

/**
 * Get all notes within selected CAGED areas
 * @param shapes Selected CAGED shapes
 * @param positions Fret positions for each shape
 * @param tuning Guitar tuning (default: standard tuning)
 * @returns Array of fret notes within the CAGED areas
 */
export function getCagedAreaNotes(
  shapes: CAGEDShape[],
  positions: Record<CAGEDShape, number>,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): FretNote[] {
  const notes: FretNote[] = [];
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (const shape of shapes) {
    const boundary = getCagedFretBoundaries(shape, positions[shape]);
    
    // Generate all notes within this boundary
    for (let string = boundary.minString; string <= boundary.maxString; string++) {
      for (let fret = boundary.minFret; fret <= boundary.maxFret; fret++) {
        // Calculate the note at this position
        const openStringNote = tuning[string];
        const openStringIndex = NOTES.indexOf(openStringNote);
        const noteIndex = (openStringIndex + fret) % 12;
        const note = NOTES[noteIndex];
        
        notes.push({ string, fret, note });
      }
    }
  }

  return notes;
}

