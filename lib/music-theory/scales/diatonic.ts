/**
 * Diatonic Scale and Chord Generation
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { MAJOR_SCALE_FORMULA, NATURAL_MINOR_FORMULA, MAJOR_SCALE_CHORD_QUALITIES, MAJOR_SCALE_ROMAN_NUMERALS } from '../constants';
import { createNote, addSemitones } from '../core/notes';
import { buildTriad } from '../triads/builder';
import type { 
  DiatonicScale, 
  ScaleMode, 
  PitchClass, 
  Note,
  Triad,
  TriadQuality
} from '../types';

// ============================================================================
// Diatonic Scale Building
// ============================================================================

/**
 * Build a diatonic scale
 * @param root Root pitch class
 * @param mode Major or minor
 * @param preferFlats Whether to prefer flat notation
 * @returns Diatonic scale object
 */
export function buildDiatonicScale(
  root: PitchClass,
  mode: ScaleMode,
  preferFlats: boolean = false
): DiatonicScale {
  const formula = mode === 'major' ? MAJOR_SCALE_FORMULA : NATURAL_MINOR_FORMULA;
  
  // Create the seven notes
  const notes: Note[] = formula.map(interval => 
    createNote(addSemitones(root, interval), preferFlats)
  );
  
  return {
    root: createNote(root, preferFlats),
    mode,
    notes,
    intervals: [...formula]
  };
}

// ============================================================================
// Diatonic Chord Generation
// ============================================================================

/**
 * Generate all diatonic triads for a scale
 * @param scale Diatonic scale
 * @returns Array of seven diatonic triads
 */
export function generateDiatonicTriads(scale: DiatonicScale): Triad[] {
  const triads: Triad[] = [];
  
  for (let degree = 0; degree < 7; degree++) {
    const root = scale.notes[degree];
    const quality = getDiatonicChordQuality(degree, scale.mode);
    const triad = buildTriad(root.pitchClass, quality);
    triads.push(triad);
  }
  
  return triads;
}

/**
 * Get the chord quality for a scale degree
 * @param degree Scale degree (0-6)
 * @param mode Scale mode
 * @returns Triad quality
 */
function getDiatonicChordQuality(degree: number, mode: ScaleMode): TriadQuality {
  if (mode === 'major') {
    return MAJOR_SCALE_CHORD_QUALITIES[degree] as TriadQuality;
  } else {
    // Natural minor: i, ii°, III, iv, v, VI, VII
    const minorQualities: TriadQuality[] = [
      'minor',      // i
      'diminished', // ii°
      'major',      // III
      'minor',      // iv
      'minor',      // v
      'major',      // VI
      'major'       // VII
    ];
    return minorQualities[degree];
  }
}

/**
 * Get roman numeral for a scale degree
 * @param degree Scale degree (0-6)
 * @param mode Scale mode
 * @returns Roman numeral string
 */
export function getDiatonicRomanNumeral(degree: number, mode: ScaleMode): string {
  if (mode === 'major') {
    return MAJOR_SCALE_ROMAN_NUMERALS[degree];
  } else {
    // Natural minor roman numerals
    const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    return minorNumerals[degree];
  }
}

// ============================================================================
// Diatonic Relationships
// ============================================================================

/**
 * Find the scale degree of a triad in a key
 * @param triad Triad to find
 * @param scale Diatonic scale
 * @returns Scale degree (1-7) or null if not diatonic
 */
export function findScaleDegree(triad: Triad, scale: DiatonicScale): number | null {
  const index = scale.notes.findIndex(note => note.pitchClass === triad.root.pitchClass);
  return index >= 0 ? index + 1 : null;
}

/**
 * Check if a triad is diatonic to a scale
 * @param triad Triad to check
 * @param scale Diatonic scale
 * @returns True if all notes are in the scale
 */
export function isTriadDiatonic(triad: Triad, scale: DiatonicScale): boolean {
  return triad.notes.every(note => 
    scale.notes.some(scaleNote => scaleNote.pitchClass === note.pitchClass)
  );
}

/**
 * Get common chord progressions for a key
 * @param scale Diatonic scale
 * @returns Array of common progression patterns (as scale degrees)
 */
export function getCommonProgressions(scale: DiatonicScale): number[][] {
  if (scale.mode === 'major') {
    return [
      [1, 4, 5, 1],     // I-IV-V-I
      [1, 5, 6, 4],     // I-V-vi-IV
      [1, 6, 4, 5],     // I-vi-IV-V
      [2, 5, 1],        // ii-V-I
      [1, 4, 1, 5],     // I-IV-I-V
      [6, 4, 1, 5]      // vi-IV-I-V
    ];
  } else {
    return [
      [1, 4, 5, 1],     // i-iv-v-i
      [1, 6, 3, 7],     // i-VI-III-VII
      [1, 7, 6, 7],     // i-VII-VI-VII
      [1, 4, 7, 3],     // i-iv-VII-III
      [1, 6, 7, 1]      // i-VI-VII-i
    ];
  }
}

/**
 * Build a chord progression from scale degrees
 * @param scale Diatonic scale
 * @param degrees Array of scale degrees (1-7)
 * @returns Array of triads
 */
export function buildProgressionFromDegrees(
  scale: DiatonicScale,
  degrees: number[]
): Triad[] {
  const diatonicTriads = generateDiatonicTriads(scale);
  return degrees.map(degree => diatonicTriads[degree - 1]);
}

