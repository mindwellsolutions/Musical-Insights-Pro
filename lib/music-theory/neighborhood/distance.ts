/**
 * Chord Neighborhood System - Distance Calculation
 * Calculates fretboard distance between voicings
 */

import { AnchorVoicing } from './types';

/**
 * Calculate the distance between two voicings
 * Distance is the maximum fret movement required across all strings
 * 
 * @param voicing1 First voicing
 * @param voicing2 Second voicing
 * @returns Distance in frets
 */
export function calculateDistance(
  voicing1: AnchorVoicing,
  voicing2: AnchorVoicing
): number {
  // If voicings use different string sets, calculate based on fret positions
  if (!arraysEqual(voicing1.stringSet, voicing2.stringSet)) {
    return Math.abs(voicing2.fretPosition - voicing1.fretPosition);
  }
  
  // Same string set - calculate max fret movement across strings
  let maxDistance = 0;
  
  for (let i = 0; i < voicing1.frets.length; i++) {
    const distance = Math.abs(voicing2.frets[i] - voicing1.frets[i]);
    maxDistance = Math.max(maxDistance, distance);
  }
  
  return maxDistance;
}

/**
 * Count common tones between two voicings
 * @param voicing1 First voicing
 * @param voicing2 Second voicing
 * @returns Number of common tones
 */
export function countCommonTones(
  voicing1: AnchorVoicing,
  voicing2: AnchorVoicing
): number {
  const notes1 = new Set(voicing1.notes);
  const notes2 = new Set(voicing2.notes);
  
  let commonCount = 0;
  for (const note of notes1) {
    if (notes2.has(note)) {
      commonCount++;
    }
  }
  
  return commonCount;
}

/**
 * Get the common tone note names between two voicings
 * @param voicing1 First voicing
 * @param voicing2 Second voicing
 * @returns Array of common tone note names
 */
export function getCommonToneNotes(
  voicing1: AnchorVoicing,
  voicing2: AnchorVoicing
): string[] {
  const notes1 = new Set(voicing1.notes);
  const notes2 = new Set(voicing2.notes);
  
  const commonNotes: string[] = [];
  for (const note of notes1) {
    if (notes2.has(note)) {
      commonNotes.push(note);
    }
  }
  
  return commonNotes;
}

/**
 * Check if a voicing is within a distance range from an anchor
 * @param anchor Anchor voicing
 * @param target Target voicing
 * @param minDistance Minimum distance in frets
 * @param maxDistance Maximum distance in frets
 * @returns True if within range
 */
export function isWithinRange(
  anchor: AnchorVoicing,
  target: AnchorVoicing,
  minDistance: number,
  maxDistance: number
): boolean {
  const distance = calculateDistance(anchor, target);
  return distance >= minDistance && distance <= maxDistance;
}

/**
 * Helper function to compare arrays for equality
 */
function arraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

