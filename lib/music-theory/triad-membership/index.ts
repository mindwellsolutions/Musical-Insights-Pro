/**
 * Triad membership computation utilities.
 * Pure functions — no API calls, no side effects.
 * Designed to be memoized at call-site with useMemo.
 */

import { getScaleNotes, NOTES } from '@/lib/musicTheory';
import { normalizeNoteToSharp } from '@/lib/triad-theory';
import { DiatonicTriad, TriadMembershipEntry, TRIAD_PALETTE } from './types';

const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

function computeTriadQuality(
  root: string,
  third: string,
  fifth: string
): 'major' | 'minor' | 'diminished' | 'augmented' {
  const rootIdx = NOTES.indexOf(normalizeNoteToSharp(root));
  const thirdIdx = NOTES.indexOf(normalizeNoteToSharp(third));
  const fifthIdx = NOTES.indexOf(normalizeNoteToSharp(fifth));

  const thirdInt = (thirdIdx - rootIdx + 12) % 12;
  const fifthInt = (fifthIdx - rootIdx + 12) % 12;

  if (thirdInt === 4 && fifthInt === 7) return 'major';
  if (thirdInt === 3 && fifthInt === 7) return 'minor';
  if (thirdInt === 3 && fifthInt === 6) return 'diminished';
  if (thirdInt === 4 && fifthInt === 8) return 'augmented';
  // Fallback — treat any other combination as major
  return 'major';
}

function getDegreeLabel(
  index: number,
  quality: 'major' | 'minor' | 'diminished' | 'augmented'
): string {
  const i = Math.min(index, 6);
  if (quality === 'major') return ROMAN_UPPER[i];
  if (quality === 'augmented') return ROMAN_UPPER[i] + '+';
  if (quality === 'diminished') return ROMAN_LOWER[i] + '°';
  return ROMAN_LOWER[i]; // minor
}

/**
 * Build the array of diatonic triads for a given key + scale.
 * Stacks thirds from scale notes to derive each triad and its quality.
 */
export function computeDiatonicTriads(key: string, scaleName: string): DiatonicTriad[] {
  const scaleNotes = getScaleNotes(key, scaleName);
  if (scaleNotes.length < 3) return [];

  const n = scaleNotes.length;
  const triads: DiatonicTriad[] = [];

  for (let i = 0; i < n; i++) {
    const root = normalizeNoteToSharp(scaleNotes[i]);
    const third = normalizeNoteToSharp(scaleNotes[(i + 2) % n]);
    const fifth = normalizeNoteToSharp(scaleNotes[(i + 4) % n]);

    const quality = computeTriadQuality(root, third, fifth);
    const degree = getDegreeLabel(i, quality);

    triads.push({
      degree,
      degreeIndex: i,
      romanNumeral: degree,
      rootNote: root,
      notes: [root, third, fifth],
      color: TRIAD_PALETTE[i] ?? '#888888',
      quality,
    });
  }

  return triads;
}

/**
 * Build a map from pitch class → sorted TriadMembershipEntry[].
 * Each note receives one entry per triad it belongs to, sorted by degreeIndex ASC.
 *
 * @param triads         Output of computeDiatonicTriads
 * @param enabledDegrees Optional filter; if omitted all triads are included
 */
export function computeTriadMembership(
  triads: DiatonicTriad[],
  enabledDegrees?: string[]
): Record<string, TriadMembershipEntry[]> {
  const membership: Record<string, TriadMembershipEntry[]> = {};

  const filtered = enabledDegrees
    ? triads.filter(t => enabledDegrees.includes(t.degree))
    : triads;

  for (const triad of filtered) {
    for (const note of triad.notes) {
      const normalized = normalizeNoteToSharp(note);
      if (!membership[normalized]) membership[normalized] = [];
      membership[normalized].push({
        degree: triad.degree,
        degreeIndex: triad.degreeIndex,
        color: triad.color,
        triadRoot: triad.rootNote,
        triadNotes: triad.notes,
      });
    }
  }

  // Ensure fixed ascending degreeIndex order within each note
  for (const note of Object.keys(membership)) {
    membership[note].sort((a, b) => a.degreeIndex - b.degreeIndex);
  }

  return membership;
}

export type { DiatonicTriad, TriadMembershipEntry } from './types';
export { TRIAD_PALETTE } from './types';
