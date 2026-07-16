/**
 * Triad to Pentatonic Scale Mapping
 * Maps each triad type to its corresponding pentatonic scale
 * 
 * Music Theory Rules:
 * - Major Triad → Major Pentatonic (same root)
 * - Minor Triad → Minor Pentatonic (same root)
 * - Diminished Triad → Minor Pentatonic (same root)
 * - Augmented Triad → Major Pentatonic (same root)
 */

import { TriadType } from './triad-theory';
import { PentatonicMode, PitchClass, Note } from './music-theory/types';
import { buildPentatonicScale } from './music-theory/scales/pentatonic';
import { pitchClassFromName } from './music-theory/core/notes';

/**
 * Mapping from triad type to pentatonic mode
 */
export const TRIAD_TO_PENTATONIC_MODE: Record<TriadType, PentatonicMode> = {
  major: 'major',
  minor: 'minor',
  diminished: 'minor',
  augmented: 'major',
};

/**
 * Get the corresponding pentatonic scale for a triad
 * @param rootNote Root note name (e.g., 'C', 'D#', 'Eb')
 * @param triadType Type of triad
 * @param preferFlats Whether to prefer flat notation
 * @returns Pentatonic scale object
 */
export function getPentatonicForTriad(
  rootNote: string,
  triadType: TriadType,
  preferFlats: boolean = false
) {
  // Get pitch class from note name
  const pitchClass = pitchClassFromName(rootNote);

  // Get the corresponding pentatonic mode
  const pentatonicMode = TRIAD_TO_PENTATONIC_MODE[triadType];

  // Build and return the pentatonic scale
  return buildPentatonicScale(pitchClass, pentatonicMode, preferFlats);
}

/**
 * Get pentatonic scale name for a triad
 * @param rootNote Root note name
 * @param triadType Type of triad
 * @returns Scale name (e.g., "C Major Pentatonic", "A Minor Pentatonic")
 */
export function getPentatonicNameForTriad(
  rootNote: string,
  triadType: TriadType
): string {
  const mode = TRIAD_TO_PENTATONIC_MODE[triadType];
  const modeName = mode === 'major' ? 'Major' : 'Minor';
  return `${rootNote} ${modeName} Pentatonic`;
}

/**
 * Check if a note is in the pentatonic scale for a given triad
 * @param note Note to check
 * @param rootNote Triad root note
 * @param triadType Triad type
 * @returns True if note is in the corresponding pentatonic scale
 */
export function isNoteInTriadPentatonic(
  note: string,
  rootNote: string,
  triadType: TriadType
): boolean {
  const scale = getPentatonicForTriad(rootNote, triadType);
  const notePitchClass = pitchClassFromName(note);

  return scale.notes.some(scaleNote => scaleNote.pitchClass === notePitchClass);
}

/**
 * Get all notes in the pentatonic scale for a triad
 * @param rootNote Triad root note
 * @param triadType Triad type
 * @param preferFlats Whether to prefer flat notation
 * @returns Array of note names in the pentatonic scale
 */
export function getPentatonicNotesForTriad(
  rootNote: string,
  triadType: TriadType,
  preferFlats: boolean = false
): string[] {
  const scale = getPentatonicForTriad(rootNote, triadType, preferFlats);
  return scale.notes.map(note => note.name);
}

/**
 * Comprehensive database of all triad-to-pentatonic mappings
 * Pre-computed for all 12 root notes and 4 triad types
 */
export interface TriadPentatonicMapping {
  rootNote: string;
  triadType: TriadType;
  pentatonicMode: PentatonicMode;
  pentatonicNotes: string[];
  scaleName: string;
}

/**
 * Generate complete database of triad-to-pentatonic mappings
 * @param preferFlats Whether to prefer flat notation
 * @returns Array of all mappings
 */
export function generateTriadPentatonicDatabase(
  preferFlats: boolean = false
): TriadPentatonicMapping[] {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const triadTypes: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];
  const database: TriadPentatonicMapping[] = [];

  for (const rootNote of notes) {
    for (const triadType of triadTypes) {
      const pentatonicMode = TRIAD_TO_PENTATONIC_MODE[triadType];
      const pentatonicNotes = getPentatonicNotesForTriad(rootNote, triadType, preferFlats);
      const scaleName = getPentatonicNameForTriad(rootNote, triadType);

      database.push({
        rootNote,
        triadType,
        pentatonicMode,
        pentatonicNotes,
        scaleName,
      });
    }
  }

  return database;
}

