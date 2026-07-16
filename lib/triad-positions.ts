/**
 * Triad Positions Library
 * Calculates all triad positions on the fretboard with CAGED shape associations
 *
 * This system generates ACTUAL 3-note triad voicings on adjacent string sets,
 * not full chord shapes. Each position represents a playable 3-note triad.
 */

import { TriadType, TriadInversion, CAGEDShape, getTriadNotes, TRIAD_INTERVALS } from './triad-theory';

export interface TriadPosition {
  rootNote: string;
  triadType: TriadType;
  inversion: TriadInversion;
  cagedShape: CAGEDShape | null; // Can be null for positions not associated with CAGED
  fretPosition: number; // Lowest fret in the position
  stringSet: number; // Which 3-string set (1=strings 1-2-3, 2=strings 2-3-4, etc.)
  stringPositions: StringPosition[]; // Exactly 3 notes
  positionIndex: number; // Unique index for color coding
}

export interface StringPosition {
  stringIndex: number; // 0-5 (0 = low E, 5 = high E) - matches fretboard component
  fret: number;
  note: string;
  chordTone: 'root' | 'third' | 'fifth';
}

/**
 * Standard tuning notes (from string index 0 to 5)
 * Index 0 = low E (string 6), Index 5 = high E (string 1)
 * This matches the fretboard component's expectation
 */
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

/**
 * All notes in chromatic order
 */
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get note at a specific string index and fret
 * @param stringIndex 0-based index (0 = low E, 5 = high E)
 * @param fret Fret number (0-24)
 */
function getNoteAtPosition(stringIndex: number, fret: number): string {
  const openNote = STANDARD_TUNING[stringIndex];
  const openNoteIndex = NOTES.indexOf(openNote);
  return NOTES[(openNoteIndex + fret) % 12];
}

/**
 * Get the interval (in semitones) between two notes
 */
function getInterval(note1: string, note2: string): number {
  const index1 = NOTES.indexOf(note1);
  const index2 = NOTES.indexOf(note2);
  return (index2 - index1 + 12) % 12;
}

/**
 * Determine which chord tone a note is in a triad
 */
function getChordTone(note: string, rootNote: string, triadType: TriadType): 'root' | 'third' | 'fifth' | null {
  const interval = getInterval(rootNote, note);
  const intervals = TRIAD_INTERVALS[triadType];

  if (interval === intervals[0]) return 'root';
  if (interval === intervals[1]) return 'third';
  if (interval === intervals[2]) return 'fifth';

  return null;
}

/**
 * String sets for triad voicings (adjacent 3-string combinations)
 * Using 0-based indexing: 0 = low E, 5 = high E
 */
const STRING_SETS = [
  [3, 4, 5],  // D, G, B (strings 4-3-2 in guitar notation) - treble strings
  [2, 3, 4],  // A, D, G (strings 5-4-3 in guitar notation)
  [1, 2, 3],  // E, A, D (strings 6-5-4 in guitar notation)
  [0, 1, 2],  // E, A, D (strings 6-5-4 in guitar notation) - bass strings
];

/**
 * Triad voicing shapes (intervals between strings for each inversion)
 * These are the basic shapes that can be moved up and down the fretboard
 */
interface TriadShape {
  inversion: TriadInversion;
  // Fret offsets for each of the 3 strings (relative to the lowest note)
  fretOffsets: number[];
  // Which chord tone is on each string
  chordTones: ('root' | 'third' | 'fifth')[];
}

/**
 * Calculate all possible triad voicings for a given root note and type
 * This generates EVERY possible 3-note triad position across the fretboard
 */
