/**
 * CAGED System Data Definitions
 * 
 * This file defines the 5 CAGED shapes for Major, Minor, Diminished, and Augmented chords.
 * Each shape is defined with note positions relative to the shape's anchor fret.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented';
export type CAGEDShapeName = 'C' | 'A' | 'G' | 'E' | 'D';

export interface NotePosition {
  string: number;      // 0 = high E, 5 = low E
  fretOffset: number;  // Offset from the shape's anchor fret
  interval: 'R' | '3' | 'b3' | '5' | 'b5' | '#5';  // What interval this note represents
}

export interface CAGEDShape {
  name: CAGEDShapeName;
  notes: NotePosition[];
  // The anchor is defined by which string and fret offset contains the "primary" root
  anchorString: number;  // Which string the primary root is on (for positioning)
  anchorFretOffset: number;  // Fret offset of the anchor root within the shape
  // Bounding box for drawing the outline
  minFretOffset: number;
  maxFretOffset: number;
}

export interface CAGEDShapeSet {
  major: CAGEDShape;
  minor: CAGEDShape;
  diminished: CAGEDShape;
  augmented: CAGEDShape;
}

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
// These represent how many frets you move up to get to the next shape's anchor
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

// ============================================================================
// SHAPE DEFINITIONS
// ============================================================================

/**
 * E Shape - Root on 6th string (and 1st string)
 * This is the classic "E major/minor" barre chord shape
 */
const E_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },   // Low E - Root
      { string: 4, fretOffset: 2, interval: '5' },   // A string - 5th
      { string: 3, fretOffset: 2, interval: 'R' },   // D string - Root
      { string: 2, fretOffset: 1, interval: '3' },   // G string - 3rd
      { string: 1, fretOffset: 0, interval: '5' },   // B string - 5th
      { string: 0, fretOffset: 0, interval: 'R' },   // High E - Root
    ],
  },
  minor: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '5' },
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 0, interval: 'b3' },  // Flattened 3rd
      { string: 1, fretOffset: 0, interval: '5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  diminished: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b5' },  // Flattened 5th
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 0, interval: 'b3' },
      { string: 1, fretOffset: 0, interval: 'b5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  augmented: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 3, interval: '#5' },  // Augmented 5th
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 1, interval: '3' },
      { string: 1, fretOffset: 1, interval: '#5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
};

/**
 * D Shape - Root on 4th string
 * Based on open D chord shape
 */
const D_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },   // D string - Root
      { string: 2, fretOffset: 2, interval: '3' },   // G string - 3rd
      { string: 1, fretOffset: 3, interval: '5' },   // B string - 5th
      { string: 0, fretOffset: 2, interval: 'R' },   // High E - Root
    ],
  },
  minor: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: 'b3' },
      { string: 1, fretOffset: 3, interval: '5' },
      { string: 0, fretOffset: 1, interval: 'R' },
    ],
  },
  diminished: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: 'b3' },
      { string: 1, fretOffset: 2, interval: 'b5' },
      { string: 0, fretOffset: 1, interval: 'R' },
    ],
  },
  augmented: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: '3' },
      { string: 1, fretOffset: 3, interval: '#5' },
      { string: 0, fretOffset: 2, interval: 'R' },
    ],
  },
};

/**
 * C Shape - Root on 5th string
 * Based on open C chord shape
 */
const C_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },   // A string - Root
      { string: 3, fretOffset: 2, interval: '3' },   // D string - 3rd
      { string: 2, fretOffset: 0, interval: '5' },   // G string - 5th
      { string: 1, fretOffset: 1, interval: 'R' },   // B string - Root
      { string: 0, fretOffset: 0, interval: '3' },   // High E - 3rd (optional)
    ],
  },
  minor: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b3' },
      { string: 2, fretOffset: 0, interval: '5' },
      { string: 1, fretOffset: 1, interval: 'R' },
      { string: 0, fretOffset: 0, interval: 'b3' },
    ],
  },
  diminished: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: -1,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b3' },
      { string: 2, fretOffset: -1, interval: 'b5' },
      { string: 1, fretOffset: 1, interval: 'R' },
    ],
  },
  augmented: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '3' },
      { string: 2, fretOffset: 1, interval: '#5' },
      { string: 1, fretOffset: 1, interval: 'R' },
      { string: 0, fretOffset: 0, interval: '3' },
    ],
  },
};

/**
 * A Shape - Root on 5th string
 * Based on open A chord shape - common barre chord
 */
const A_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },   // A string - Root
      { string: 3, fretOffset: 2, interval: '5' },   // D string - 5th
      { string: 2, fretOffset: 2, interval: 'R' },   // G string - Root
      { string: 1, fretOffset: 2, interval: '3' },   // B string - 3rd
      { string: 0, fretOffset: 0, interval: '5' },   // High E - 5th
    ],
  },
  minor: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 1, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: '5' },
    ],
  },
  diminished: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 1, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: 'b5' },
    ],
  },
  augmented: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 3, interval: '#5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 2, interval: '3' },
      { string: 0, fretOffset: 1, interval: '#5' },
    ],
  },
};

/**
 * G Shape - Root on 6th string (and 1st string)
 * Based on open G chord shape - often simplified when used as barre
 */
const G_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 4,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },   // Low E - Root
      { string: 4, fretOffset: 2, interval: '3' },   // A string - 3rd
      { string: 3, fretOffset: 0, interval: '5' },   // D string - 5th
      { string: 2, fretOffset: 0, interval: 'R' },   // G string - Root
      { string: 1, fretOffset: 0, interval: '3' },   // B string - 3rd (optional)
      { string: 0, fretOffset: 0, interval: 'R' },   // High E - Root
    ],
  },
  minor: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b3' },
      { string: 3, fretOffset: 0, interval: '5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 1, fretOffset: 0, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  diminished: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: -1,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b3' },
      { string: 3, fretOffset: -1, interval: 'b5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  augmented: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 4,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '3' },
      { string: 3, fretOffset: 1, interval: '#5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 1, fretOffset: 0, interval: '3' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All CAGED shapes organized by shape name
 */
export const CAGED_SHAPES: Record<CAGEDShapeName, Record<ChordQuality, CAGEDShape>> = {
  'C': C_SHAPES,
  'A': A_SHAPES,
  'G': G_SHAPES,
  'E': E_SHAPES,
  'D': D_SHAPES,
};

/**
 * Colors for each CAGED shape (for visualization)
 */
export const CAGED_COLORS: Record<CAGEDShapeName, { fill: string; stroke: string; text: string }> = {
  'C': { fill: 'rgba(231, 76, 60, 0.15)', stroke: '#e74c3c', text: '#e74c3c' },
  'A': { fill: 'rgba(243, 156, 18, 0.15)', stroke: '#f39c12', text: '#f39c12' },
  'G': { fill: 'rgba(46, 204, 113, 0.15)', stroke: '#2ecc71', text: '#2ecc71' },
  'E': { fill: 'rgba(52, 152, 219, 0.15)', stroke: '#3498db', text: '#3498db' },
  'D': { fill: 'rgba(155, 89, 182, 0.15)', stroke: '#9b59b6', text: '#9b59b6' },
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
