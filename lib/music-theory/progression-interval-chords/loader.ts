/**
 * Progression Interval Chords Loader
 * Algorithmically generates compatible chord lists for each scale degree + key.
 * LRU-cached to avoid recomputing on every render.
 */

import { NOTES } from '@/lib/musicTheory';
import { CompatibleChordEntry, ScaleDegreeEntry, IntervalChordDatabase } from './types';

// Simple Map cache — 12 keys max, never evicted (static music theory data)
const cache = new Map<string, IntervalChordDatabase>();

/** Semitone offsets for each roman numeral degree from the major scale root */
const DEGREE_OFFSETS: Record<string, number> = {
  'I': 0, 'ii': 2, 'iii': 4, 'IV': 5, 'V': 7, 'vi': 9, 'vii°': 11,
  'bVII': 10, 'bVI': 8, 'bIII': 3, 'bII': 1,
};

const DEGREE_PRIMARY_QUALITY: Record<string, string> = {
  'I': 'major', 'ii': 'minor', 'iii': 'minor', 'IV': 'major', 'V': 'major',
  'vi': 'minor', 'vii°': 'diminished', 'bVII': 'major', 'bVI': 'major',
  'bIII': 'major', 'bII': 'major',
};

const INTERVALS: Record<string, number[]> = {
  major: [0, 4, 7], minor: [0, 3, 7], diminished: [0, 3, 6],
  major7: [0, 4, 7, 11], minor7: [0, 3, 7, 10], dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9], halfDiminished: [0, 3, 6, 10],
  sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 2, 4, 7],
  major6: [0, 4, 7, 9], minor6: [0, 3, 7, 9],
  major9: [0, 2, 4, 7, 11], minor9: [0, 2, 3, 7, 10], dominant9: [0, 2, 4, 7, 10],
};

function notesByIntervals(root: string, ivs: number[]): string[] {
  const idx = NOTES.indexOf(root);
  if (idx === -1) return [];
  return ivs.map(i => NOTES[(idx + i) % 12]);
}

function buildEntry(
  root: string, symbol: string, displayName: string,
  quality: string, intervalKey: string,
  suitability: number, context: string, genres: string[]
): CompatibleChordEntry {
  const ivs = INTERVALS[intervalKey] ?? INTERVALS.major;
  return { symbol, displayName, quality, notes: notesByIntervals(root, ivs), intervals: ivs, suitability, context, genres };
}

