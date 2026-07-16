/**
 * Overlapping Chords Feature - Chord Finder
 * Core algorithms for finding chords that overlap with CAGED areas or scales
 */

import { 
  CAGEDShape, 
  OverlapType, 
  OverlappingChord, 
  ChordVoicing,
  ChordQuality,
  FretNote 
} from './types';
import { getCagedFretBoundaries, isNoteInCagedArea } from './caged-analyzer';
import { isNoteInScale, getScaleNotesAtPositions } from './scale-analyzer';
import { getScale } from '@/lib/musicTheory';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Chord interval patterns (in semitones from root)
 */
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
};

/**
 * Get chord symbol for display
 * @param rootNote Root note of the chord
 * @param quality Chord quality
 * @returns Chord symbol (e.g., "C", "Am", "G7")
 */
export function getChordSymbol(
  rootNote: string,
  quality: ChordQuality
): string {
  const qualitySymbols: Record<ChordQuality, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    dominant7: '7',
    major7: 'maj7',
    minor7: 'm7',
  };

  return `${rootNote}${qualitySymbols[quality]}`;
}

/**
 * Generate all possible chord voicings within a fret range
 * @param stringCount Number of strings on the guitar
 * @param tuning Guitar tuning
 * @param maxFret Maximum fret to consider
 * @returns Array of chord voicings
 */
function generateChordVoicings(
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret: number = 15
): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  // For each root note
  for (const rootNote of NOTES) {
    // For each chord quality
    for (const quality of Object.keys(CHORD_INTERVALS) as ChordQuality[]) {
      const intervals = CHORD_INTERVALS[quality];
      
      // Generate voicings on different string sets
      // We'll focus on 3-4 string voicings for triads and 4-string for 7th chords
      const stringSetSizes = intervals.length === 3 ? [3, 4] : [4];
      
      for (const setSize of stringSetSizes) {
        // Try different string combinations
        for (let startString = 0; startString <= stringCount - setSize; startString++) {
          // Try different fret positions
          for (let rootFret = 0; rootFret <= maxFret - 4; rootFret++) {
            const voicing = generateVoicingAtPosition(
              rootNote,
              quality,
              intervals,
              startString,
              setSize,
              rootFret,
              tuning
            );
            
            if (voicing) {
              voicings.push(voicing);
            }
          }
        }
      }
    }
  }

  return voicings;
}

/**
 * Generate a specific chord voicing at a position
 */
function generateVoicingAtPosition(
  rootNote: string,
  quality: ChordQuality,
  intervals: number[],
  startString: number,
  stringCount: number,
  rootFret: number,
  tuning: string[]
): ChordVoicing | null {
  const notes: FretNote[] = [];
  const rootIndex = NOTES.indexOf(rootNote);
  
  // Calculate chord notes
  const chordNotes = intervals.map(interval => 
    NOTES[(rootIndex + interval) % 12]
  );

  // Try to place chord notes on consecutive strings
  let currentNoteIndex = 0;
  for (let i = 0; i < stringCount; i++) {
    const string = startString + i;
    const openStringNote = tuning[string];
    const openStringIndex = NOTES.indexOf(openStringNote);
    
    // Find the closest chord note on this string within reasonable fret range
    for (let fret = rootFret; fret <= rootFret + 4; fret++) {
      const noteIndex = (openStringIndex + fret) % 12;
      const note = NOTES[noteIndex];
      
      if (chordNotes.includes(note)) {
        notes.push({ string, fret, note });
        break;
      }
    }
  }

  // Only return if we have at least the minimum notes for the chord
  if (notes.length < Math.min(3, intervals.length)) {
    return null;
  }

  const frets = notes.map(n => n.fret);
  const strings = notes.map(n => n.string);

  return {
    rootNote,
    quality,
    notes,
    fretRange: [Math.min(...frets), Math.max(...frets)],
    stringRange: [Math.min(...strings), Math.max(...strings)],
  };
}

/**
 * Find chords that overlap with selected CAGED areas
 * @param shapes Selected CAGED shapes
 * @param positions Fret positions for each shape
 * @param overlapType Type of overlap (complete or partial)
 * @param stringCount Number of strings
 * @returns Array of overlapping chords
 */
export function findChordsInCagedArea(
  shapes: CAGEDShape[],
  positions: Record<CAGEDShape, number>,
  overlapType: OverlapType,
  stringCount: number = 6
): OverlappingChord[] {
  // Get CAGED boundaries
  const boundaries = shapes.map(shape =>
    getCagedFretBoundaries(shape, positions[shape])
  );

  // Generate all possible chord voicings
  const allVoicings = generateChordVoicings(stringCount);

  // Check overlap for each voicing
  const overlappingChords: OverlappingChord[] = [];

  for (const voicing of allVoicings) {
    let overlapCount = 0;

    for (const note of voicing.notes) {
      if (isNoteInCagedArea(note, boundaries)) {
        overlapCount++;
      }
    }

    const overlapPercentage = (overlapCount / voicing.notes.length) * 100;

    // Filter by overlap type
    const meetsOverlapCriteria =
      overlapType === 'complete'
        ? overlapPercentage === 100
        : overlapCount >= 2;

    if (meetsOverlapCriteria) {
      overlappingChords.push({
        ...voicing,
        overlapCount,
        overlapPercentage,
        chordSymbol: getChordSymbol(voicing.rootNote, voicing.quality),
        isSelected: false,
      });
    }
  }

  // Sort by overlap count (descending), then by fret position
  return overlappingChords.sort((a, b) => {
    if (b.overlapCount !== a.overlapCount) {
      return b.overlapCount - a.overlapCount;
    }
    return a.fretRange[0] - b.fretRange[0];
  });
}

/**
 * Find chords that overlap with scale notes
 * @param key Root key of the scale
 * @param mode Scale mode
 * @param positions Selected scale positions
 * @param overlapType Type of overlap (complete or partial)
 * @param stringCount Number of strings
 * @param tuning Guitar tuning
 * @returns Array of overlapping chords
 */
export function findChordsInScale(
  key: string,
  mode: string,
  positions: number[],
  overlapType: OverlapType,
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): OverlappingChord[] {
  // Get scale notes
  const scaleNotes = getScale(key, mode).notes;

  // Generate all possible chord voicings
  const allVoicings = generateChordVoicings(stringCount, tuning);

  // Check overlap for each voicing
  const overlappingChords: OverlappingChord[] = [];

  for (const voicing of allVoicings) {
    let overlapCount = 0;

    for (const note of voicing.notes) {
      if (isNoteInScale(note.note, scaleNotes)) {
        overlapCount++;
      }
    }

    const overlapPercentage = (overlapCount / voicing.notes.length) * 100;

    // Filter by overlap type
    const meetsOverlapCriteria =
      overlapType === 'complete'
        ? overlapPercentage === 100
        : overlapCount >= 2;

    if (meetsOverlapCriteria) {
      overlappingChords.push({
        ...voicing,
        overlapCount,
        overlapPercentage,
        chordSymbol: getChordSymbol(voicing.rootNote, voicing.quality),
        isSelected: false,
      });
    }
  }

  // Sort by overlap count (descending), then by fret position
  return overlappingChords.sort((a, b) => {
    if (b.overlapCount !== a.overlapCount) {
      return b.overlapCount - a.overlapCount;
    }
    return a.fretRange[0] - b.fretRange[0];
  });
}

