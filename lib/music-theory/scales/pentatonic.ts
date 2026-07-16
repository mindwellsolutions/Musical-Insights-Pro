/**
 * Pentatonic Scale System
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { PENTATONIC_FORMULAS } from '../constants';
import { createNote, addSemitones, getRelativeMinor, getRelativeMajor } from '../core/notes';
import type { 
  PentatonicScale, 
  PentatonicMode, 
  PitchClass, 
  Note 
} from '../types';

// ============================================================================
// Pentatonic Scale Building
// ============================================================================

/**
 * Build a pentatonic scale
 * @param root Root pitch class
 * @param mode Major or minor pentatonic
 * @param preferFlats Whether to prefer flat notation
 * @returns Pentatonic scale object
 */
export function buildPentatonicScale(
  root: PitchClass,
  mode: PentatonicMode,
  preferFlats: boolean = false
): PentatonicScale {
  const formula = PENTATONIC_FORMULAS[mode];
  
  // Create the five notes
  const notes: Note[] = formula.map(interval => 
    createNote(addSemitones(root, interval), preferFlats)
  );
  
  // Calculate relative major/minor
  const relativeRoot = mode === 'minor' 
    ? getRelativeMajor(root)
    : getRelativeMinor(root);
  const relative = createNote(relativeRoot, preferFlats);
  
  return {
    root: createNote(root, preferFlats),
    mode,
    notes: notes as [Note, Note, Note, Note, Note],
    intervals: formula as [0, number, number, number, number],
    relative
  };
}

/**
 * Get the pentatonic scale for a major key (returns relative minor pentatonic)
 * This is the core of the Pentatonic Triad Anchor System
 * @param majorRoot Major key root
 * @param preferFlats Whether to prefer flat notation
 * @returns Minor pentatonic scale (relative minor)
 */
export function getPentatonicForMajorKey(
  majorRoot: PitchClass,
  preferFlats: boolean = false
): PentatonicScale {
  const minorRoot = getRelativeMinor(majorRoot);
  return buildPentatonicScale(minorRoot, 'minor', preferFlats);
}

/**
 * Get the pentatonic scale for a minor key (returns the minor pentatonic)
 * @param minorRoot Minor key root
 * @param preferFlats Whether to prefer flat notation
 * @returns Minor pentatonic scale
 */
export function getPentatonicForMinorKey(
  minorRoot: PitchClass,
  preferFlats: boolean = false
): PentatonicScale {
  return buildPentatonicScale(minorRoot, 'minor', preferFlats);
}

// ============================================================================
// Pentatonic Scale Analysis
// ============================================================================

/**
 * Check if a pitch class is in a pentatonic scale
 * @param pitchClass Pitch class to check
 * @param scale Pentatonic scale
 * @returns True if pitch class is in the scale
 */
export function isPitchInPentatonic(
  pitchClass: PitchClass,
  scale: PentatonicScale
): boolean {
  return scale.notes.some(note => note.pitchClass === pitchClass);
}

/**
 * Get the scale degree of a pitch class in a pentatonic scale
 * @param pitchClass Pitch class to check
 * @param scale Pentatonic scale
 * @returns Scale degree (1-5) or null if not in scale
 */
export function getPentatonicDegree(
  pitchClass: PitchClass,
  scale: PentatonicScale
): number | null {
  const index = scale.notes.findIndex(note => note.pitchClass === pitchClass);
  return index >= 0 ? index + 1 : null;
}

/**
 * Get interval from root for a pitch class in pentatonic scale
 * @param pitchClass Pitch class to check
 * @param scale Pentatonic scale
 * @returns Interval in semitones or null if not in scale
 */
export function getPentatonicInterval(
  pitchClass: PitchClass,
  scale: PentatonicScale
): number | null {
  const degree = getPentatonicDegree(pitchClass, scale);
  return degree !== null ? scale.intervals[degree - 1] : null;
}

// ============================================================================
// Pentatonic Modes
// ============================================================================

/**
 * Get all five modes of a pentatonic scale
 * @param scale Base pentatonic scale
 * @param preferFlats Whether to prefer flat notation
 * @returns Array of five pentatonic scales (one for each mode)
 */
export function getPentatonicModes(
  scale: PentatonicScale,
  preferFlats: boolean = false
): PentatonicScale[] {
  const modes: PentatonicScale[] = [];
  
  for (let i = 0; i < 5; i++) {
    const modeRoot = scale.notes[i].pitchClass;
    const modeScale = buildPentatonicScale(modeRoot, scale.mode, preferFlats);
    modes.push(modeScale);
  }
  
  return modes;
}

/**
 * Get pentatonic scale name
 * @param scale Pentatonic scale
 * @returns Scale name (e.g., "A Minor Pentatonic", "C Major Pentatonic")
 */
export function getPentatonicScaleName(scale: PentatonicScale): string {
  const modeName = scale.mode === 'minor' ? 'Minor' : 'Major';
  return `${scale.root.name} ${modeName} Pentatonic`;
}

