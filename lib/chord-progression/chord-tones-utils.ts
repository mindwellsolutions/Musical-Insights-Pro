/**
 * Chord Tones Computation Utility
 * Pure synchronous functions — no async, no fetching, no React hooks.
 * Covers all chord categories in CHORD_LIBRARY (Triads, 7th, Extended, Altered, Sus, Add).
 */

import { NOTE_COLORS, ALL_INTERVAL_COLORS } from '@/lib/musicTheory';

// Chromatic scale in sharp notation (indices 0–11)
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Map any note name (sharp or flat) to chromatic index 0–11
const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0,  'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,  'Fb': 4,
  'F': 5,  'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10,'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Short interval labels keyed by full semitone (including octave extensions)
const INTERVAL_LABEL: Record<number, string> = {
  0: 'R',   1: 'b2',  2: '2',   3: 'b3',  4: '3',
  5: '4',   6: 'b5',  7: '5',   8: '#5',  9: '6',
  10: 'b7', 11: '7',
  13: 'b9', 14: '9',  15: '#9', 17: '11', 18: '#11',
  20: 'b13',21: '13',
};

// Interval patterns keyed by quality suffix (after root note)
// Semitone values relative to root; extensions > 11 are octave-extended
const QUALITY_INTERVALS: Record<string, number[]> = {
  // ── Triads ────────────────────────────────────────────
  '':       [0, 4, 7],            // Major
  'm':      [0, 3, 7],            // Minor
  'dim':    [0, 3, 6],            // Diminished
  'aug':    [0, 4, 8],            // Augmented
  // ── 7th Chords ────────────────────────────────────────
  '7':      [0, 4, 7, 10],        // Dominant 7
  'maj7':   [0, 4, 7, 11],        // Major 7
  'm7':     [0, 3, 7, 10],        // Minor 7
  'mMaj7':  [0, 3, 7, 11],        // Minor Major 7
  'dim7':   [0, 3, 6, 9],         // Diminished 7
  'm7b5':   [0, 3, 6, 10],        // Half-Diminished (ø)
  // ── Extended ──────────────────────────────────────────
  '9':      [0, 4, 7, 10, 14],    // Dominant 9
  'maj9':   [0, 4, 7, 11, 14],    // Major 9
  'm9':     [0, 3, 7, 10, 14],    // Minor 9
  '11':     [0, 4, 7, 10, 14, 17],   // Dominant 11
  'maj11':  [0, 4, 7, 11, 14, 17],   // Major 11
  'm11':    [0, 3, 7, 10, 14, 17],   // Minor 11
  '13':     [0, 4, 7, 10, 14, 17, 21], // Dominant 13
  'maj13':  [0, 4, 7, 11, 14, 17, 21], // Major 13
  'm13':    [0, 3, 7, 10, 14, 17, 21], // Minor 13
  // ── Altered ───────────────────────────────────────────
  '7b5':    [0, 4, 6, 10],        // Dom7 b5
  '7#5':    [0, 4, 8, 10],        // Dom7 #5 / Aug7
  '7b9':    [0, 4, 7, 10, 13],    // Dom7 b9
  '7#9':    [0, 4, 7, 10, 15],    // Dom7 #9
  '7#11':   [0, 4, 7, 10, 14, 18], // Dom7 #11
  '7alt':   [0, 4, 6, 10, 13, 15], // Altered dominant
  // ── Sus ───────────────────────────────────────────────
  'sus2':   [0, 2, 7],            // Sus2
  'sus4':   [0, 5, 7],            // Sus4
  '7sus4':  [0, 5, 7, 10],        // Dom7 Sus4
  // ── Add ───────────────────────────────────────────────
  'add9':   [0, 4, 7, 14],        // Add9
  'add11':  [0, 4, 7, 17],        // Add11
  'madd9':  [0, 3, 7, 14],        // Minor Add9
  // ── 6th Chords ────────────────────────────────────────
  '6':      [0, 4, 7, 9],         // Major 6
  'm6':     [0, 3, 7, 9],         // Minor 6
};

export interface ChordToneDisplay {
  note: string;           // Sharp-notation note name for NOTE_COLORS lookup
  semitone: number;       // Octave-normalized semitone 0–11 for color lookup
  fullSemitone: number;   // Full semitone including extensions (e.g. 14 for 9th)
  intervalLabel: string;  // Short label: "R", "3", "b3", "5", "b7", "9", etc.
  noteColor: string;      // NOTE_COLORS[note] — badge background color
  intervalColor: string;  // ALL_INTERVAL_COLORS[semitone] — badge border/glow
}

/**
 * Parse a chord symbol into { rootNote, quality }.
 * Handles root notes with # and b accidentals.
 */
function parseChordSymbol(symbol: string): { rootNote: string; quality: string } {
  if (!symbol || symbol.length === 0) return { rootNote: 'C', quality: '' };
  let i = 1;
  // Consume optional accidental after the letter
  if (i < symbol.length && (symbol[i] === '#' || symbol[i] === 'b')) {
    i++;
  }
  return { rootNote: symbol.slice(0, i), quality: symbol.slice(i) };
}

/**
 * Compute chord tones for any chord symbol synchronously.
 * Returns an array of ChordToneDisplay objects ordered from root to highest extension.
 */
export function computeChordTones(chordSymbol: string): ChordToneDisplay[] {
  const { rootNote, quality } = parseChordSymbol(chordSymbol);
  const rootIndex = NOTE_TO_INDEX[rootNote] ?? 0;
  const intervals = QUALITY_INTERVALS[quality] ?? QUALITY_INTERVALS[''];

  return intervals.map((fullSemitone) => {
    const semitone = fullSemitone % 12;
    const noteIndex = (rootIndex + semitone) % 12;
    const note = CHROMATIC[noteIndex];
    return {
      note,
      semitone,
      fullSemitone,
      intervalLabel: INTERVAL_LABEL[fullSemitone] ?? String(fullSemitone),
      noteColor: NOTE_COLORS[note] ?? '#6b7280',
      intervalColor: ALL_INTERVAL_COLORS[semitone] ?? '#6b7280',
    };
  });
}

/**
 * Get a limited slice of chord tones that fits within a pixel width.
 * Each badge is ~44px wide (14px font + 20px padding + 5px gap). Min width for any badge: 72px.
 */
export function getVisibleChordTones(
  chordSymbol: string,
  widthPx: number,
): ChordToneDisplay[] {
  if (widthPx < 72) return [];
  const all = computeChordTones(chordSymbol);
  const maxBadges = Math.max(1, Math.floor((widthPx - 16) / 44));
  return all.slice(0, maxBadges);
}
