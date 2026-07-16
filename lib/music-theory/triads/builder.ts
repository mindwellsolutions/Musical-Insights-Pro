/**
 * Triad Construction
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { TRIAD_FORMULAS } from '../constants';
import { createNote, addSemitones } from '../core/notes';
import type { 
  Triad, 
  TriadQuality, 
  PitchClass, 
  Note 
} from '../types';

// ============================================================================
// Triad Building
// ============================================================================

/**
 * Build a triad from root and quality
 * @param root Root pitch class
 * @param quality Triad quality
 * @param preferFlats Whether to prefer flat notation
 * @returns Triad object
 */
export function buildTriad(
  root: PitchClass,
  quality: TriadQuality,
  preferFlats: boolean = false
): Triad {
  const formula = TRIAD_FORMULAS[quality];
  
  // Create notes from formula
  const rootNote = createNote(root, preferFlats);
  const thirdNote = createNote(addSemitones(root, formula[1]), preferFlats);
  const fifthNote = createNote(addSemitones(root, formula[2]), preferFlats);
  
  // Generate display name
  const displayName = getTriadDisplayName(rootNote, quality);
  
  return {
    root: rootNote,
    quality,
    notes: [rootNote, thirdNote, fifthNote],
    intervals: [0, formula[1], formula[2]],
    displayName
  };
}

/**
 * Generate display name for a triad
 * @param root Root note
 * @param quality Triad quality
 * @returns Display name (e.g., "C", "Am", "Bdim", "C+")
 */
export function getTriadDisplayName(root: Note, quality: TriadQuality): string {
  const suffix = getQualitySuffix(quality);
  return `${root.name}${suffix}`;
}

/**
 * Get suffix for triad quality
 * @param quality Triad quality
 * @returns Suffix string
 */
export function getQualitySuffix(quality: TriadQuality): string {
  switch (quality) {
    case 'major':
      return '';
    case 'minor':
      return 'm';
    case 'diminished':
      return 'dim';
    case 'augmented':
      return '+';
  }
}

// ============================================================================
// Triad Analysis
// ============================================================================

/**
 * Get the notes of a triad in a specific inversion
 * @param triad Triad object
 * @param inversion Inversion type
 * @returns Array of notes in inversion order [bass, middle, treble]
 */
export function getInversionNotes(
  triad: Triad,
  inversion: 'root' | 'first' | 'second'
): [Note, Note, Note] {
  const [root, third, fifth] = triad.notes;
  
  switch (inversion) {
    case 'root':
      return [root, third, fifth];
    case 'first':
      return [third, fifth, root];
    case 'second':
      return [fifth, root, third];
  }
}

/**
 * Get the intervals for a specific inversion
 * @param triad Triad object
 * @param inversion Inversion type
 * @returns Array of intervals from bass note
 */
export function getInversionIntervals(
  triad: Triad,
  inversion: 'root' | 'first' | 'second'
): [number, number, number] {
  const [root, third, fifth] = triad.intervals;
  
  switch (inversion) {
    case 'root':
      return [0, third, fifth];
    case 'first':
      // Third is bass, so intervals are relative to third
      return [0, fifth - third, 12 - third];
    case 'second':
      // Fifth is bass, so intervals are relative to fifth
      return [0, 12 - fifth, 12 - fifth + third];
  }
}

/**
 * Identify which note of the triad is at a given interval from bass
 * @param intervalFromBass Interval in semitones from bass note
 * @param inversion Inversion type
 * @returns Chord tone role ('R', '3', '5')
 */
export function getChordToneFromInterval(
  intervalFromBass: number,
  inversion: 'root' | 'first' | 'second'
): 'R' | '3' | '5' {
  const normalized = ((intervalFromBass % 12) + 12) % 12;
  
  if (normalized === 0) {
    // Bass note
    switch (inversion) {
      case 'root': return 'R';
      case 'first': return '3';
      case 'second': return '5';
    }
  }
  
  // For other notes, we need to check the inversion
  switch (inversion) {
    case 'root':
      if (normalized === 3 || normalized === 4) return '3';
      if (normalized === 6 || normalized === 7 || normalized === 8) return '5';
      break;
    case 'first':
      if (normalized === 3 || normalized === 4 || normalized === 5) return '5';
      if (normalized === 8 || normalized === 9) return 'R';
      break;
    case 'second':
      if (normalized === 4 || normalized === 5) return 'R';
      if (normalized === 7 || normalized === 8 || normalized === 9) return '3';
      break;
  }
  
  return 'R'; // Fallback
}