function buildDegree(keyRoot: string, degree: string): ScaleDegreeEntry {
  const offset = DEGREE_OFFSETS[degree] ?? 0;
  const keyIdx = NOTES.indexOf(keyRoot);
  const root = NOTES[(keyIdx + offset) % 12];
  const pq = DEGREE_PRIMARY_QUALITY[degree] ?? 'major';
  const pSuffix = pq === 'major' ? '' : pq === 'minor' ? 'm' : pq === 'diminished' ? 'dim' : '';
  const primaryChord = `${root}${pSuffix}`;
  const chords: CompatibleChordEntry[] = [];

  if (degree === 'I') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Foundational tonic chord', ['All']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 9, 'Lush jazz/pop tonic color', ['Jazz', 'Pop', 'R&B']));
    chords.push(buildEntry(root, `${root}add9`, `${root} Add 9`, 'add9', 'add9', 8, 'Bright open tonic sound', ['Pop', 'Folk', 'Indie']));
    chords.push(buildEntry(root, `${root}sus2`, `${root} Sus2`, 'sus2', 'sus2', 7, 'Floating unresolved tension', ['Rock', 'Pop', 'Ambient']));
    chords.push(buildEntry(root, `${root}sus4`, `${root} Sus4`, 'sus4', 'sus4', 7, 'Anticipation before resolution', ['Rock', 'Pop']));
    chords.push(buildEntry(root, `${root}6`, `${root} 6`, 'major6', 'major6', 8, 'Warm alternative to maj7', ['Jazz', 'Pop']));
    chords.push(buildEntry(root, `${root}maj9`, `${root} Major 9`, 'major9', 'major9', 8, 'Extended jazz tonic', ['Jazz', 'Neo-Soul']));
  } else if (degree === 'ii') {
    chords.push(buildEntry(root, `${root}m`, `${root} Minor`, 'minor', 'minor', 10, 'Standard supertonic minor', ['All']));
    chords.push(buildEntry(root, `${root}m7`, `${root} Minor 7`, 'minor7', 'minor7', 9, 'Smooth jazz/pop ii chord', ['Jazz', 'Pop', 'R&B']));
    chords.push(buildEntry(root, `${root}m9`, `${root} Minor 9`, 'minor9', 'minor9', 8, 'Rich extended ii chord', ['Jazz', 'Neo-Soul']));
    chords.push(buildEntry(root, `${root}sus4`, `${root} Sus4`, 'sus4', 'sus4', 6, 'Ambiguous pre-dominant tension', ['Pop', 'Rock']));
    chords.push(buildEntry(root, `${root}m6`, `${root} Minor 6`, 'minor6', 'minor6', 7, 'Jazzy variation with 6th', ['Jazz', 'Bossa Nova']));
  } else if (degree === 'iii') {
    chords.push(buildEntry(root, `${root}m`, `${root} Minor`, 'minor', 'minor', 10, 'Standard mediant chord', ['All']));
    chords.push(buildEntry(root, `${root}m7`, `${root} Minor 7`, 'minor7', 'minor7', 8, 'Smooth mediant extension', ['Jazz', 'Pop']));
    chords.push(buildEntry(root, `${root}sus4`, `${root} Sus4`, 'sus4', 'sus4', 6, 'Suspended mediant color', ['Rock', 'Pop']));
  } else if (degree === 'IV') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Foundational subdominant', ['All']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 9, 'Lydian-tinged subdominant', ['Jazz', 'Pop']));
    chords.push(buildEntry(root, `${root}add9`, `${root} Add 9`, 'add9', 'add9', 8, 'Open subdominant color', ['Pop', 'Folk']));
    chords.push(buildEntry(root, `${root}sus2`, `${root} Sus2`, 'sus2', 'sus2', 7, 'Floating subdominant texture', ['Rock', 'Ambient']));
    chords.push(buildEntry(root, `${root}6`, `${root} 6`, 'major6', 'major6', 8, 'Warm IV color', ['Jazz', 'Pop']));
  } else if (degree === 'V') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Dominant tension chord', ['All']));
    chords.push(buildEntry(root, `${root}7`, `${root} Dominant 7`, 'dominant7', 'dominant7', 10, 'Classic tension-resolution dominant', ['All']));
    chords.push(buildEntry(root, `${root}sus4`, `${root} Sus4`, 'sus4', 'sus4', 8, 'Suspended dominant tension', ['Rock', 'Pop']));
    chords.push(buildEntry(root, `${root}add9`, `${root} Add 9`, 'add9', 'add9', 7, 'Dominant with color extension', ['Pop', 'Indie']));
    chords.push(buildEntry(root, `${root}9`, `${root} Dominant 9`, 'dominant9', 'dominant9', 8, 'Bluesy/funky dominant 9', ['Blues', 'Funk', 'Jazz']));
  } else if (degree === 'vi') {
    chords.push(buildEntry(root, `${root}m`, `${root} Minor`, 'minor', 'minor', 10, 'Standard relative minor', ['All']));
    chords.push(buildEntry(root, `${root}m7`, `${root} Minor 7`, 'minor7', 'minor7', 9, 'Smooth submediant 7th', ['Jazz', 'Pop', 'R&B']));
    chords.push(buildEntry(root, `${root}m9`, `${root} Minor 9`, 'minor9', 'minor9', 8, 'Rich extended vi chord', ['Jazz', 'Neo-Soul']));
    chords.push(buildEntry(root, `${root}sus2`, `${root} Sus2`, 'sus2', 'sus2', 7, 'Open relative minor sound', ['Pop', 'Folk']));
  } else if (degree === 'vii°') {
    chords.push(buildEntry(root, `${root}dim`, `${root} Diminished`, 'diminished', 'diminished', 10, 'Classical leading-tone chord', ['Classical', 'Jazz', 'Musical']));
    chords.push(buildEntry(root, `${root}m7b5`, `${root} Half Dim`, 'halfDiminished', 'halfDiminished', 9, 'Jazz leading-tone substitution', ['Jazz']));
    chords.push(buildEntry(root, `${root}dim7`, `${root} Dim 7`, 'diminished7', 'diminished7', 8, 'Fully diminished for chromatic movement', ['Classical', 'Jazz']));
  } else if (degree === 'bVII') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Mixolydian borrowed chord', ['Rock', 'Blues', 'Pop']));
    chords.push(buildEntry(root, `${root}7`, `${root} Dominant 7`, 'dominant7', 'dominant7', 8, 'Bluesy bVII7 sound', ['Blues', 'Rock']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 7, 'Lush borrowed bVII', ['Jazz', 'Pop']));
  } else if (degree === 'bVI') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Borrowed Aeolian chord — dramatic', ['Rock', 'Pop', 'Metal']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 8, 'Lush borrowed bVI', ['Jazz', 'Pop']));
    chords.push(buildEntry(root, `${root}7`, `${root} Dominant 7`, 'dominant7', 'dominant7', 7, 'Unexpected dominant color', ['Blues', 'Jazz']));
  } else if (degree === 'bIII') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 10, 'Borrowed from Aeolian — surprise color', ['Rock', 'Pop', 'Metal']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 7, 'Lush bIII extension', ['Jazz', 'R&B']));
  } else if (degree === 'bII') {
    chords.push(buildEntry(root, root, `${root} Major`, 'major', 'major', 9, 'Neapolitan chord — dramatic tension', ['Classical', 'Jazz', 'Metal']));
    chords.push(buildEntry(root, `${root}maj7`, `${root} Major 7`, 'major7', 'major7', 7, 'Lush Neapolitan extension', ['Jazz']));
  } else {
    // Generic fallback
    chords.push(buildEntry(root, primaryChord, `${root} ${pq}`, pq, pq === 'major' ? 'major' : pq === 'minor' ? 'minor' : 'diminished', 8, 'Diatonic chord', ['All']));
  }

  return { primaryChord, primaryQuality: pq, rootNote: root, compatibleChords: chords };
}

const ALL_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', 'bVII', 'bVI', 'bIII', 'bII'];

/** Get the full IntervalChordDatabase for a key. Map-cached (12 keys max, static). */
export function getProgressionIntervalChords(key: string): IntervalChordDatabase {
  const cached = cache.get(key);
  if (cached) return cached;

  const scaleDegrees: Record<string, ScaleDegreeEntry> = {};
  for (const deg of ALL_DEGREES) {
    scaleDegrees[deg] = buildDegree(key, deg);
  }

  const db: IntervalChordDatabase = { key, version: '1.0.0', scaleDegrees };
  cache.set(key, db);
  return db;
}

/** Get compatible chords for a specific degree and key. */
export function getCompatibleChordsForDegree(key: string, romanNumeral: string): CompatibleChordEntry[] {
  const db = getProgressionIntervalChords(key);
  return db.scaleDegrees[romanNumeral]?.compatibleChords ?? [];
}
