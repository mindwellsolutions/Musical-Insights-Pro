import { EXTENDED_SCALE_INTERVALS } from './musicalCompatibility';
import type { TriadMembershipEntry } from './music-theory/triad-membership/types';

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Display notes using sharp notation
export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Display notes using flat notation (for UI display only)
export const NOTES_DISPLAY = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Get the display notes array based on notation preference
 * @param notation - 'sharp' or 'flat'
 * @returns Array of note names in the specified notation
 */
export function getNotesDisplay(notation: 'sharp' | 'flat' = 'flat'): string[] {
  return notation === 'sharp' ? NOTES_SHARP : NOTES_DISPLAY;
}

// Chord tone hierarchy colors
export const CHORD_TONE_COLORS = {
  root: '#E85555',    // Red
  third: '#F5BC3C',   // Yellow/Gold
  fifth: '#5DB572',   // Green
  seventh: '#A07ED4', // Purple
};

// Colors for all 12 chromatic intervals (semitones from root)
// Consistent with CHORD_TONE_COLORS for Root (0), M3 (4), P5 (7), M7 (11)
// b2 (1), b5/Tritone (6), and b7 (10) use distinct non-conflicting colors
// so that Orange = 3rd only, Green = 5th only, Purple = 7th only.
export const ALL_INTERVAL_COLORS: Record<number, string> = {
  0: '#E85555',   // Root (P1)        - Red          (matches CHORD_TONE_COLORS.root)
  1: '#F43F5E',   // b2 (m2)          - Rose
  2: '#FCD34D',   // 2nd (M2)         - Pale Yellow
  3: '#86EFAC',   // b3 (m3)          - Mint Green
  4: '#F5BC3C',   // 3rd (M3)         - Yellow/Gold  (matches CHORD_TONE_COLORS.third)
  5: '#3B9ED4',   // 4th (P4)         - Blue
  6: '#D946EF',   // b5 / Tritone     - Fuchsia/Magenta
  7: '#5DB572',   // 5th (P5)         - Green        (matches CHORD_TONE_COLORS.fifth)
  8: '#F472B6',   // b6 (m6)          - Pink
  9: '#34D399',   // 6th (M6)         - Emerald
  10: '#818CF8',  // b7 (m7)          - Periwinkle/Indigo
  11: '#A07ED4',  // 7th (M7)         - Lavender     (matches CHORD_TONE_COLORS.seventh)
};

// Interval label names by semitone from root
export const INTERVAL_NAMES: Record<number, string> = {
  0: '1',   // Root
  1: 'b2',  // Minor 2nd
  2: '2',   // Major 2nd
  3: 'b3',  // Minor 3rd
  4: '3',   // Major 3rd
  5: '4',   // Perfect 4th
  6: 'b5',  // Tritone
  7: '5',   // Perfect 5th
  8: 'b6',  // Minor 6th
  9: '6',   // Major 6th
  10: 'b7', // Minor 7th
  11: '7',  // Major 7th
};

// Highlight colors for chord tones and guide tones
export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Hot Pink', value: '#ec4899' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Indigo', value: '#6366f1' },
];

// Mapping from display notes (flat) to internal notes (sharp)
export const DISPLAY_NOTE_TO_INTERNAL: Record<string, string> = {
  'C': 'C',
  'Db': 'C#',
  'D': 'D',
  'Eb': 'D#',
  'E': 'E',
  'F': 'F',
  'Gb': 'F#',
  'G': 'G',
  'Ab': 'G#',
  'A': 'A',
  'Bb': 'A#',
  'B': 'B',
};

// Mapping from internal notes (sharp) to display notes (flat)
export const INTERNAL_NOTE_TO_DISPLAY: Record<string, string> = {
  'C': 'C',
  'C#': 'Db',
  'D': 'D',
  'D#': 'Eb',
  'E': 'E',
  'F': 'F',
  'F#': 'Gb',
  'G': 'G',
  'G#': 'Ab',
  'A': 'A',
  'A#': 'Bb',
  'B': 'B',
};

/**
 * Convert display note (flat notation) to internal note (sharp notation)
 * Used when receiving input from UI components
 */
