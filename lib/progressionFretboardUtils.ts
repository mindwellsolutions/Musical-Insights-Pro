/**
 * Progression Fretboard Utilities
 * Builds NotePosition arrays for different progression display modes
 */

import { NotePosition, NOTES } from '@/lib/musicTheory';
import { ChordProgression } from '@/lib/progression-analyzer/types';
import { CompatibleChordEntry } from '@/lib/music-theory/progression-interval-chords/types';
import { getProgressionNoteSet, getChordNotesByQuality, parseChordSymbol } from '@/lib/progressionNoteUtils';

/** Chord colors for progression slots (8 distinct vivid colors) */
export const PROGRESSION_CHORD_COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

/**
 * Feature 0: Highlight progression notes on the fretboard with vivid per-chord colors.
 * Non-progression notes remain visible but progression notes glow with chord-specific ring colors.
 */
export function buildProgressionFilterPositions(
  scaleNotePositions: NotePosition[],
  selectedProgression: ChordProgression
): NotePosition[] {
  // Build a map: note → array of chord colors (one per chord that contains this note)
  const noteColorMap = new Map<string, string[]>();

  selectedProgression.chords.forEach((chordSymbol, idx) => {
    const romanNumeral = selectedProgression.romanNumerals[idx];
    if (romanNumeral === 'Other' || chordSymbol === 'Other') return;
    const parsed = parseChordSymbol(chordSymbol);
    if (!parsed) return;
    const chordColor = PROGRESSION_CHORD_COLORS[idx % PROGRESSION_CHORD_COLORS.length];
    const notes = getChordNotesByQuality(parsed.rootNote, parsed.quality);
    notes.forEach(note => {
      const existing = noteColorMap.get(note) || [];
      if (!existing.includes(chordColor)) existing.push(chordColor);
      noteColorMap.set(note, existing);
    });
  });

  if (noteColorMap.size === 0) return scaleNotePositions;

  // Return ALL positions: progression notes get vivid chord-color rings; others render normally
  return scaleNotePositions.map(pos => {
    const colors = noteColorMap.get(pos.note);
    if (colors && colors.length > 0) {
      return {
        ...pos,
        sharedChordColors: colors,
        customColor: colors[0],
      };
    }
    // Non-progression notes: keep visible at normal styling
    return pos;
  });
}

/**
 * Feature A — Step View: Show only notes of the selected chord for the current slot.
 * Other scale notes are filtered out.
 */
export function buildStepViewPositions(
  scaleNotePositions: NotePosition[],
  chordSelections: Record<number, CompatibleChordEntry>,
  currentSlot: number,
  progression: ChordProgression
): NotePosition[] {
  const selectedEntry = chordSelections[currentSlot];
  let chordNotes: string[];

  if (selectedEntry) {
    chordNotes = selectedEntry.notes;
  } else {
    // Fallback: parse the chord symbol from the progression
    const symbol = progression.chords[currentSlot];
    if (!symbol || symbol === 'Other') return scaleNotePositions;
    const parsed = parseChordSymbol(symbol);
    if (!parsed) return scaleNotePositions;
    chordNotes = getChordNotesByQuality(parsed.rootNote, parsed.quality);
  }

  const noteSet = new Set(chordNotes);
  return scaleNotePositions.filter(p => noteSet.has(p.note));
}

/**
 * Feature A — All Chords View: Show all selected chords simultaneously.
 * Each chord gets a unique color; shared notes get multiple colors in sharedChordColors.
 */
export function buildAllChordsViewPositions(
  scaleNotePositions: NotePosition[],
  chordSelections: Record<number, CompatibleChordEntry>,
  progression: ChordProgression
): NotePosition[] {
  const slotCount = progression.chords.length;
  // Build a chord-notes-per-slot map
  const slotNotes: Array<{ notes: string[]; color: string }> = [];

  for (let slot = 0; slot < slotCount; slot++) {
    const symbol = progression.chords[slot];
    const roman = progression.romanNumerals[slot];
    if (roman === 'Other' || symbol === 'Other') continue;

    const entry = chordSelections[slot];
    let notes: string[];
    if (entry) {
      notes = entry.notes;
    } else {
      const parsed = parseChordSymbol(symbol);
      if (!parsed) continue;
      notes = getChordNotesByQuality(parsed.rootNote, parsed.quality);
    }
    slotNotes.push({ notes, color: PROGRESSION_CHORD_COLORS[slot % PROGRESSION_CHORD_COLORS.length] });
  }

  if (slotNotes.length === 0) return scaleNotePositions;

  const positionMap = new Map<string, { position: NotePosition; colors: string[] }>();

  slotNotes.forEach(({ notes, color }) => {
    const noteSet = new Set(notes);
    scaleNotePositions.forEach(pos => {
      if (!noteSet.has(pos.note)) return;
      const key = `${pos.stringIndex}-${pos.fretNumber}`;
      if (positionMap.has(key)) {
        const existing = positionMap.get(key)!;
        if (!existing.colors.includes(color)) existing.colors.push(color);
      } else {
        positionMap.set(key, { position: pos, colors: [color] });
      }
    });
  });

  return Array.from(positionMap.values()).map(({ position, colors }) => ({
    ...position,
    sharedChordColors: colors,
    customColor: colors[0],
  }));
}
