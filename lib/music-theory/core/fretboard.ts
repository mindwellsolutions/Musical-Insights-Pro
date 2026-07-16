/**
 * Fretboard Position Utilities
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { STRING_SETS, MAX_FRET_SPAN } from '../constants';
import { getPitchClass } from './notes';
import type { 
  FretPosition, 
  StringNumber, 
  FretNumber, 
  StringSet 
} from '../types';

// ============================================================================
// Position Validation
// ============================================================================

/**
 * Check if a fretboard position is valid
 * @param position Fretboard position
 * @param maxFret Maximum fret number (default 24)
 * @returns True if position is valid
 */
export function isValidPosition(
  position: FretPosition,
  maxFret: FretNumber = 24
): boolean {
  return (
    position.string >= 1 &&
    position.string <= 6 &&
    position.fret >= 0 &&
    position.fret <= maxFret
  );
}

/**
 * Check if positions are playable together (within fret span)
 * @param positions Array of fretboard positions
 * @param maxSpan Maximum fret span (default 4)
 * @returns True if positions are playable together
 */
export function arePositionsPlayable(
  positions: FretPosition[],
  maxSpan: number = MAX_FRET_SPAN
): boolean {
  if (positions.length === 0) return true;
  
  const frets = positions.map(p => p.fret).filter(f => f > 0); // Exclude open strings
  if (frets.length === 0) return true;
  
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  
  return (maxFret - minFret) <= maxSpan;
}

// ============================================================================
// Position Calculations
// ============================================================================

/**
 * Calculate fret span for a set of positions
 * @param positions Array of fretboard positions
 * @returns Fret span (0 if all open strings)
 */
export function calculateFretSpan(positions: FretPosition[]): number {
  const frets = positions.map(p => p.fret).filter(f => f > 0);
  if (frets.length === 0) return 0;
  
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  
  return maxFret - minFret;
}

/**
 * Get lowest fret from positions (excluding open strings)
 * @param positions Array of fretboard positions
 * @returns Lowest fret number (0 if all open)
 */
export function getLowestFret(positions: FretPosition[]): FretNumber {
  const frets = positions.map(p => p.fret).filter(f => f > 0);
  return frets.length > 0 ? Math.min(...frets) : 0;
}

/**
 * Get highest fret from positions
 * @param positions Array of fretboard positions
 * @returns Highest fret number
 */
export function getHighestFret(positions: FretPosition[]): FretNumber {
  const frets = positions.map(p => p.fret);
  return frets.length > 0 ? Math.max(...frets) : 0;
}

/**
 * Calculate center fret for a set of positions
 * @param positions Array of fretboard positions
 * @returns Center fret (rounded)
 */
export function getCenterFret(positions: FretPosition[]): FretNumber {
  const lowest = getLowestFret(positions);
  const highest = getHighestFret(positions);
  return Math.round((lowest + highest) / 2);
}

// ============================================================================
// String Set Utilities
// ============================================================================

/**
 * Check if positions are on a specific string set
 * @param positions Array of fretboard positions
 * @param stringSet String set to check
 * @returns True if all positions are on the string set
 */
export function arePositionsOnStringSet(
  positions: FretPosition[],
  stringSet: StringSet
): boolean {
  const strings = STRING_SETS[stringSet];
  return positions.every(p => strings.includes(p.string));
}

/**
 * Get string set for a set of positions
 * @param positions Array of fretboard positions (should be 3 positions)
 * @returns String set ID or null if not a valid string set
 */
export function getStringSetForPositions(
  positions: FretPosition[]
): StringSet | null {
  if (positions.length !== 3) return null;
  
  const strings = positions.map(p => p.string).sort((a, b) => b - a); // Descending order
  
  for (const [setId, setStrings] of Object.entries(STRING_SETS)) {
    if (
      setStrings[0] === strings[0] &&
      setStrings[1] === strings[1] &&
      setStrings[2] === strings[2]
    ) {
      return setId as StringSet;
    }
  }
  
  return null;
}

// ============================================================================
// Position Comparison
// ============================================================================

/**
 * Check if two positions are the same
 * @param pos1 First position
 * @param pos2 Second position
 * @returns True if positions are identical
 */
export function arePositionsEqual(
  pos1: FretPosition,
  pos2: FretPosition
): boolean {
  return pos1.string === pos2.string && pos1.fret === pos2.fret;
}

/**
 * Calculate distance between two positions (in frets)
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Distance in frets
 */
export function getPositionDistance(
  pos1: FretPosition,
  pos2: FretPosition
): number {
  if (pos1.string !== pos2.string) {
    // Different strings - use pitch distance
    const pitch1 = getPitchClass(pos1.string, pos1.fret);
    const pitch2 = getPitchClass(pos2.string, pos2.fret);
    return Math.abs(pitch2 - pitch1);
  } else {
    // Same string - use fret distance
    return Math.abs(pos2.fret - pos1.fret);
  }
}

/**
 * Sort positions by string (high to low) then by fret
 * @param positions Array of positions to sort
 * @returns Sorted array
 */
export function sortPositions(positions: FretPosition[]): FretPosition[] {
  return [...positions].sort((a, b) => {
    if (a.string !== b.string) {
      return a.string - b.string; // Lower string number = higher pitch
    }
    return a.fret - b.fret;
  });
}