export function normalizeNoteFromDisplay(displayNote: string): string {
  return DISPLAY_NOTE_TO_INTERNAL[displayNote] || displayNote;
}

/**
 * Convert internal note (sharp notation) to display note based on notation preference
 * Used when showing notes in UI components
 * @param internalNote - The internal note in sharp notation (e.g., 'C#', 'D#')
 * @param notation - 'sharp' to display sharps, 'flat' to display flats (default: 'flat')
 */
export function getNoteDisplayName(internalNote: string, notation: 'sharp' | 'flat' = 'flat'): string {
  if (notation === 'sharp') {
    // Return the note as-is (already in sharp notation)
    return internalNote;
  }
  // Return flat notation
  return INTERNAL_NOTE_TO_DISPLAY[internalNote] || internalNote;
}

export const SCALE_INTERVALS: Record<string, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Aeolian': [0, 2, 3, 5, 7, 8, 10],
  'Locrian': [0, 1, 3, 5, 6, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Extended Pentatonic Major': [0, 2, 4, 7, 9, 11],
  'Extended Pentatonic Minor': [0, 2, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
};

export const TUNINGS = {
  6: {
    'Standard': ['E', 'A', 'D', 'G', 'B', 'E'],
    'Drop D': ['D', 'A', 'D', 'G', 'B', 'E'],
    'Half Step Down': ['D#', 'G#', 'C#', 'F#', 'A#', 'D#'],
  },
  7: {
    'Standard': ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
    'Drop A': ['A', 'E', 'A', 'D', 'G', 'B', 'E'],
  },
};

export interface NotePosition {
  stringIndex: number;
  fretNumber: number;
  note: string;
  isRoot: boolean;
  isHarmonyNote?: boolean;  // Indicates if this is a harmony note (not original scale note)
  harmonyType?: '3rds' | '5ths' | '6ths' | '7ths';  // Type of harmony if isHarmonyNote is true
  originalNote?: string;  // For harmony notes, which original note this harmonizes with
  chordTone?: 'root' | 'third' | 'fifth' | 'seventh';  // For triad/chord mode: which chord tone this note represents
  customColor?: string;  // Custom color for special overlays (e.g., nearby chords) - DEPRECATED: use sharedChordColors instead
  sharedChordColors?: string[];  // Array of colors for notes shared by multiple nearby chords (for multi-ring display)
  // Triad Arc Band & Focus Mode — populated by page.tsx useMemo when features are active
  triadMembership?: TriadMembershipEntry[];
}

export function getNoteAtFret(openNote: string, fret: number): string {
  const noteIndex = NOTES.indexOf(openNote);
  return NOTES[(noteIndex + fret) % 12];
}

export function getScaleNotes(rootNote: string, scaleName: string): string[] {
  // Try extended intervals first, then fall back to basic intervals
  const intervals = EXTENDED_SCALE_INTERVALS[scaleName] || SCALE_INTERVALS[scaleName];
  if (!intervals) return [];

  const rootIndex = NOTES.indexOf(rootNote);
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Get scale with both notes and intervals
 * Used by overlapping-chords functionality
 */
export function getScale(rootNote: string, scaleName: string): { notes: string[], intervals: number[] } {
  const intervals = EXTENDED_SCALE_INTERVALS[scaleName] || SCALE_INTERVALS[scaleName];
  if (!intervals) {
    throw new Error(`Unknown scale: ${scaleName}`);
  }

  const rootIndex = NOTES.indexOf(rootNote);
  const notes = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

  return { notes, intervals };
}

export function calculateScalePositions(
  rootNote: string,
  scaleName: string,
  tuning: string[],
  maxFrets: number = 24
): NotePosition[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const positions: NotePosition[] = [];

  tuning.forEach((openNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const note = getNoteAtFret(openNote, fret);
      if (scaleNotes.includes(note)) {
        positions.push({
          stringIndex,
          fretNumber: fret,
          note,
          isRoot: note === rootNote,
        });
      }
    }
  });

  return positions;
}

/**
 * Get harmonized notes for a scale
 * Returns the notes that are a specific interval above each scale degree
 * @param rootNote - The root note of the scale
 * @param scaleName - The name of the scale
 * @param harmonizationType - The type of harmonization (3rds, 5ths, 6ths, 7ths)
 * @returns Array of harmony notes
 */
export function getHarmonizedNotes(
  rootNote: string,
  scaleName: string,
  harmonizationType: '3rds' | '5ths' | '6ths' | '7ths'
): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const intervalMap = {
    '3rds': 2,  // Third interval (2 scale degrees up)
    '5ths': 4,  // Fifth interval (4 scale degrees up)
    '6ths': 5,  // Sixth interval (5 scale degrees up)
    '7ths': 6,  // Seventh interval (6 scale degrees up)
  };
  const interval = intervalMap[harmonizationType];

  // Map each scale note to its harmony note
  return scaleNotes.map((_, index) => {
    const harmonizedIndex = (index + interval) % scaleNotes.length;
    return scaleNotes[harmonizedIndex];
  });
}

