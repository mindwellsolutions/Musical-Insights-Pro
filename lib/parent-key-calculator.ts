/**
 * Parent Key Calculator
 * Determines the parent major key for a given triad and generates all 7 modes
 */

import { NOTES } from './musicTheory';
import { TriadType, normalizeNoteToSharp } from './triad-theory';

/**
 * Transpose a note by a number of semitones
 * @param note - The starting note (e.g., 'C', 'D#')
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns The transposed note
 */
export function transposeNote(note: string, semitones: number): string {
  // Normalize flat notes to sharp equivalents
  const normalizedNote = normalizeNoteToSharp(note);
  const noteIndex = NOTES.indexOf(normalizedNote);

  if (noteIndex === -1) {
    console.error(`Invalid note: ${note} (normalized to ${normalizedNote})`);
    return note;
  }

  // Handle negative semitones and wrap around
  const newIndex = (noteIndex + semitones + 12) % 12;
  return NOTES[newIndex];
}

/**
 * Mode information with root note
 */
export interface ModeWithRoot {
  rootNote: string;
  modeName: string;
  displayName: string;
  scaleDbKey: string;
  degree: number;
  isPrimary: boolean;
}

/**
 * Get the parent major key for a triad
 * 
 * Rules:
 * - Major triad: Parent key = triad root (C Major → C Major parent)
 * - Minor triad: Parent key = triad root + 3 semitones (C Minor → Eb Major parent)
 * - Diminished triad: Parent key = triad root + 1 semitone (C Dim → Db Major parent)
 * - Augmented triad: Special case - use harmonic minor or exotic scales
 * 
 * @param triadRoot - The root note of the triad
 * @param triadType - The type of triad (major, minor, diminished, augmented)
 * @returns The parent key root note
 */
export function getParentKey(triadRoot: string, triadType: TriadType): string {
  switch (triadType) {
    case 'major':
      // Major triad is the I chord of its parent key
      return triadRoot;
      
    case 'minor':
      // Minor triad is the vi chord of its parent key
      // C minor is the vi of Eb Major (C is 3 semitones below Eb)
      return transposeNote(triadRoot, 3);
      
    case 'diminished':
      // Diminished triad is the vii° chord of its parent key
      // C diminished is the vii° of Db Major (C is 1 semitone below Db)
      return transposeNote(triadRoot, 1);
      
    case 'augmented':
      // Augmented triads are not diatonic to major keys
      // Use the triad root as a starting point for exotic scales
      return triadRoot;
  }
}

/**
 * Get all 7 modes of a major key with their root notes
 * 
 * For C Major, returns:
 * - C Ionian (degree 1)
 * - D Dorian (degree 2)
 * - E Phrygian (degree 3)
 * - F Lydian (degree 4)
 * - G Mixolydian (degree 5)
 * - A Aeolian (degree 6)
 * - B Locrian (degree 7)
 * 
 * @param parentKey - The root note of the parent major key
 * @param triadType - The type of triad (to determine which mode is primary)
 * @returns Array of 7 modes with their root notes
 */
export function getSevenModesOfKey(parentKey: string, triadType: TriadType): ModeWithRoot[] {
  const modes = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
  
  // Semitone offsets for each scale degree in a major scale
  // C Major: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
  const semitoneOffsets = [0, 2, 4, 5, 7, 9, 11];
  
  // Determine which mode is primary based on triad type
  let primaryDegree: number;
  switch (triadType) {
    case 'major':
      primaryDegree = 1; // Ionian
      break;
    case 'minor':
      primaryDegree = 6; // Aeolian
      break;
    case 'diminished':
      primaryDegree = 7; // Locrian
      break;
    case 'augmented':
      primaryDegree = 1; // Default to Ionian (though augmented is not diatonic)
      break;
  }
  
  return modes.map((mode, index) => {
    const degree = index + 1;
    const rootNote = transposeNote(parentKey, semitoneOffsets[index]);
    
    return {
      rootNote,
      modeName: mode,
      displayName: `${rootNote} ${mode}`,
      scaleDbKey: mode,
      degree,
      isPrimary: degree === primaryDegree
    };
  });
}

/**
 * Get all 7 modes for a triad (combines parent key calculation and mode generation)
 * 
 * @param triadRoot - The root note of the triad
 * @param triadType - The type of triad
 * @returns Array of 7 modes with their root notes
 */
export function getModesForTriad(triadRoot: string, triadType: TriadType): ModeWithRoot[] {
  const parentKey = getParentKey(triadRoot, triadType);
  return getSevenModesOfKey(parentKey, triadType);
}

/**
 * Get the primary mode for a triad
 * 
 * @param triadRoot - The root note of the triad
 * @param triadType - The type of triad
 * @returns The primary mode
 */
export function getPrimaryModeForTriad(triadRoot: string, triadType: TriadType): ModeWithRoot | null {
  const modes = getModesForTriad(triadRoot, triadType);
  return modes.find(mode => mode.isPrimary) || null;
}

