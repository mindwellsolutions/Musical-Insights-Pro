/**
 * Foreground Overlay Patterns — music theory compute functions
 * Each function returns string[] — the note names to foreground on the fretboard.
 * The caller passes these as `triadNotes` (the existing Fretboard prop).
 */

import { getScaleNotes, NOTES } from './musicTheory';
import { normalizeNoteToSharp } from './triad-theory';

// ── Shared helpers ──────────────────────────────────────────────────────────

const CHROMATIC = NOTES; // ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

function noteAt(root: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(normalizeNoteToSharp(root));
  if (idx === -1) return root;
  return CHROMATIC[(idx + semitones + 12) % 12];
}

// Diatonic 7th chord intervals for major-scale degrees 0–6
// (works for any scale — just index into its note array)
const DIATONIC_7TH_INTERVALS: Record<number, number[]> = {
  0: [0, 4, 7, 11],  // Maj7
  1: [0, 3, 7, 10],  // min7
  2: [0, 3, 7, 10],  // min7
  3: [0, 4, 7, 11],  // Maj7
  4: [0, 4, 7, 10],  // dom7
  5: [0, 3, 7, 10],  // min7
  6: [0, 3, 6, 10],  // m7b5
};

export const DEGREE_LABELS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const SEVENTH_QUALITY_LABELS = ['Maj7', 'min7', 'min7', 'Maj7', 'dom7', 'min7', 'm7b5'];
export const MODE_NAMES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

// ── Chord-quality lookup (parallel to musicTheory.ts internal table) ─────────
const SCALE_QUALITIES: Record<string, string[]> = {
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
};

function getQuality(scaleName: string, degree: number): string {
  const q = SCALE_QUALITIES[scaleName];
  return q?.[degree] ?? 'maj';
}

// ── 1. 7th Chords in Scale ───────────────────────────────────────────────────

export function get7thChordNotes(rootNote: string, scaleName: string, degree: number): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  if (scaleNotes.length < 7 || degree < 0 || degree > 6) return [];
  const chordRoot = scaleNotes[degree];
  const intervals = DIATONIC_7TH_INTERVALS[degree] ?? [0, 4, 7, 11];
  return intervals.map(i => noteAt(chordRoot, i));
}

// ── 2. Mode Shapes per Degree ────────────────────────────────────────────────
// Returns all 7 scale notes — visual distinction is that the "mode root"
// (the degree note) is highlighted as root via highlightKeyNote in Fretboard.

export function getModeNotes(rootNote: string, scaleName: string): string[] {
  return getScaleNotes(rootNote, scaleName);
}

export function getModeRoot(rootNote: string, scaleName: string, degree: number): string {
  const notes = getScaleNotes(rootNote, scaleName);
  return notes[degree] ?? rootNote;
}

// ── 3. Pentatonic per Chord ──────────────────────────────────────────────────

export function getPentatonicNotes(rootNote: string, scaleName: string, degree: number): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  if (scaleNotes.length < 7) return [];
  const chordRoot = scaleNotes[degree];
  const quality = getQuality(scaleName, degree);

  if (quality === 'maj') {
    // Major pentatonic: 1 2 3 5 6
    return [0, 2, 4, 7, 9].map(i => noteAt(chordRoot, i));
  } else if (quality === 'dim') {
    // Minor pentatonic from b3
    const b3Root = noteAt(chordRoot, 3);
    return [0, 3, 5, 7, 10].map(i => noteAt(b3Root, i));
  } else {
    // Minor pentatonic: 1 b3 4 5 b7
    return [0, 3, 5, 7, 10].map(i => noteAt(chordRoot, i));
  }
}

// ── 4. Arpeggio Shapes (same as 7th chord tones) ────────────────────────────

export function getArpeggioNotes(rootNote: string, scaleName: string, degree: number): string[] {
  return get7thChordNotes(rootNote, scaleName, degree);
}

// ── 5. Diatonic Intervals (3rds, 6ths, 10ths) ───────────────────────────────

export type DiatonicIntervalType = '3rd' | '6th' | '10th';

export function getDiatonicIntervalNotes(
  rootNote: string,
  scaleName: string,
  startNote: string,
  intervalType: DiatonicIntervalType,
): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const idx = scaleNotes.indexOf(normalizeNoteToSharp(startNote));
  if (idx === -1) return [startNote];
  const stepMap: Record<DiatonicIntervalType, number> = { '3rd': 2, '6th': 5, '10th': 2 };
  const partnerIdx = (idx + stepMap[intervalType]) % scaleNotes.length;
  return [startNote, scaleNotes[partnerIdx]];
}

// ── 6. Tritone Tension & Resolution ─────────────────────────────────────────

export interface TritonePair {
  tensionNote: string;
  resolutionNotes: string[];
  label: string;
}

export function getTritonePairs(rootNote: string, scaleName: string): TritonePair[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const results: TritonePair[] = [];

  scaleNotes.forEach((note, i) => {
    const noteIdx = CHROMATIC.indexOf(normalizeNoteToSharp(note));
    const tritoneNote = CHROMATIC[(noteIdx + 6) % 12];
    if (scaleNotes.includes(tritoneNote)) {
      const resUp = CHROMATIC[(CHROMATIC.indexOf(tritoneNote) + 1) % 12];
      const resDown = CHROMATIC[(noteIdx - 1 + 12) % 12];
      results.push({
        tensionNote: tritoneNote,
        resolutionNotes: [resUp, resDown],
        label: `${DEGREE_LABELS[i] ?? `deg ${i + 1}`} tritone`,
      });
    }
  });

  return results;
}

export function getTritoneNotes(rootNote: string, scaleName: string, pairIndex: number): string[] {
  const pairs = getTritonePairs(rootNote, scaleName);
  if (pairs.length === 0) return [];
  const pair = pairs[pairIndex % pairs.length];
  return [pair.tensionNote, ...pair.resolutionNotes];
}