/**
 * Get the harmony note for a specific original note
 * Returns which note harmonizes with the given note at the specified interval
 */
export function getHarmonyNoteForOriginal(
  originalNote: string,
  rootNote: string,
  scaleName: string,
  harmonizationType: '3rds' | '5ths' | '6ths' | '7ths'
): string {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const noteIndex = scaleNotes.indexOf(originalNote);

  if (noteIndex === -1) return originalNote; // Not in scale

  const intervalMap = {
    '3rds': 2,
    '5ths': 4,
    '6ths': 5,
    '7ths': 6,
  };

  const interval = intervalMap[harmonizationType];
  const harmonyIndex = (noteIndex + interval) % scaleNotes.length;

  return scaleNotes[harmonyIndex];
}

/**
 * Calculate scale positions with harmonization relationships
 * - 'original': Shows only the original scale notes
 * - '3rds'/'5ths'/'6ths'/'7ths': Shows BOTH original and harmony notes with relationship data
 *
 * @param rootNote - The root note of the scale
 * @param scaleName - The name of the scale
 * @param tuning - The guitar tuning
 * @param harmonizationType - The type of harmonization ('original', '3rds', '5ths', '6ths', '7ths')
 * @param maxFrets - Maximum number of frets to calculate
 * @returns Array of note positions with harmony relationship data
 */
export function calculateCombinedScalePositions(
  rootNote: string,
  scaleName: string,
  tuning: string[],
  harmonizationType: 'original' | '3rds' | '5ths' | '6ths' | '7ths',
  maxFrets: number = 24
): NotePosition[] {
  if (harmonizationType === 'original') {
    // Show only original scale notes
    return calculateScalePositions(rootNote, scaleName, tuning, maxFrets);
  }

  // For harmonization modes, show BOTH original and harmony notes
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const originalPositions = calculateScalePositions(rootNote, scaleName, tuning, maxFrets);

  // Mark original positions
  const markedOriginalPositions = originalPositions.map(pos => ({
    ...pos,
    isHarmonyNote: false,
    harmonyType: undefined,
  }));

  // Calculate harmony positions with original note tracking
  const harmonyPositions: NotePosition[] = [];
  tuning.forEach((openNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const note = getNoteAtFret(openNote, fret);

      // Check if this note is a harmony note for any scale note
      scaleNotes.forEach((scaleNote) => {
        const harmonyNote = getHarmonyNoteForOriginal(scaleNote, rootNote, scaleName, harmonizationType);

        if (note === harmonyNote) {
          harmonyPositions.push({
            stringIndex,
            fretNumber: fret,
            note,
            isRoot: note === rootNote,
            isHarmonyNote: true,
            harmonyType: harmonizationType,
            originalNote: scaleNote,  // Track which original note this harmonizes with
          });
        }
      });
    }
  });

  // Remove duplicates from harmony positions, keeping track of all original notes
  const uniqueHarmonyPositions = harmonyPositions.filter((pos, index, self) =>
    index === self.findIndex(p => p.stringIndex === pos.stringIndex && p.fretNumber === pos.fretNumber)
  );

  // Combine both sets
  return [...markedOriginalPositions, ...uniqueHarmonyPositions];
}

