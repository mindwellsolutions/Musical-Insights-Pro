/**
 * Fretboard Learning System - Utility Functions
 */

import { CHROMATIC_SCALE, OPEN_STRINGS, NOTE_COLORS } from './constants';
import { NoteHighlight } from './types';

/**
 * Get the note at a specific string and fret position
 */
export function getNoteAtPosition(string: number, fret: number): string {
  // string: 1-6 (1 = high E, 6 = low E)
  // fret: 0-22
  const stringIndex = 6 - string; // Convert to 0-based index (0 = low E)
  const openNote = OPEN_STRINGS[stringIndex];
  const openNoteIndex = CHROMATIC_SCALE.indexOf(openNote);
  const noteIndex = (openNoteIndex + fret) % 12;
  return CHROMATIC_SCALE[noteIndex];
}

/**
 * Get all positions of a specific note on the fretboard
 */
export function getAllPositionsOfNote(
  note: string,
  fretRange: [number, number] = [0, 22]
): Array<{ string: number; fret: number }> {
  const positions: Array<{ string: number; fret: number }> = [];
  
  for (let string = 1; string <= 6; string++) {
    for (let fret = fretRange[0]; fret <= fretRange[1]; fret++) {
      if (getNoteAtPosition(string, fret) === note) {
        positions.push({ string, fret });
      }
    }
  }
  
  return positions;
}

/**
 * Create a NoteHighlight object for a given position
 */
export function createNoteHighlight(
  note: string,
  string: number,
  fret: number,
  options: Partial<NoteHighlight> = {}
): NoteHighlight {
  return {
    note,
    string,
    fret,
    color: NOTE_COLORS[note] || '#888888',
    borderColor: options.borderColor ?? null,
    borderWidth: options.borderWidth ?? 0,
    opacity: options.opacity ?? 1.0,
    pulse: options.pulse ?? false,
    glow: options.glow ?? false,
    label: options.label ?? null,
    size: options.size ?? 'normal',
  };
}

/**
 * Calculate octave position from a root position using octave shapes
 */
export function calculateOctavePosition(
  rootString: number,
  rootFret: number,
  targetString: number
): { fret: number; crossesB: boolean } | null {
  const stringDiff = rootString - targetString;
  
  // Check if this crosses the B string (string 2)
  const crossesB = (rootString > 2 && targetString <= 2) || (rootString <= 2 && targetString > 2);
  
  // Calculate fret offset based on string difference
  let fretOffset = 0;
  
  if (Math.abs(stringDiff) === 2) {
    // Two strings apart
    fretOffset = crossesB ? 3 : 2;
  } else if (Math.abs(stringDiff) === 3) {
    // Three strings apart
    fretOffset = 3;
  } else {
    return null; // Invalid octave shape
  }
  
  const targetFret = stringDiff > 0 ? rootFret + fretOffset : rootFret - fretOffset;
  
  if (targetFret < 0 || targetFret > 22) {
    return null; // Out of range
  }
  
  return { fret: targetFret, crossesB };
}

/**
 * Get the semitone distance between two notes
 */
export function getSemitoneDistance(note1: string, note2: string): number {
  const index1 = CHROMATIC_SCALE.indexOf(note1);
  const index2 = CHROMATIC_SCALE.indexOf(note2);
  
  if (index1 === -1 || index2 === -1) {
    return 0;
  }
  
  let distance = index2 - index1;
  if (distance < 0) {
    distance += 12;
  }
  
  return distance;
}

/**
 * Calculate proficiency probability for spaced repetition
 */
export function calculateSelectionProbability(score: number): number {
  // Score ranges from 0 (never seen) to 5 (mastered)
  // Higher scores should have lower probability of being selected
  return (6 - score) / 6;
}

/**
 * Update proficiency score based on answer correctness
 */
export function updateProficiencyScore(
  currentScore: number,
  correct: boolean,
  usedHint: boolean = false
): number {
  let newScore = currentScore;
  
  if (correct && !usedHint) {
    newScore = Math.min(5, currentScore + 1);
  } else if (correct && usedHint) {
    newScore = Math.min(5, currentScore + 0.5);
  } else {
    newScore = Math.max(0, currentScore - 2);
  }
  
  return newScore;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

