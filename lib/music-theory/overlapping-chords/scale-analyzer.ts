/**
 * Overlapping Chords Feature - Scale Analyzer
 * Analyzes scale patterns and determines which notes belong to a scale
 */

import { FretNote, FretBoundary } from './types';
import { getScale } from '@/lib/musicTheory';

/**
 * Standard 3-note-per-string scale pattern positions
 * Each position covers approximately 4-5 frets
 */
const SCALE_POSITION_PATTERNS = [
  { startFret: 0, fretSpan: 5 },   // Position 1 (open position)
  { startFret: 2, fretSpan: 5 },   // Position 2
  { startFret: 4, fretSpan: 5 },   // Position 3
  { startFret: 7, fretSpan: 5 },   // Position 4
  { startFret: 9, fretSpan: 5 },   // Position 5
];

/**
 * Get all scale notes at a specific position on the fretboard
 * @param key Root key of the scale
 * @param mode Scale mode (e.g., 'Major', 'Minor', 'Dorian')
 * @param position Starting fret position (0-12)
 * @param tuning Guitar tuning
 * @returns Array of fret notes in the scale at this position
 */
export function getScalePatternAtPosition(
  key: string,
  mode: string,
  position: number,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): FretNote[] {
  const scaleNotes = getScale(key, mode).notes;
  const notes: FretNote[] = [];
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Determine fret range for this position
  const fretSpan = 5;  // Typical span for a scale position
  const minFret = position;
  const maxFret = position + fretSpan;

  // For each string, find scale notes within the position
  for (let string = 0; string < tuning.length; string++) {
    const openStringNote = tuning[string];
    const openStringIndex = NOTES.indexOf(openStringNote);

    for (let fret = minFret; fret <= maxFret; fret++) {
      const noteIndex = (openStringIndex + fret) % 12;
      const note = NOTES[noteIndex];

      // Check if this note is in the scale
      if (isNoteInScale(note, scaleNotes)) {
        notes.push({ string, fret, note });
      }
    }
  }

  return notes;
}

/**
 * Check if a note is in a scale (accounting for enharmonic equivalents)
 * @param note Note to check (e.g., 'C#')
 * @param scaleNotes Array of scale notes
 * @returns True if note is in scale
 */
export function isNoteInScale(
  note: string,
  scaleNotes: string[]
): boolean {
  return scaleNotes.some(scaleNote =>
    areEnharmonicEquivalents(note, scaleNote)
  );
}

/**
 * Check if two notes are enharmonic equivalents
 * @param note1 First note
 * @param note2 Second note
 * @returns True if notes are enharmonically equivalent
 */
export function areEnharmonicEquivalents(
  note1: string,
  note2: string
): boolean {
  const chromaticMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  
  const index1 = chromaticMap[note1];
  const index2 = chromaticMap[note2];
  
  return index1 !== undefined && index2 !== undefined && index1 === index2;
}

/**
 * Get fret boundaries for a scale position
 * @param position Starting fret position
 * @returns Fret boundary object
 */
export function getScalePositionBoundaries(
  position: number
): FretBoundary {
  const fretSpan = 5;
  
  return {
    minFret: position,
    maxFret: position + fretSpan,
    minString: 0,
    maxString: 5,  // All strings
  };
}

/**
 * Get all scale notes across multiple positions
 * @param key Root key of the scale
 * @param mode Scale mode
 * @param positions Array of starting fret positions
 * @param tuning Guitar tuning
 * @returns Array of all fret notes in the scale at selected positions
 */
export function getScaleNotesAtPositions(
  key: string,
  mode: string,
  positions: number[],
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): FretNote[] {
  const allNotes: FretNote[] = [];
  
  for (const position of positions) {
    const positionNotes = getScalePatternAtPosition(key, mode, position, tuning);
    allNotes.push(...positionNotes);
  }
  
  // Remove duplicates (same string and fret)
  const uniqueNotes = allNotes.filter((note, index, self) =>
    index === self.findIndex(n => n.string === note.string && n.fret === note.fret)
  );
  
  return uniqueNotes;
}

