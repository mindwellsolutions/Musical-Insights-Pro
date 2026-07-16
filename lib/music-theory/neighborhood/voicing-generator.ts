/**
 * Chord Neighborhood System - Voicing Generator
 * Converts triad positions to anchor voicings for neighborhood discovery
 */

import { AnchorVoicing } from './types';
import { TriadType } from '@/lib/triad-theory';
import { calculateTriadPositions, TriadPosition } from '@/lib/triad-positions';

/**
 * Convert a TriadPosition to an AnchorVoicing
 * @param position Triad position from triad-positions.ts
 * @returns AnchorVoicing object
 */
export function convertToAnchorVoicing(position: TriadPosition): AnchorVoicing {
  // Extract string indices and fret numbers
  const stringSet = position.stringPositions.map(sp => sp.stringIndex);
  const frets = position.stringPositions.map(sp => sp.fret);
  const notes = position.stringPositions.map(sp => sp.note);
  
  return {
    rootNote: position.rootNote,
    quality: position.triadType,
    stringSet,
    inversion: position.inversion,
    fretPosition: position.fretPosition,
    frets,
    notes,
  };
}

/**
 * Get all triad positions for a given root note and quality as AnchorVoicings
 * @param rootNote Root note of the triad
 * @param quality Triad quality
 * @returns Array of anchor voicings
 */
export function getAllTriadPositions(
  rootNote: string,
  quality: TriadType
): AnchorVoicing[] {
  // Get all triad positions from the existing system
  const positions = calculateTriadPositions(rootNote, quality);
  
  // Convert to anchor voicings
  return positions.map(convertToAnchorVoicing);
}

/**
 * Find a specific voicing by its properties
 * @param rootNote Root note
 * @param quality Triad quality
 * @param stringSet String set to match
 * @param fretPosition Fret position to match
 * @returns Matching anchor voicing or null
 */
export function findVoicing(
  rootNote: string,
  quality: TriadType,
  stringSet: number[],
  fretPosition: number
): AnchorVoicing | null {
  const allVoicings = getAllTriadPositions(rootNote, quality);
  
  for (const voicing of allVoicings) {
    if (
      arraysEqual(voicing.stringSet, stringSet) &&
      voicing.fretPosition === fretPosition
    ) {
      return voicing;
    }
  }
  
  return null;
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

/**
 * Convert an AnchorVoicing to note positions for fretboard display
 * @param voicing The anchor voicing to convert
 * @returns Array of note positions with chord tone metadata
 */
export function anchorVoicingToNotePositions(voicing: AnchorVoicing): any[] {
  const notePositions: any[] = [];

  // Determine chord tones based on the triad notes
  const rootNote = voicing.rootNote;

  for (let i = 0; i < voicing.stringSet.length; i++) {
    const stringIndex = voicing.stringSet[i];
    const fret = voicing.frets[i];
    const note = voicing.notes[i];

    // Determine chord tone type
    let chordTone: 'root' | 'third' | 'fifth' | 'seventh' = 'root';
    if (note === rootNote) {
      chordTone = 'root';
    } else {
      // For now, we'll determine this based on position in the voicing
      // This is a simplified approach - in a real implementation, you'd calculate intervals
      const noteIndex = i;
      if (voicing.inversion === 'root') {
        chordTone = noteIndex === 0 ? 'root' : noteIndex === 1 ? 'third' : 'fifth';
      } else if (voicing.inversion === 'first') {
        chordTone = noteIndex === 0 ? 'third' : noteIndex === 1 ? 'fifth' : 'root';
      } else { // second inversion
        chordTone = noteIndex === 0 ? 'fifth' : noteIndex === 1 ? 'root' : 'third';
      }
    }

    notePositions.push({
      stringIndex,
      fretNumber: fret,
      note,
      isRoot: note === rootNote,
      chordTone,
      isHarmonyNote: false,
    });
  }

  return notePositions;
}

