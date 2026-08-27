// ── Inlined music theory — no external deps ──────────────────────────────────

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_COLORS: Record<string, string> = {
  'C': '#ef4444', 'C#': '#f97316', 'D': '#f59e0b', 'D#': '#eab308',
  'E': '#84cc16', 'F': '#22c55e', 'F#': '#10b981', 'G': '#14b8a6',
  'G#': '#06b6d4', 'A': '#0ea5e9', 'A#': '#3b82f6', 'B': '#6366f1',
  'Db': '#f97316', 'Eb': '#eab308', 'Gb': '#10b981', 'Ab': '#06b6d4', 'Bb': '#3b82f6',
};

export const ALL_INTERVAL_COLORS: Record<number, string> = {
  0: '#E85555', 1: '#F4845F', 2: '#F5A623', 3: '#F5BC3C', 4: '#C8D428',
  5: '#4caf50', 6: '#26A69A', 7: '#29B6F6', 8: '#5C8EE6', 9: '#A07ED4',
  10: '#D45FBF', 11: '#E879A0',
};

export const TRIAD_PALETTE: Record<number, string> = {
  0: '#7F77DD', 1: '#1D9E75', 2: '#EF9F27', 3: '#D4537E',
  4: '#97C459', 5: '#C56BD6', 6: '#4FB3C4',
};

export const SCALE_INTERVALS: Record<string, number[]> = {
  'Aeolian': [0, 2, 3, 5, 7, 8, 10],
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
};

const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

export function normalizeNoteToSharp(note: string): string {
  if (!note || typeof note !== 'string') return '';
  return FLAT_TO_SHARP[note] ?? note;
}

export function getScaleNotes(root: string, scale: string): string[] {
  const intervals = SCALE_INTERVALS[scale];
  if (!intervals) return [];
  const normalized = FLAT_TO_SHARP[root] ?? root;
  const idx = NOTES.indexOf(normalized);
  if (idx === -1) return [];
  return intervals.map(i => NOTES[(idx + i) % 12]);
}

export function getNoteAtFret(openNote: string, fret: number): string {
  const idx = NOTES.indexOf(openNote);
  return NOTES[(idx + fret) % 12];
}

export interface NotePosition {
  stringIndex: number;
  fretNumber: number;
  note: string;
  isRoot: boolean;
  triadMembership?: TriadMembershipEntry[];
}

export interface TriadMembershipEntry {
  degree: string;
  degreeIndex: number;
  color: string;
  triadRoot: string;
  triadNotes: string[];
}

export interface DiatonicTriad {
  degree: string;
  degreeIndex: number;
  romanNumeral: string;
  rootNote: string;
  notes: string[];
  color: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
}

function computeTriadQuality(root: string, third: string, fifth: string): 'major' | 'minor' | 'diminished' | 'augmented' {
  const ri = NOTES.indexOf(root), ti = NOTES.indexOf(third), fi = NOTES.indexOf(fifth);
  const t = (ti - ri + 12) % 12, f = (fi - ri + 12) % 12;
  if (t === 4 && f === 7) return 'major';
  if (t === 3 && f === 7) return 'minor';
  if (t === 3 && f === 6) return 'diminished';
  if (t === 4 && f === 8) return 'augmented';
  return 'major';
}

const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

function getDegreeLabel(i: number, q: string): string {
  const idx = Math.min(i, 6);
  if (q === 'major') return ROMAN_UPPER[idx];
  if (q === 'augmented') return ROMAN_UPPER[idx] + '+';
  if (q === 'diminished') return ROMAN_LOWER[idx] + '°';
  return ROMAN_LOWER[idx];
}

export function computeDiatonicTriads(key: string, scale: string): DiatonicTriad[] {
  const scaleNotes = getScaleNotes(key, scale);
  if (scaleNotes.length < 3) return [];
  const n = scaleNotes.length;
  return scaleNotes.map((_, i) => {
    const root = normalizeNoteToSharp(scaleNotes[i]);
    const third = normalizeNoteToSharp(scaleNotes[(i + 2) % n]);
    const fifth = normalizeNoteToSharp(scaleNotes[(i + 4) % n]);
    const quality = computeTriadQuality(root, third, fifth);
    const degree = getDegreeLabel(i, quality);
    return { degree, degreeIndex: i, romanNumeral: degree, rootNote: root, notes: [root, third, fifth], color: TRIAD_PALETTE[i] ?? '#888', quality };
  });
}

export function computeTriadMembership(triads: DiatonicTriad[]): Record<string, TriadMembershipEntry[]> {
  const map: Record<string, TriadMembershipEntry[]> = {};
  for (const triad of triads) {
    for (const note of triad.notes) {
      const n = normalizeNoteToSharp(note);
      if (!map[n]) map[n] = [];
      map[n].push({ degree: triad.degree, degreeIndex: triad.degreeIndex, color: triad.color, triadRoot: triad.rootNote, triadNotes: triad.notes });
    }
  }
  for (const n of Object.keys(map)) map[n].sort((a, b) => a.degreeIndex - b.degreeIndex);
  return map;
}

export function calculateScalePositions(root: string, scale: string, tuning: string[], maxFrets = 24): NotePosition[] {
  const scaleNotes = getScaleNotes(root, scale);
  const positions: NotePosition[] = [];
  tuning.forEach((openNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const note = getNoteAtFret(openNote, fret);
      if (scaleNotes.includes(note)) {
        positions.push({ stringIndex, fretNumber: fret, note, isRoot: note === root });
      }
    }
  });
  return positions;
}
