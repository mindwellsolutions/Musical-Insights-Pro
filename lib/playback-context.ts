/**
 * Playback Context and Utilities
 * Manages timeline playback state and provides utilities for finding current chord/scale
 */

import { ChordInstance, ScaleModeInstance } from './chord-progression/types';

/**
 * Get the currently playing chord at a given time
 */
export function getCurrentChord(
  chords: ChordInstance[],
  currentTime: number
): ChordInstance | null {
  if (!chords || chords.length === 0) return null;

  // Find chord that contains the current time
  const activeChord = chords.find(chord => {
    const startTime = chord.startTime;
    const endTime = chord.startTime + chord.duration;
    return currentTime >= startTime && currentTime < endTime;
  });

  return activeChord || null;
}

/**
 * Get the currently playing scale/mode at a given time
 */
export function getCurrentScale(
  scales: ScaleModeInstance[],
  currentTime: number
): ScaleModeInstance | null {
  if (!scales || scales.length === 0) return null;

  // Find scale that contains the current time
  const activeScale = scales.find(scale => {
    const startTime = scale.startTime;
    const endTime = scale.startTime + scale.duration;
    return currentTime >= startTime && currentTime < endTime;
  });

  return activeScale || null;
}

/**
 * Get the next chord that will play
 */
export function getNextChord(
  chords: ChordInstance[],
  currentTime: number
): ChordInstance | null {
  if (!chords || chords.length === 0) return null;

  // Find the next chord after current time
  const nextChord = chords
    .filter(chord => chord.startTime > currentTime)
    .sort((a, b) => a.startTime - b.startTime)[0];

  return nextChord || null;
}

/**
 * Get the previous chord that played
 */
export function getPreviousChord(
  chords: ChordInstance[],
  currentTime: number
): ChordInstance | null {
  if (!chords || chords.length === 0) return null;

  // Find the most recent chord before current time
  const previousChord = chords
    .filter(chord => chord.startTime + chord.duration <= currentTime)
    .sort((a, b) => b.startTime - a.startTime)[0];

  return previousChord || null;
}

/**
 * Calculate total duration of the progression
 */
export function getTotalDuration(
  chords: ChordInstance[],
  scales: ScaleModeInstance[]
): number {
  let maxDuration = 0;

  // Check chords
  chords.forEach(chord => {
    const endTime = chord.startTime + chord.duration;
    if (endTime > maxDuration) maxDuration = endTime;
  });

  // Check scales
  scales.forEach(scale => {
    const endTime = scale.startTime + scale.duration;
    if (endTime > maxDuration) maxDuration = endTime;
  });

  return maxDuration;
}

/**
 * Check if playback is at the end
 */
export function isAtEnd(
  currentTime: number,
  chords: ChordInstance[],
  scales: ScaleModeInstance[]
): boolean {
  const totalDuration = getTotalDuration(chords, scales);
  return currentTime >= totalDuration;
}

/**
 * Get all chords in a time range
 */
export function getChordsInRange(
  chords: ChordInstance[],
  startTime: number,
  endTime: number
): ChordInstance[] {
  return chords.filter(chord => {
    const chordStart = chord.startTime;
    const chordEnd = chord.startTime + chord.duration;
    
    // Check if chord overlaps with the time range
    return (chordStart < endTime && chordEnd > startTime);
  });
}

/**
 * Get time until next chord change
 */
export function getTimeUntilNextChord(
  chords: ChordInstance[],
  currentTime: number
): number | null {
  const currentChord = getCurrentChord(chords, currentTime);
  const nextChord = getNextChord(chords, currentTime);

  if (currentChord) {
    // Time until current chord ends
    return (currentChord.startTime + currentChord.duration) - currentTime;
  } else if (nextChord) {
    // Time until next chord starts
    return nextChord.startTime - currentTime;
  }

  return null;
}

