/**
 * Triad Converter
 * Converts TriadPosition data to NotePosition format for fretboard display
 */

import { TriadPosition, StringPosition } from './triad-positions';
import { TriadType, TriadInversion } from './triad-theory';
import { NotePosition } from './musicTheory';

/**
 * Convert triad positions to note positions for fretboard display
 * @param positions Array of triad positions
 * @param selectedInversion Optional filter for specific inversion
 * @param rootNote Root note of the triad
 * @param triadType Type of triad
 * @returns Array of note positions with chord tone metadata
 */
export function convertTriadPositionsToNotePositions(
  positions: TriadPosition[],
  selectedInversion?: TriadInversion | null,
  rootNote?: string,
  triadType?: TriadType
): NotePosition[] {
  const notePositions: NotePosition[] = [];

  // Filter by inversion if specified
  const filteredPositions = selectedInversion
    ? positions.filter(p => p.inversion === selectedInversion)
    : positions;

  // Convert each position's string positions to note positions
  for (const position of filteredPositions) {
    for (const stringPos of position.stringPositions) {
      notePositions.push({
        note: stringPos.note,
        stringIndex: stringPos.stringIndex, // Already 0-based
        fretNumber: stringPos.fret,
        isRoot: stringPos.chordTone === 'root',
        isHarmonyNote: false,
        // Add chord tone metadata for coloring
        chordTone: stringPos.chordTone,
      });
    }
  }

  return notePositions;
}

/**
 * Get color for a chord tone
 * Root = Red, 3rd = Blue, 5th = Green
 */
export function getChordToneColor(chordTone: 'root' | 'third' | 'fifth'): string {
  switch (chordTone) {
    case 'root':
      return '#E53935'; // Red
    case 'third':
      return '#3b82f6'; // Blue
    case 'fifth':
      return '#5DB572'; // Green
  }
}

/**
 * Get display label for chord tone
 */
export function getChordToneLabel(chordTone: 'root' | 'third' | 'fifth'): string {
  switch (chordTone) {
    case 'root':
      return 'R';
    case 'third':
      return '3';
    case 'fifth':
      return '5';
  }
}

