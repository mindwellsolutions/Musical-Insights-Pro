/**
 * Core Note Calculation Utilities
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { STANDARD_TUNING, NOTES_SHARP, NOTES_FLAT } from '../constants';
import type { 
  PitchClass, 
  Note, 
  NoteName, 
  StringNumber, 
  FretNumber, 
  FretPosition 
} from '../types';

// ============================================================================
// Note Calculation
// ============================================================================

/**
 * Calculate the pitch class at a given fretboard position
 * @param string String number (1-6)
 * @param fret Fret number (0-24)
 * @returns Pitch class (0-11)
 */
export function getPitchClass(string: StringNumber, fret: FretNumber): PitchClass {
  const openStringPitch = STANDARD_TUNING[string - 1];
  return ((openStringPitch + fret) % 12) as PitchClass;
}

/**
 * Get note name from pitch class
 * @param pitchClass Pitch class (0-11)
 * @param preferFlats Whether to prefer flat notation
 * @returns Note name
 */
export function getNoteName(pitchClass: PitchClass, preferFlats = false): NoteName {
  return preferFlats ? NOTES_FLAT[pitchClass] : NOTES_SHARP[pitchClass];
}

/**
 * Get pitch class from note name
 * @param noteName Note name (e.g., 'C', 'D#', 'Eb')
 * @returns Pitch class (0-11)
 */
export function pitchClassFromName(noteName: string): PitchClass {
  let index = NOTES_SHARP.indexOf(noteName as any);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(noteName as any);
  }
  if (index === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  return index as PitchClass;
}

/**
 * Create a Note object from pitch class
 * @param pitchClass Pitch class (0-11)
 * @param preferFlats Whether to prefer flat notation
 * @returns Note object
 */
export function createNote(pitchClass: PitchClass, preferFlats = false): Note {
  const name = getNoteName(pitchClass, preferFlats);
  const enharmonic = preferFlats ? NOTES_SHARP[pitchClass] : NOTES_FLAT[pitchClass];
  
  return {
    pitchClass,
    name,
    enharmonic: name !== enharmonic ? enharmonic : undefined
  };
}

// ============================================================================
// Relative Key Calculations
// ============================================================================

/**
 * Get relative minor from major root
 * Formula: Relative Minor = Major Root - 3 semitones
 * @param majorRoot Major key root pitch class
 * @returns Minor key root pitch class
 */
export function getRelativeMinor(majorRoot: PitchClass): PitchClass {
  return ((majorRoot - 3 + 12) % 12) as PitchClass;
}

/**
 * Get relative major from minor root
 * Formula: Relative Major = Minor Root + 3 semitones
 * @param minorRoot Minor key root pitch class
 * @returns Major key root pitch class
 */
export function getRelativeMajor(minorRoot: PitchClass): PitchClass {
  return ((minorRoot + 3) % 12) as PitchClass;
}

// ============================================================================
// Fretboard Position Finding
// ============================================================================

/**
 * Find all positions of a pitch class on the fretboard
 * @param pitchClass Pitch class to find
 * @param minFret Minimum fret (default 0)
 * @param maxFret Maximum fret (default 15)
 * @returns Array of fretboard positions
 */
export function findAllPositions(
  pitchClass: PitchClass,
  minFret: FretNumber = 0,
  maxFret: FretNumber = 15
): FretPosition[] {
  const positions: FretPosition[] = [];
  
  for (let string = 1; string <= 6; string++) {
    for (let fret = minFret; fret <= maxFret; fret++) {
      if (getPitchClass(string as StringNumber, fret) === pitchClass) {
        positions.push({ 
          string: string as StringNumber, 
          fret 
        });
      }
    }
  }
  
  return positions;
}

/**
 * Find positions of a pitch class on a specific string
 * @param pitchClass Pitch class to find
 * @param string String number
 * @param minFret Minimum fret (default 0)
 * @param maxFret Maximum fret (default 24)
 * @returns Array of fret numbers
 */
export function findPositionsOnString(
  pitchClass: PitchClass,
  string: StringNumber,
  minFret: FretNumber = 0,
  maxFret: FretNumber = 24
): FretNumber[] {
  const frets: FretNumber[] = [];
  
  for (let fret = minFret; fret <= maxFret; fret++) {
    if (getPitchClass(string, fret) === pitchClass) {
      frets.push(fret);
    }
  }
  
  return frets;
}

/**
 * Get the note at a specific fretboard position
 * @param position Fretboard position
 * @param preferFlats Whether to prefer flat notation
 * @returns Note object
 */
export function getNoteAtPosition(
  position: FretPosition,
  preferFlats = false
): Note {
  const pitchClass = getPitchClass(position.string, position.fret);
  return createNote(pitchClass, preferFlats);
}

// ============================================================================
// Pitch Class Arithmetic
// ============================================================================

/**
 * Add semitones to a pitch class
 * @param pitchClass Starting pitch class
 * @param semitones Semitones to add
 * @returns Resulting pitch class
 */
export function addSemitones(pitchClass: PitchClass, semitones: number): PitchClass {
  return ((pitchClass + semitones) % 12 + 12) % 12 as PitchClass;
}

/**
 * Calculate interval between two pitch classes
 * @param from Starting pitch class
 * @param to Ending pitch class
 * @returns Interval in semitones (0-11)
 */
export function getInterval(from: PitchClass, to: PitchClass): number {
  return ((to - from + 12) % 12);
}

