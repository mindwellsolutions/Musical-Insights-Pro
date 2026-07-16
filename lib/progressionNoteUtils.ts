/**
 * Progression Note Utilities
 * Pure functions for deriving note sets from chord progressions
 */

import { ChordProgression } from '@/lib/progression-analyzer/types';
import { NOTES } from '@/lib/musicTheory';

// Flat → Sharp normalization
const FLAT_TO_SHARP: Record<string, string> = {
  'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
  'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

function normalizeRootNote(note: string): string {
  return FLAT_TO_SHARP[note] ?? note;
}

/** Parse a chord symbol string → { rootNote, quality } */
export function parseChordSymbol(symbol: string): { rootNote: string; quality: string } | null {
  if (!symbol || symbol === 'Other') return null;
  const m = symbol.match(/^([A-G][#b]?)(.*)/);
  if (!m) return null;
  const rootNote = normalizeRootNote(m[1]);
  const q = m[2];
  let quality = 'maj';
  if (q === 'm' || q === 'min') quality = 'min';
  else if (q === 'maj7' || q === 'M7') quality = 'maj7';
  else if (q === 'm7' || q === 'min7') quality = 'min7';
  else if (q === '7') quality = 'dom7';
  else if (q === 'dim' || q === '°') quality = 'dim';
  else if (q === 'dim7' || q === '°7') quality = 'dim7';
  else if (q === 'm7b5' || q === 'ø7' || q === 'ø' || q === 'Ø') quality = 'min7b5';
  else if (q === 'aug' || q === '+') quality = 'aug';
  else if (q === 'sus2') quality = 'sus2';
  else if (q === 'sus4') quality = 'sus4';
  else if (q === 'add9') quality = 'add9';
  else if (q === '6') quality = '6';
  else if (q === 'm6' || q === 'min6') quality = 'min6';
  else if (q === 'maj9') quality = 'maj9';
  else if (q === 'm9' || q === 'min9') quality = 'min9';
  else if (q === '9') quality = 'dom9';
  else if (q === 'maj11') quality = 'maj11';
  else if (q === 'm11') quality = 'min11';
  else if (q === '11') quality = 'dom11';
  else if (q === 'maj13') quality = 'maj13';
  else if (q === 'm13') quality = 'min13';
  else if (q === '13') quality = 'dom13';
  // Unknown suffixes treated as major
  return { rootNote, quality };
}

/** Calculate notes for a chord given root note and quality */
export function getChordNotesByQuality(rootNote: string, quality: string): string[] {
  const intervals: Record<string, number[]> = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    dim7: [0, 3, 6, 9],
    min7b5: [0, 3, 6, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    add9: [0, 2, 4, 7],
    '6': [0, 4, 7, 9],
    min6: [0, 3, 7, 9],
    maj9: [0, 2, 4, 7, 11],
    min9: [0, 2, 3, 7, 10],
    dom9: [0, 2, 4, 7, 10],
    maj11: [0, 4, 5, 7, 11],
    min11: [0, 3, 5, 7, 10],
    dom11: [0, 4, 5, 7, 10],
    maj13: [0, 4, 7, 9, 11],
    min13: [0, 3, 7, 9, 10],
    dom13: [0, 4, 7, 9, 10],
  };
  const ivs = intervals[quality] ?? intervals.maj;
  const rootIdx = NOTES.indexOf(rootNote);
  if (rootIdx === -1) return [];
  return ivs.map(i => NOTES[(rootIdx + i) % 12]);
}

/**
 * Build a Set of note names from all non-"Other" chords in a progression.
 * Used for fretboard filtering (Feature 0).
 */
export function getProgressionNoteSet(progression: ChordProgression): Set<string> {
  const noteSet = new Set<string>();
  progression.chords.forEach((chordSymbol, idx) => {
    const romanNumeral = progression.romanNumerals[idx];
    // Skip "Other" slots
    if (romanNumeral === 'Other' || chordSymbol === 'Other') return;
    const parsed = parseChordSymbol(chordSymbol);
    if (!parsed) return;
    const notes = getChordNotesByQuality(parsed.rootNote, parsed.quality);
    notes.forEach(n => noteSet.add(n));
  });
  return noteSet;
}
