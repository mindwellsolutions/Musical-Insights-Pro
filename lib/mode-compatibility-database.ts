/**
 * Mode Compatibility Database - Parent Key System
 * Returns all 7 modes of the parent key for each triad type
 *
 * Music Theory Rules:
 * - Major Triads: Show all 7 modes of the parent major key (e.g., C Major → C Ionian, D Dorian, E Phrygian, etc.)
 * - Minor Triads: Show all 7 modes of the parent major key (e.g., C Minor → Eb Ionian, F Dorian, G Phrygian, Ab Lydian, Bb Mixolydian, C Aeolian, D Locrian)
 * - Diminished Triads: Show all 7 modes of the parent major key (e.g., C Dim → Db Ionian, Eb Dorian, F Phrygian, Gb Lydian, Ab Mixolydian, Bb Aeolian, C Locrian)
 * - Augmented Triads: Special case - show exotic scales or harmonic minor modes
 */

import { TriadType } from './triad-theory';
import { getModesForTriad, ModeWithRoot } from './parent-key-calculator';

export interface ModeCompatibility {
  rootNote: string;           // Root note of this mode (e.g., "C", "D", "E")
  modeName: string;           // "Ionian", "Dorian", etc.
  displayName: string;        // "C Ionian", "D Dorian", etc. (includes root note)
  scaleDbKey: string;         // Key to lookup in music-theory database
  degree: number;             // Scale degree (1-7)
  isPrimary: boolean;         // Most recommended mode for this triad type
}

/**
 * Convert ModeWithRoot to ModeCompatibility format
 */
function convertToModeCompatibility(mode: ModeWithRoot): ModeCompatibility {
  return {
    rootNote: mode.rootNote,
    modeName: mode.modeName,
    displayName: mode.displayName,
    scaleDbKey: mode.scaleDbKey,
    degree: mode.degree,
    isPrimary: mode.isPrimary
  };
}

/**
 * Get all 7 modes of the parent key for a triad
 *
 * This is the main function that returns all compatible modes.
 * Each mode has a different root note but shares the same notes.
 *
 * Example: C Major triad returns:
 * - C Ionian (primary)
 * - D Dorian
 * - E Phrygian
 * - F Lydian
 * - G Mixolydian
 * - A Aeolian
 * - B Locrian
 *
 * @param triadRoot - The root note of the triad (e.g., 'C')
 * @param triadType - The type of triad (major, minor, diminished, augmented)
 * @returns Array of 7 modes with their root notes
 */
export function getCompatibleModesForTriad(
  triadRoot: string,
  triadType: TriadType
): ModeCompatibility[] {
  const modes = getModesForTriad(triadRoot, triadType);
  return modes.map(convertToModeCompatibility);
}

/**
 * Get the primary (most recommended) mode for a triad
 *
 * @param triadRoot - The root note of the triad
 * @param triadType - The type of triad
 * @returns The primary mode
 */
export function getPrimaryModeForTriad(
  triadRoot: string,
  triadType: TriadType
): ModeCompatibility | null {
  const modes = getCompatibleModesForTriad(triadRoot, triadType);
  return modes.find(m => m.isPrimary) || modes[0] || null;
}

/**
 * Get mode by name for a specific triad
 *
 * @param triadRoot - The root note of the triad
 * @param triadType - The type of triad
 * @param modeName - The name of the mode to find
 * @returns The mode if found, null otherwise
 */
export function getModeByName(
  triadRoot: string,
  triadType: TriadType,
  modeName: string
): ModeCompatibility | null {
  const modes = getCompatibleModesForTriad(triadRoot, triadType);
  return modes.find(m => m.modeName === modeName || m.scaleDbKey === modeName) || null;
}


