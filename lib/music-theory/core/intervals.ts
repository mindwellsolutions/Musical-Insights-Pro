/**
 * Interval Calculation Utilities
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { INTERVAL_NAMES } from '../constants';
import type { IntervalName, PitchClass, Semitones } from '../types';

// ============================================================================
// Interval Name Mapping
// ============================================================================

/**
 * Get interval name from semitone count
 * @param semitones Number of semitones (0-11)
 * @returns Interval name
 */
export function getIntervalName(semitones: Semitones): IntervalName {
  const normalized = ((semitones % 12) + 12) % 12;
  return INTERVAL_NAMES[normalized] as IntervalName;
}

/**
 * Get semitones from interval name
 * @param intervalName Interval name
 * @returns Number of semitones
 */
export function getSemitonesFromInterval(intervalName: IntervalName): Semitones {
  const index = INTERVAL_NAMES.indexOf(intervalName);
  return index >= 0 ? index : 0;
}

// ============================================================================
// Interval Calculations
// ============================================================================

/**
 * Calculate interval between two pitch classes
 * @param from Starting pitch class
 * @param to Ending pitch class
 * @returns Interval in semitones (0-11)
 */
export function calculateInterval(from: PitchClass, to: PitchClass): Semitones {
  return ((to - from + 12) % 12);
}

/**
 * Calculate interval name between two pitch classes
 * @param from Starting pitch class
 * @param to Ending pitch class
 * @returns Interval name
 */
export function calculateIntervalName(from: PitchClass, to: PitchClass): IntervalName {
  const semitones = calculateInterval(from, to);
  return getIntervalName(semitones);
}

/**
 * Transpose a pitch class by an interval
 * @param pitchClass Starting pitch class
 * @param interval Interval in semitones
 * @returns Transposed pitch class
 */
export function transpose(pitchClass: PitchClass, interval: Semitones): PitchClass {
  return ((pitchClass + interval) % 12 + 12) % 12 as PitchClass;
}

// ============================================================================
// Chord Tone Identification
// ============================================================================

/**
 * Identify chord tone role from interval
 * @param intervalFromRoot Interval from root in semitones
 * @returns Chord tone role ('R', '3', '5', etc.)
 */
export function getChordToneRole(intervalFromRoot: Semitones): string {
  const normalized = ((intervalFromRoot % 12) + 12) % 12;
  
  switch (normalized) {
    case 0: return 'R';   // Root
    case 3: return 'b3';  // Minor 3rd
    case 4: return '3';   // Major 3rd
    case 6: return 'b5';  // Diminished 5th
    case 7: return '5';   // Perfect 5th
    case 8: return '#5';  // Augmented 5th
    case 10: return 'b7'; // Minor 7th
    case 11: return '7';  // Major 7th
    default: return getIntervalName(normalized);
  }
}

/**
 * Check if interval is a chord tone (root, third, or fifth)
 * @param intervalFromRoot Interval from root in semitones
 * @returns True if it's a chord tone
 */
export function isChordTone(intervalFromRoot: Semitones): boolean {
  const normalized = ((intervalFromRoot % 12) + 12) % 12;
  // Root (0), minor 3rd (3), major 3rd (4), dim 5th (6), perfect 5th (7), aug 5th (8)
  return [0, 3, 4, 6, 7, 8].includes(normalized);
}

// ============================================================================
// Scale Degree Calculations
// ============================================================================

/**
 * Get scale degree from interval
 * @param intervalFromRoot Interval from root in semitones
 * @returns Scale degree (1-7)
 */
export function getScaleDegree(intervalFromRoot: Semitones): number {
  const normalized = ((intervalFromRoot % 12) + 12) % 12;
  
  // Map semitones to scale degrees
  const degreeMap: Record<number, number> = {
    0: 1,   // Root
    2: 2,   // 2nd
    4: 3,   // 3rd
    5: 4,   // 4th
    7: 5,   // 5th
    9: 6,   // 6th
    11: 7   // 7th
  };
  
  return degreeMap[normalized] || 1;
}

/**
 * Get roman numeral for scale degree
 * @param degree Scale degree (1-7)
 * @param isMinor Whether the chord is minor
 * @param isDiminished Whether the chord is diminished
 * @returns Roman numeral string
 */
export function getRomanNumeral(
  degree: number,
  isMinor: boolean = false,
  isDiminished: boolean = false
): string {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const numeral = numerals[degree - 1] || 'I';
  
  if (isDiminished) {
    return numeral.toLowerCase() + '°';
  } else if (isMinor) {
    return numeral.toLowerCase();
  } else {
    return numeral;
  }
}

// ============================================================================
// Interval Quality
// ============================================================================

/**
 * Determine interval quality (perfect, major, minor, augmented, diminished)
 * @param semitones Number of semitones
 * @returns Interval quality description
 */
export function getIntervalQuality(semitones: Semitones): string {
  const normalized = ((semitones % 12) + 12) % 12;
  
  const qualities: Record<number, string> = {
    0: 'Perfect Unison',
    1: 'Minor 2nd',
    2: 'Major 2nd',
    3: 'Minor 3rd',
    4: 'Major 3rd',
    5: 'Perfect 4th',
    6: 'Tritone',
    7: 'Perfect 5th',
    8: 'Minor 6th',
    9: 'Major 6th',
    10: 'Minor 7th',
    11: 'Major 7th'
  };
  
  return qualities[normalized] || 'Unknown';
}

