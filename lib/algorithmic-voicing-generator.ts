/**
 * Algorithmic Voicing Generator
 * Generates chord voicings for any chord type using music theory
 * Fallback for chords not in the standard database
 */

import { ChordVoicing, FingerPosition } from './chord-voicings';
import { NOTES } from './musicTheory';

/**
 * Get note at a specific fret on a string
 */
function getNoteAtFret(openNote: string, fret: number): string {
  const noteIndex = NOTES.indexOf(openNote);
  if (noteIndex === -1) return openNote;
  return NOTES[(noteIndex + fret) % 12];
}

/**
 * Check if a note is in the chord
 */
function isNoteInChord(note: string, chordNotes: string[]): boolean {
  return chordNotes.some(chordNote => {
    // Normalize enharmonic equivalents
    const noteIndex = NOTES.indexOf(note);
    const chordNoteIndex = NOTES.indexOf(chordNote);
    return noteIndex === chordNoteIndex;
  });
}

/**
 * Generate chord notes from root and intervals
 */
export function generateChordNotes(rootNote: string, intervals: number[]): string[] {
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTES[noteIndex];
  });
}

/**
 * Generate voicings algorithmically for a chord
 */
export function generateAlgorithmicVoicings(
  rootNote: string,
  intervals: number[],
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret: number = 15
): ChordVoicing[] {
  const chordNotes = generateChordNotes(rootNote, intervals);
  const voicings: ChordVoicing[] = [];
  
  // Generate voicings in different positions
  for (let baseFret = 0; baseFret <= maxFret - 4; baseFret += 2) {
    const voicing = generateVoicingAtPosition(
      rootNote,
      chordNotes,
      tuning,
      baseFret,
      Math.min(baseFret + 4, maxFret)
    );
    
    if (voicing && isValidVoicing(voicing, chordNotes)) {
      voicings.push(voicing);
    }
  }
  
  return voicings;
}

/**
 * Generate a voicing at a specific position
 */
function generateVoicingAtPosition(
  rootNote: string,
  chordNotes: string[],
  tuning: string[],
  minFret: number,
  maxFret: number
): ChordVoicing | null {
  const positions: FingerPosition[] = [];
  let foundRoot = false;
  let notesFound = 0;
  
  // Try to find chord notes on each string
  for (let stringIndex = tuning.length - 1; stringIndex >= 0; stringIndex--) {
    const openNote = tuning[stringIndex];
    let bestFret = -1;
    let bestNote = '';
    let isRoot = false;
    
    // Search for chord notes within the fret range
    for (let fret = minFret; fret <= maxFret; fret++) {
      const note = getNoteAtFret(openNote, fret);
      
      if (isNoteInChord(note, chordNotes)) {
        // Prefer root notes
        if (note === rootNote && !foundRoot) {
          bestFret = fret;
          bestNote = note;
          isRoot = true;
          foundRoot = true;
          break;
        } else if (bestFret === -1) {
          bestFret = fret;
          bestNote = note;
          isRoot = note === rootNote;
        }
      }
    }
    
    if (bestFret >= 0) {
      positions.push({
        stringIndex,
        fret: bestFret,
        note: bestNote,
        isRoot,
        finger: bestFret === 0 ? 0 : undefined,
      });
      notesFound++;
    } else {
      positions.push({
        stringIndex,
        fret: -1,
        note: '',
        finger: undefined,
      });
    }
  }
  
  // Need at least 3 notes for a valid voicing
  if (notesFound < 3 || !foundRoot) {
    return null;
  }
  
  const frettedPositions = positions.filter(p => p.fret > 0);
  const frets = frettedPositions.map(p => p.fret);
  const startFret = frets.length > 0 ? Math.min(...frets) : 0;
  const endFret = frets.length > 0 ? Math.max(...frets) : 0;
  
  return {
    name: `${rootNote} - Fret ${startFret}`,
    positions,
    startFret,
    endFret,
    difficulty: calculateDifficulty(positions),
    commonName: startFret === 0 ? 'Open Position' : `Position ${startFret}`,
  };
}

/**
 * Check if a voicing is valid (contains essential chord tones)
 */
function isValidVoicing(voicing: ChordVoicing, chordNotes: string[]): boolean {
  const voicingNotes = new Set(
    voicing.positions
      .filter(p => p.fret >= 0 && p.note)
      .map(p => p.note)
  );
  
  // Must have at least 3 different notes
  if (voicingNotes.size < 3) return false;
  
  // Must have the root
  const hasRoot = voicing.positions.some(p => p.isRoot);
  if (!hasRoot) return false;
  
  return true;
}

/**
 * Calculate difficulty rating
 */
function calculateDifficulty(positions: FingerPosition[]): number {
  const frettedPositions = positions.filter(p => p.fret > 0);
  const frets = frettedPositions.map(p => p.fret);
  
  if (frets.length === 0) return 1;
  
  const span = Math.max(...frets) - Math.min(...frets);
  const minFret = Math.min(...frets);
  
  let difficulty = 1;
  
  if (span > 3) difficulty += 2;
  else if (span > 2) difficulty += 1;
  
  if (minFret > 7) difficulty += 1;
  
  return Math.min(5, difficulty);
}

