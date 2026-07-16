/**
 * Music Theory Constants
 * Based on blueprint: .blueprints/triad-anchor-sys/01-music-theory-foundation.md
 */

import type {
  PitchClass,
  NoteNameSharp,
  NoteNameFlat,
  StringSet,
  StringSetInfo,
  StringNumber,
  CAGEDShape,
  Zone,
  ZoneNumber
} from './types';

// ============================================================================
// Note Names
// ============================================================================

export const NOTES_SHARP: readonly NoteNameSharp[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export const NOTES_FLAT: readonly NoteNameFlat[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
] as const;

// ============================================================================
// Guitar Tuning
// ============================================================================

/**
 * Standard guitar tuning as pitch classes
 * [String 6, String 5, String 4, String 3, String 2, String 1]
 * [Low E, A, D, G, B, High E]
 */
export const STANDARD_TUNING: readonly [PitchClass, PitchClass, PitchClass, PitchClass, PitchClass, PitchClass] = 
  [4, 9, 2, 7, 11, 4] as const;

// ============================================================================
// Triad Formulas
// ============================================================================

export const TRIAD_FORMULAS = {
  major: [0, 4, 7] as const,
  minor: [0, 3, 7] as const,
  diminished: [0, 3, 6] as const,
  augmented: [0, 4, 8] as const
} as const;

// ============================================================================
// Scale Formulas
// ============================================================================

export const PENTATONIC_FORMULAS = {
  minor: [0, 3, 5, 7, 10] as const,  // 1, b3, 4, 5, b7
  major: [0, 2, 4, 7, 9] as const    // 1, 2, 3, 5, 6
} as const;

export const MAJOR_SCALE_FORMULA = [0, 2, 4, 5, 7, 9, 11] as const;

export const NATURAL_MINOR_FORMULA = [0, 2, 3, 5, 7, 8, 10] as const;

// ============================================================================
// String Sets
// ============================================================================

/**
 * String set definitions
 * Note: Arrays are in descending order (bass to treble)
 */
export const STRING_SETS: Record<StringSet, readonly [number, number, number]> = {
  '123': [3, 2, 1] as const,  // G-B-E (treble strings)
  '234': [4, 3, 2] as const,  // D-G-B
  '345': [5, 4, 3] as const,  // A-D-G
  '456': [6, 5, 4] as const   // E-A-D (bass strings)
} as const;

export const STRING_SET_INFO: Record<StringSet, StringSetInfo> = {
  '123': { id: '123', strings: [1, 2, 3] as [StringNumber, StringNumber, StringNumber], name: 'E-B-G' },
  '234': { id: '234', strings: [2, 3, 4] as [StringNumber, StringNumber, StringNumber], name: 'B-G-D' },
  '345': { id: '345', strings: [3, 4, 5] as [StringNumber, StringNumber, StringNumber], name: 'G-D-A' },
  '456': { id: '456', strings: [4, 5, 6] as [StringNumber, StringNumber, StringNumber], name: 'D-A-E' }
} as const;

// ============================================================================
// Zone Definitions
// ============================================================================

export const ZONE_DEFINITIONS: readonly Zone[] = [
  { zoneNumber: 1 as ZoneNumber, startFret: 0, endFret: 3, centerFret: 2, cagedShape: 'E' as CAGEDShape },
  { zoneNumber: 2 as ZoneNumber, startFret: 2, endFret: 6, centerFret: 4, cagedShape: 'D' as CAGEDShape },
  { zoneNumber: 3 as ZoneNumber, startFret: 5, endFret: 9, centerFret: 7, cagedShape: 'C' as CAGEDShape },
  { zoneNumber: 4 as ZoneNumber, startFret: 7, endFret: 11, centerFret: 9, cagedShape: 'A' as CAGEDShape },
  { zoneNumber: 5 as ZoneNumber, startFret: 10, endFret: 14, centerFret: 12, cagedShape: 'G' as CAGEDShape },
  { zoneNumber: 6 as ZoneNumber, startFret: 12, endFret: 15, centerFret: 14, cagedShape: 'E' as CAGEDShape },
  // Extended zones for full 24-fret coverage (CAGED pattern repeats every 12 frets)
  { zoneNumber: 7 as ZoneNumber, startFret: 14, endFret: 18, centerFret: 16, cagedShape: 'D' as CAGEDShape },
  { zoneNumber: 8 as ZoneNumber, startFret: 17, endFret: 21, centerFret: 19, cagedShape: 'C' as CAGEDShape },
  { zoneNumber: 9 as ZoneNumber, startFret: 19, endFret: 23, centerFret: 21, cagedShape: 'A' as CAGEDShape },
  { zoneNumber: 10 as ZoneNumber, startFret: 22, endFret: 24, centerFret: 23, cagedShape: 'G' as CAGEDShape },
] as const;

// ============================================================================
// CAGED System
// ============================================================================

export const CAGED_SHAPES: readonly CAGEDShape[] = ['C', 'A', 'G', 'E', 'D'] as const;

export const CAGED_COLORS: Record<CAGEDShape, string> = {
  'C': '#E53935',  // Red
  'A': '#1E88E5',  // Blue
  'G': '#43A047',  // Green
  'E': '#FB8C00',  // Orange
  'D': '#8E24AA'   // Purple
} as const;

// ============================================================================
// Interval Names
// ============================================================================

export const INTERVAL_NAMES = [
  '1', 'b2', '2', 'b3', '3', '4', 'b5', '5', '#5', '6', 'b7', '7'
] as const;

// ============================================================================
// Diatonic Chord Qualities (Major Scale)
// ============================================================================

/**
 * Chord qualities for each scale degree in major scale
 * I, ii, iii, IV, V, vi, vii°
 */
export const MAJOR_SCALE_CHORD_QUALITIES = [
  'major',      // I
  'minor',      // ii
  'minor',      // iii
  'major',      // IV
  'major',      // V
  'minor',      // vi
  'diminished'  // vii°
] as const;

/**
 * Roman numerals for major scale degrees
 */
export const MAJOR_SCALE_ROMAN_NUMERALS = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
] as const;

// ============================================================================
// Fretboard Constants
// ============================================================================

export const MIN_FRET = 0;
export const MAX_FRET = 15;
export const MAX_FRET_SPAN = 4;  // Maximum comfortable stretch

// ============================================================================
// Voice Leading Constants
// ============================================================================

export const VOICE_LEADING_THRESHOLDS = {
  excellent: 3,   // Total movement <= 3 semitones
  good: 6,        // Total movement <= 6 semitones
  acceptable: 9   // Total movement <= 9 semitones
} as const;