export function calculateTriadPositions(
  rootNote: string,
  triadType: TriadType,
  maxFret: number = 24
): TriadPosition[] {
  const positions: TriadPosition[] = [];
  const triadNotes = getTriadNotes(rootNote, triadType);
  const [root, third, fifth] = triadNotes;
  let positionIndex = 0;

  // For each string set (1-2-3, 2-3-4, 3-4-5, 4-5-6)
  for (let stringSetIdx = 0; stringSetIdx < STRING_SETS.length; stringSetIdx++) {
    const stringSet = STRING_SETS[stringSetIdx];
    const [str1, str2, str3] = stringSet;

    // Scan the fretboard for all occurrences of triad notes on these strings
    for (let fret1 = 0; fret1 <= maxFret; fret1++) {
      const note1 = getNoteAtPosition(str1, fret1);

      // Only proceed if this note is part of the triad
      if (!triadNotes.includes(note1)) continue;

      // Look for the other two triad notes on the adjacent strings
      for (let fret2 = 0; fret2 <= maxFret; fret2++) {
        const note2 = getNoteAtPosition(str2, fret2);
        if (!triadNotes.includes(note2) || note2 === note1) continue;

        for (let fret3 = 0; fret3 <= maxFret; fret3++) {
          const note3 = getNoteAtPosition(str3, fret3);
          if (!triadNotes.includes(note3)) continue;

          // Check if we have all three unique triad notes
          const notes = [note1, note2, note3];
          const uniqueNotes = new Set(notes);
          if (uniqueNotes.size !== 3) continue;
          if (!uniqueNotes.has(root) || !uniqueNotes.has(third) || !uniqueNotes.has(fifth)) continue;

          // Check if the position is playable (fret span <= 4)
          const frets = [fret1, fret2, fret3];
          const minFret = Math.min(...frets);
          const maxFretInPos = Math.max(...frets);
          const span = maxFretInPos - minFret;
          if (span > 4) continue; // Skip unplayable positions

          // Determine inversion based on the lowest note (lowest string index = lowest pitch)
          let inversion: TriadInversion;
          const lowestStringIdx = Math.min(str1, str2, str3);
          let lowestNote: string;
          if (lowestStringIdx === str1) lowestNote = note1;
          else if (lowestStringIdx === str2) lowestNote = note2;
          else lowestNote = note3;

          if (lowestNote === root) inversion = 'root';
          else if (lowestNote === third) inversion = 'first';
          else inversion = 'second';

          // Determine chord tones
          const chordTone1 = getChordTone(note1, rootNote, triadType)!;
          const chordTone2 = getChordTone(note2, rootNote, triadType)!;
          const chordTone3 = getChordTone(note3, rootNote, triadType)!;

          // Create string positions using 0-based stringIndex
          const stringPositions: StringPosition[] = [
            { stringIndex: str1, fret: fret1, note: note1, chordTone: chordTone1 },
            { stringIndex: str2, fret: fret2, note: note2, chordTone: chordTone2 },
            { stringIndex: str3, fret: fret3, note: note3, chordTone: chordTone3 },
          ];

          // Try to associate with CAGED shape (simplified - can be enhanced)
          const cagedShape = determineCCAGEDShape(minFret, stringSetIdx);

          positions.push({
            rootNote,
            triadType,
            inversion,
            cagedShape,
            fretPosition: minFret,
            stringSet: stringSetIdx + 1,
            stringPositions,
            positionIndex: positionIndex++,
          });
        }
      }
    }
  }

  return positions;
}

/**
 * Determine CAGED shape based on fret position
 * Based on zone-to-CAGED mapping from blueprint:
 * Zone 1 (0-3): E/Open
 * Zone 2 (2-6): D
 * Zone 3 (5-9): C
 * Zone 4 (7-11): A
 * Zone 5 (10-14): G
 * Zone 6 (12-15): E (octave)
 * Pattern repeats every 12 frets
 */
function determineCCAGEDShape(fretPosition: number, stringSetIdx: number): CAGEDShape | null {
  // Normalize to 0-11 range (one octave)
  const positionInOctave = fretPosition % 12;

  // Zone-based CAGED shape determination
  // Using center points of zones for more accurate mapping
  if (positionInOctave >= 0 && positionInOctave < 2) return 'E';  // Zone 1: 0-3, center 2
  if (positionInOctave >= 2 && positionInOctave < 5) return 'D';  // Zone 2: 2-6, center 4
  if (positionInOctave >= 5 && positionInOctave < 7) return 'C';  // Zone 3: 5-9, center 7
  if (positionInOctave >= 7 && positionInOctave < 10) return 'A'; // Zone 4: 7-11, center 9
  return 'G'; // Zone 5: 10-14, center 12
}

/**
 * Get all unique triad positions across the fretboard
 */
export function getAllTriadPositions(
  rootNote: string,
  triadType: TriadType
): TriadPosition[] {
  return calculateTriadPositions(rootNote, triadType, 24);
}

