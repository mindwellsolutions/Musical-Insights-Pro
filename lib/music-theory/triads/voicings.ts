/**
 * Triad Voicing Generation
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { STRING_SETS, MAX_FRET_SPAN } from '../constants';
import { findPositionsOnString, getNoteAtPosition } from '../core/notes';
import { arePositionsPlayable, getCenterFret, getLowestFret, getHighestFret } from '../core/fretboard';
import { getInversionNotes } from './builder';
import { calculateFingering } from './fingering';
import type {
  Triad,
  TriadVoicing,
  StringSet,
  Inversion,
  FretNumber,
  FretboardNote,
  StringNumber,
  FretPosition
} from '../types';

// ============================================================================
// Voicing Generation
// ============================================================================

/**
 * Find all voicings of a triad on a specific string set and inversion
 * @param triad Triad to voice
 * @param stringSet String set to use
 * @param inversion Inversion type
 * @param fretRange Fret range [min, max]
 * @returns Array of triad voicings
 */
export function findVoicingsOnStringSet(
  triad: Triad,
  stringSet: StringSet,
  inversion: Inversion,
  fretRange: [FretNumber, FretNumber] = [0, 15]
): TriadVoicing[] {
  const voicings: TriadVoicing[] = [];
  const strings = STRING_SETS[stringSet];
  const notes = getInversionNotes(triad, inversion);
  
  // Get the three strings for this set (bass, middle, treble)
  const bassString = strings[0] as StringNumber;
  const middleString = strings[1] as StringNumber;
  const trebleString = strings[2] as StringNumber;
  
  // Find all bass note positions on the bass string
  const bassPositions = findPositionsOnString(
    notes[0].pitchClass,
    bassString,
    fretRange[0],
    fretRange[1]
  );
  
  for (const bassFret of bassPositions) {
    // Find middle and treble positions
    const middlePositions = findPositionsOnString(
      notes[1].pitchClass,
      middleString,
      0,
      24
    );
    
    const treblePositions = findPositionsOnString(
      notes[2].pitchClass,
      trebleString,
      0,
      24
    );
    
    // Try all combinations
    for (const middleFret of middlePositions) {
      for (const trebleFret of treblePositions) {
        const positions = [
          { string: bassString, fret: bassFret },
          { string: middleString, fret: middleFret },
          { string: trebleString, fret: trebleFret }
        ];
        
        // Check if playable (within fret span)
        if (arePositionsPlayable(positions, MAX_FRET_SPAN)) {
          const lowestFret = getLowestFret(positions);
          const highestFret = getHighestFret(positions);
          
          // Check if within fret range
          if (lowestFret >= fretRange[0] && highestFret <= fretRange[1]) {
            // Create fretboard notes
            const fretboardNotes: [FretboardNote, FretboardNote, FretboardNote] = [
              {
                ...positions[0],
                note: notes[0],
                isTriadNote: true,
                isRoot: notes[0].pitchClass === triad.root.pitchClass
              },
              {
                ...positions[1],
                note: notes[1],
                isTriadNote: true,
                isRoot: notes[1].pitchClass === triad.root.pitchClass
              },
              {
                ...positions[2],
                note: notes[2],
                isTriadNote: true,
                isRoot: notes[2].pitchClass === triad.root.pitchClass
              }
            ];

            // Calculate fingering - validate array length
            if (positions.length !== 3) {
              throw new Error(`Expected 3 positions for triad voicing, got ${positions.length}`);
            }
            const fingering = calculateFingering(positions as [FretPosition, FretPosition, FretPosition]);
            
            // Create voicing ID
            const voicingId = `${triad.root.name}-${triad.quality}-${stringSet}-${inversion}-${bassFret}`;
            
            // Create voicing
            const voicing: TriadVoicing = {
              ...triad,
              inversion,
              stringSet,
              positions: fretboardNotes,
              lowestFret,
              highestFret,
              centerFret: getCenterFret(positions),
              fingering,
              voicingId
            };
            
            voicings.push(voicing);
          }
        }
      }
    }
  }
  
  return voicings;
}

/**
 * Find all voicings of a triad across all string sets and inversions
 * @param triad Triad to voice
 * @param stringSets String sets to use (default: all)
 * @param inversions Inversions to use (default: all)
 * @param fretRange Fret range [min, max]
 * @returns Array of all triad voicings
 */
export function findAllVoicings(
  triad: Triad,
  stringSets: StringSet[] = ['123', '234', '345', '456'],
  inversions: Inversion[] = ['root', 'first', 'second'],
  fretRange: [FretNumber, FretNumber] = [0, 15]
): TriadVoicing[] {
  const allVoicings: TriadVoicing[] = [];
  
  for (const stringSet of stringSets) {
    for (const inversion of inversions) {
      const voicings = findVoicingsOnStringSet(triad, stringSet, inversion, fretRange);
      allVoicings.push(...voicings);
    }
  }
  
  return allVoicings;
}

