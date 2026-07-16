// Diatonic triad types and color palette for Triad Arc Band & Focus Mode features

export interface DiatonicTriad {
  degree: string;        // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  degreeIndex: number;   // 0–6 — fixed left-to-right segment ordering
  romanNumeral: string;  // same as degree (alias for display)
  rootNote: string;      // e.g. 'C', 'D', 'E' (sharp-normalized)
  notes: string[];       // all 3 pitch classes (sharp-normalized), e.g. ['C','E','G']
  color: string;         // TRIAD_PALETTE[degreeIndex]
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
}

export interface TriadMembershipEntry {
  degree: string;
  degreeIndex: number;
  color: string;
  triadRoot: string;
  triadNotes: string[];
}

/**
 * Fixed per-degree color palette.
 * Chosen to avoid collisions with NOTE_COLORS, ALL_INTERVAL_COLORS, and CHORD_TONE_COLORS.
 * Index by degreeIndex (0–6).
 */
export const TRIAD_PALETTE: Record<number, string> = {
  0: '#7F77DD',  // I   — muted indigo-violet
  1: '#1D9E75',  // ii  — teal-green
  2: '#EF9F27',  // iii — amber
  3: '#D4537E',  // IV  — dusty rose
  4: '#97C459',  // V   — muted yellow-green
  5: '#C56BD6',  // vi  — medium purple
  6: '#4FB3C4',  // vii° — teal-cyan
};

/** Convenience lookup by roman-numeral degree string */
export const TRIAD_PALETTE_BY_DEGREE: Record<string, string> = {};
