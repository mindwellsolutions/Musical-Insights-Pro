/**
 * Triad Theory Library
 * Defines triad types, interval patterns, and music theory for triads
 */

export type TriadType = 'major' | 'minor' | 'diminished' | 'augmented';
export type TriadInversion = 'root' | 'first' | 'second';
export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * Interval patterns for each triad type (in semitones from root)
 */
export const TRIAD_INTERVALS: Record<TriadType, number[]> = {
  major: [0, 4, 7],        // Root, Major 3rd, Perfect 5th
  minor: [0, 3, 7],        // Root, Minor 3rd, Perfect 5th
  diminished: [0, 3, 6],   // Root, Minor 3rd, Diminished 5th
  augmented: [0, 4, 8],    // Root, Major 3rd, Augmented 5th
};

/**
 * Display names for triad types
 */
export const TRIAD_DISPLAY_NAMES: Record<TriadType, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
};

/**
 * Chord symbols for triad types
 */
export const TRIAD_SYMBOLS: Record<TriadType, string> = {
  major: '',           // C (no symbol for major)
  minor: 'm',          // Cm
  diminished: 'dim',   // Cdim or C°
  augmented: 'aug',    // Caug or C+
};

/**
 * Inversion interval patterns (which note is in the bass)
 */
export const INVERSION_BASS_INTERVALS: Record<TriadInversion, number> = {
  root: 0,    // Root position: root in bass
  first: 1,   // First inversion: 3rd in bass
  second: 2,  // Second inversion: 5th in bass
};

/**
 * CAGED shape color palette
 */
export const CAGED_COLORS: Record<CAGEDShape, string> = {
  C: '#FF6B6B',  // Coral Red
  A: '#4ECDC4',  // Turquoise
  G: '#FFE66D',  // Sunny Yellow
  E: '#95E1D3',  // Mint Green
  D: '#C7CEEA',  // Lavender Blue
};

/**
 * Position-based color palette for triad visualization
 * These colors are used to distinguish different triad positions on the fretboard
 * Separate from CAGED colors to avoid confusion
 */
export const POSITION_COLORS = [
  '#FF6B9D',  // Pink
  '#4ECDC4',  // Turquoise
  '#FFE66D',  // Yellow
  '#95E1D3',  // Mint
  '#C77DFF',  // Purple
  '#FF9F1C',  // Orange
  '#2EC4B6',  // Teal
  '#E63946',  // Red
  '#06FFA5',  // Bright Green
  '#118AB2',  // Blue
  '#FFB703',  // Gold
  '#FB5607',  // Bright Orange
  '#8338EC',  // Violet
  '#3A86FF',  // Sky Blue
  '#FF006E',  // Magenta
  '#06D6A0',  // Seafoam
  '#EF476F',  // Coral
  '#FFD60A',  // Bright Yellow
  '#06A77D',  // Green
  '#9D4EDD',  // Lavender
];

/**
 * Get a color for a specific position index
 */
export function getPositionColor(positionIndex: number): string {
  return POSITION_COLORS[positionIndex % POSITION_COLORS.length];
}

/**
 * Normalize flat notes to their sharp equivalents for consistent processing
 * Maps flat notes (Db, Eb, Gb, Ab, Bb) to sharp notes (C#, D#, F#, G#, A#)
 */
export function normalizeNoteToSharp(note: string): string {
  // Trim and handle case-insensitive input
  const trimmedNote = note.trim();

  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'db': 'C#',
    'D♭': 'C#',
    'Eb': 'D#',
    'eb': 'D#',
    'E♭': 'D#',
    'Gb': 'F#',
    'gb': 'F#',
    'G♭': 'F#',
    'Ab': 'G#',
    'ab': 'G#',
    'A♭': 'G#',
    'Bb': 'A#',
    'bb': 'A#',
    'B♭': 'A#',
  };

  return flatToSharp[trimmedNote] || trimmedNote;
}

/**
 * Get the notes of a triad given root note and triad type
 */
export function getTriadNotes(rootNote: string, triadType: TriadType): string[] {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalize flat notes to sharp equivalents
  const normalizedRoot = normalizeNoteToSharp(rootNote);
  const rootIndex = NOTES.indexOf(normalizedRoot);

  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote} (normalized to ${normalizedRoot})`);
  }

  const intervals = TRIAD_INTERVALS[triadType];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Get the chord symbol for a triad
 */
export function getTriadSymbol(rootNote: string, triadType: TriadType): string {
  return `${rootNote}${TRIAD_SYMBOLS[triadType]}`;
}

/**
 * Get the notes of a triad in a specific inversion
 */
export function getTriadNotesWithInversion(
  rootNote: string,
  triadType: TriadType,
  inversion: TriadInversion
): string[] {
  const notes = getTriadNotes(rootNote, triadType);
  
  switch (inversion) {
    case 'root':
      return notes; // [Root, 3rd, 5th]
    case 'first':
      return [notes[1], notes[2], notes[0]]; // [3rd, 5th, Root]
    case 'second':
      return [notes[2], notes[0], notes[1]]; // [5th, Root, 3rd]
  }
}

/**
 * Determine which chord tone a note is (root, third, or fifth)
 */
export function getTriadChordToneType(
  note: string,
  rootNote: string,
  triadType: TriadType
): 'root' | 'third' | 'fifth' | null {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalize flat notes to sharp equivalents
  const normalizedRoot = normalizeNoteToSharp(rootNote);
  const normalizedNote = normalizeNoteToSharp(note);

  const rootIndex = NOTES.indexOf(normalizedRoot);
  const noteIndex = NOTES.indexOf(normalizedNote);

  if (rootIndex === -1 || noteIndex === -1) return null;

  const interval = (noteIndex - rootIndex + 12) % 12;
  const intervals = TRIAD_INTERVALS[triadType];

  if (interval === intervals[0]) return 'root';
  if (interval === intervals[1]) return 'third';
  if (interval === intervals[2]) return 'fifth';

  return null;
}

/**
 * Get all triad types
 */
export function getAllTriadTypes(): TriadType[] {
  return ['major', 'minor', 'diminished', 'augmented'];
}

/**
 * Get all inversions
 */
export function getAllInversions(): TriadInversion[] {
  return ['root', 'first', 'second'];
}

/**
 * Get all CAGED shapes
 */
export function getAllCAGEDShapes(): CAGEDShape[] {
  return ['C', 'A', 'G', 'E', 'D'];
}

/**
 * Get display name for inversion
 */
export function getInversionDisplayName(inversion: TriadInversion): string {
  switch (inversion) {
    case 'root':
      return 'Root Position';
    case 'first':
      return '1st Inversion';
    case 'second':
      return '2nd Inversion';
  }
}