export const NOTE_COLORS: Record<string, string> = {
  // Sharp notation (internal)
  'C': '#ef4444',
  'C#': '#f97316',
  'D': '#f59e0b',
  'D#': '#eab308',
  'E': '#84cc16',
  'F': '#22c55e',
  'F#': '#10b981',
  'G': '#14b8a6',
  'G#': '#06b6d4',
  'A': '#0ea5e9',
  'A#': '#3b82f6',
  'B': '#6366f1',
  // Flat notation (display) - same colors as their sharp equivalents
  'Db': '#f97316',  // Same as C#
  'Eb': '#eab308',  // Same as D#
  'Gb': '#10b981',  // Same as F#
  'Ab': '#06b6d4',  // Same as G#
  'Bb': '#3b82f6',  // Same as A#
};

export interface ChordInfo {
  degree: string;
  chord: string;
  quality: string;
  notes: string[];
}

const CHORD_QUALITIES: Record<string, string[]> = {
  'Major': ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
  'Minor': ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
  'Harmonic Minor': ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
  'Melodic Minor': ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
  'Dorian': ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj'],
  'Phrygian': ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min'],
  'Lydian': ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min'],
  'Mixolydian': ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj'],
  'Aeolian': ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
  'Locrian': ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min'],
  'Pentatonic Major': ['maj', 'min', 'min', 'maj', 'min'],
  'Pentatonic Minor': ['min', 'maj', 'min', 'min', 'maj'],
  'Blues': ['min', 'maj', 'min', 'dim', 'min', 'maj'],
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_NUMERALS_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

export function getGuideTones(rootNote: string, quality: string): string[] {
  const chordTones = getChordTones(rootNote, quality);
  const rootIndex = NOTES.indexOf(rootNote);

  let thirdInterval: number;
  let seventhInterval: number | null = null;

  switch (quality) {
    case 'maj':
    case 'aug':
      thirdInterval = 4;
      break;
    case 'min':
    case 'dim':
      thirdInterval = 3;
      break;
    case 'maj7':
      thirdInterval = 4;
      seventhInterval = 11;
      break;
    case 'min7':
      thirdInterval = 3;
      seventhInterval = 10;
      break;
    case 'dom7':
      thirdInterval = 4;
      seventhInterval = 10;
      break;
    case 'dim7':
      thirdInterval = 3;
      seventhInterval = 9;
      break;
    case 'min7b5':
      thirdInterval = 3;
      seventhInterval = 10;
      break;
    case 'maj9':
    case 'maj11':
    case 'maj13':
      thirdInterval = 4;
      seventhInterval = 11;
      break;
    case 'min9':
    case 'min11':
    case 'min13':
      thirdInterval = 3;
      seventhInterval = 10;
      break;
    case 'dom9':
    case 'dom11':
    case 'dom13':
      thirdInterval = 4;
      seventhInterval = 10;
      break;
    case 'sus2':
      thirdInterval = 2;
      break;
    case 'sus4':
      thirdInterval = 5;
      break;
    case '6':
      thirdInterval = 4;
      break;
    case 'min6':
      thirdInterval = 3;
      break;
    case 'add9':
      thirdInterval = 4;
      break;
    case 'minadd9':
      thirdInterval = 3;
      break;
    default:
      thirdInterval = 4;
  }

  const guideTones: string[] = [];
  const third = NOTES[(rootIndex + thirdInterval) % 12];
  guideTones.push(third);

  if (seventhInterval !== null) {
    const seventh = NOTES[(rootIndex + seventhInterval) % 12];
    guideTones.push(seventh);
  }

  return guideTones;
}

export function getChordTones(rootNote: string, quality: string): string[] {
  const rootIndex = NOTES.indexOf(rootNote);

  let intervals: number[];
  switch (quality) {
    case 'maj':
      intervals = [0, 4, 7];
      break;
    case 'min':
      intervals = [0, 3, 7];
      break;
    case 'dim':
      intervals = [0, 3, 6];
      break;
    case 'aug':
      intervals = [0, 4, 8];
      break;
    case 'maj7':
      intervals = [0, 4, 7, 11];
      break;
    case 'min7':
      intervals = [0, 3, 7, 10];
      break;
    case 'dom7':
      intervals = [0, 4, 7, 10];
      break;
    case 'dim7':
      intervals = [0, 3, 6, 9];
      break;
    case 'min7b5':
      intervals = [0, 3, 6, 10];
      break;
    case 'maj9':
      intervals = [0, 4, 7, 11, 14];
      break;
    case 'min9':
      intervals = [0, 3, 7, 10, 14];
      break;
    case 'dom9':
      intervals = [0, 4, 7, 10, 14];
      break;
    case 'maj11':
      intervals = [0, 4, 7, 11, 14, 17];
      break;
    case 'min11':
      intervals = [0, 3, 7, 10, 14, 17];
      break;
    case 'dom11':
      intervals = [0, 4, 7, 10, 14, 17];
      break;
    case 'maj13':
      intervals = [0, 4, 7, 11, 14, 17, 21];
      break;
    case 'min13':
      intervals = [0, 3, 7, 10, 14, 17, 21];
      break;
    case 'dom13':
      intervals = [0, 4, 7, 10, 14, 17, 21];
      break;
    case 'sus2':
      intervals = [0, 2, 7];
      break;
    case 'sus4':
      intervals = [0, 5, 7];
      break;
    case '6':
      intervals = [0, 4, 7, 9];
      break;
    case 'min6':
      intervals = [0, 3, 7, 9];
      break;
    case 'add9':
      intervals = [0, 4, 7, 14];
      break;
    case 'minadd9':
      intervals = [0, 3, 7, 14];
      break;
    default:
      intervals = [0, 4, 7];
  }

  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

export function getChordProgressions(rootNote: string, scaleName: string): ChordInfo[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const qualities = CHORD_QUALITIES[scaleName];

  if (!qualities || scaleNotes.length === 0) return [];

  return scaleNotes.map((note, index) => {
    const quality = qualities[index] || 'maj';
    const isMinorOrDim = quality === 'min' || quality === 'dim';
    const numeral = isMinorOrDim ? ROMAN_NUMERALS_LOWER[index] : ROMAN_NUMERALS[index];
    const suffix = quality === 'dim' ? '°' : quality === 'aug' ? '+' : quality === 'maj' ? '' : 'm';
    const chordTones = getChordTones(note, quality);

    return {
      degree: numeral + (quality === 'dim' ? '°' : ''),
      chord: note + suffix,
      quality: quality,
      notes: chordTones,
    };
  });
}

/**
 * Get the tonic chord tones for a given key and scale
 * Returns a 7th chord (root, third, fifth, seventh) for the tonic
 */
export function getTonicChordTones(rootNote: string, scaleName: string): string[] {
  // Normalize scale name to handle both display names and database keys
  let normalizedScaleName = scaleName;

  // Map display names to database keys for CHORD_QUALITIES lookup
  const scaleNameMap: Record<string, string> = {
    'Ionian (Major)': 'Major',
    'Aeolian (Natural Minor)': 'Minor',
    'Ionian': 'Major',
    'Aeolian': 'Minor',
  };

  if (scaleNameMap[scaleName]) {
    normalizedScaleName = scaleNameMap[scaleName];
  }

  const qualities = CHORD_QUALITIES[normalizedScaleName];

  if (!qualities || qualities.length === 0) {
    // Default to major 7th if no quality found
    return getChordTones(rootNote, 'maj7');
  }

  // Get the quality of the tonic chord (first chord in the scale)
  const tonicQuality = qualities[0];

  // Convert to 7th chord quality
  let seventhQuality: string;
  switch (tonicQuality) {
    case 'maj':
      seventhQuality = 'maj7';
      break;
    case 'min':
      seventhQuality = 'min7';
      break;
    case 'dim':
      seventhQuality = 'dim7';
      break;
    case 'aug':
      seventhQuality = 'maj7'; // Augmented typically uses major 7th
      break;
    default:
      seventhQuality = 'maj7';
  }

  return getChordTones(rootNote, seventhQuality);
}
