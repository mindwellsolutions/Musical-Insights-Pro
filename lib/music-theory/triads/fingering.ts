/**
 * Fingering Algorithm for Triad Voicings
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { calculateFretSpan } from '../core/fretboard';
import type { 
  TriadFingering, 
  FretPosition, 
  FingerNumber 
} from '../types';

// ============================================================================
// Fingering Calculation
// ============================================================================

/**
 * Calculate optimal fingering for a triad voicing
 * @param positions Three fretboard positions [bass, middle, treble]
 * @returns Fingering assignment
 */
export function calculateFingering(
  positions: [FretPosition, FretPosition, FretPosition]
): TriadFingering {
  const frets = positions.map(p => p.fret);
  const span = calculateFretSpan(positions);
  
  // Check for open strings
  const hasOpenStrings = frets.some(f => f === 0);
  
  // Check if all notes are on the same fret (barre)
  const uniqueFrets = [...new Set(frets.filter(f => f > 0))];
  const usesBarre = uniqueFrets.length === 1 && !hasOpenStrings;
  
  let fingers: [FingerNumber, FingerNumber, FingerNumber];
  let difficulty: 1 | 2 | 3 | 4 | 5;
  
  if (usesBarre) {
    // All notes on same fret - use barre
    fingers = [1, 1, 1];
    difficulty = span === 0 ? 1 : 2;
  } else if (hasOpenStrings) {
    // Has open strings - assign fingers to fretted notes
    fingers = assignFingersWithOpenStrings(positions);
    difficulty = 1;
  } else {
    // Standard fingering
    fingers = assignStandardFingering(positions);
    difficulty = calculateDifficulty(span, fingers);
  }
  
  return {
    fingers,
    usesBarre,
    span,
    difficulty
  };
}

/**
 * Assign fingers when there are open strings
 * @param positions Three fretboard positions
 * @returns Finger assignments
 */
function assignFingersWithOpenStrings(
  positions: [FretPosition, FretPosition, FretPosition]
): [FingerNumber, FingerNumber, FingerNumber] {
  const fingers: FingerNumber[] = [];
  
  for (const pos of positions) {
    if (pos.fret === 0) {
      fingers.push(0 as FingerNumber); // Open string (will be filtered)
    } else {
      // Assign finger based on fret
      fingers.push(Math.min(pos.fret, 4) as FingerNumber);
    }
  }
  
  return fingers as [FingerNumber, FingerNumber, FingerNumber];
}

/**
 * Assign standard fingering (no open strings, no barre)
 * @param positions Three fretboard positions
 * @returns Finger assignments
 */
function assignStandardFingering(
  positions: [FretPosition, FretPosition, FretPosition]
): [FingerNumber, FingerNumber, FingerNumber] {
  const frets = positions.map(p => p.fret);
  const minFret = Math.min(...frets.filter(f => f > 0));
  
  // Assign fingers relative to lowest fret
  const fingers = frets.map(fret => {
    if (fret === 0) return 0 as FingerNumber;
    const offset = fret - minFret;
    return Math.min(offset + 1, 4) as FingerNumber;
  });
  
  return fingers as [FingerNumber, FingerNumber, FingerNumber];
}

/**
 * Calculate difficulty rating for a fingering
 * @param span Fret span
 * @param fingers Finger assignments
 * @returns Difficulty rating (1-5)
 */
function calculateDifficulty(
  span: number,
  fingers: [FingerNumber, FingerNumber, FingerNumber]
): 1 | 2 | 3 | 4 | 5 {
  // Base difficulty on span
  if (span === 0) return 1;
  if (span === 1) return 1;
  if (span === 2) return 2;
  if (span === 3) return 3;
  if (span === 4) return 4;
  return 5;
}

// ============================================================================
// Fingering Analysis
// ============================================================================

/**
 * Check if a fingering is comfortable
 * @param fingering Fingering to check
 * @returns True if comfortable
 */
export function isComfortableFingering(fingering: TriadFingering): boolean {
  return fingering.difficulty <= 3 && fingering.span <= 4;
}

/**
 * Compare two fingerings for difficulty
 * @param f1 First fingering
 * @param f2 Second fingering
 * @returns Negative if f1 is easier, positive if f2 is easier, 0 if equal
 */
export function compareFingerings(
  f1: TriadFingering,
  f2: TriadFingering
): number {
  // First compare difficulty
  if (f1.difficulty !== f2.difficulty) {
    return f1.difficulty - f2.difficulty;
  }
  
  // Then compare span
  if (f1.span !== f2.span) {
    return f1.span - f2.span;
  }
  
  // Prefer non-barre over barre
  if (f1.usesBarre !== f2.usesBarre) {
    return f1.usesBarre ? 1 : -1;
  }
  
  return 0;
}

/**
 * Get fingering description for display
 * @param fingering Fingering object
 * @returns Human-readable description
 */
export function getFingeringDescription(fingering: TriadFingering): string {
  if (fingering.usesBarre) {
    return `Barre (span: ${fingering.span})`;
  }
  
  const fingerStr = fingering.fingers
    .map(f => f === 0 ? 'O' : f.toString())
    .join('-');
  
  return `Fingers: ${fingerStr} (span: ${fingering.span})`;
}

