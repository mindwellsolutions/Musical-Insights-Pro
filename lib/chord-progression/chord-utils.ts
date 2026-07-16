/**
 * Chord manipulation utilities for Chord Progression Builder
 */

import { ChordInstance, ChordQuality, GeneratedProgression } from './types';
import { NOTES, NOTE_COLORS, getChordTones } from '@/lib/musicTheory';
import { normalizeNoteToSharp } from '@/lib/triad-theory';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse chord symbol to extract root note and quality
 */
export function parseChordSymbol(chordSymbol: string): { rootNote: string; quality: ChordQuality } {
  // Handle sharp notes (e.g., "C#", "F#")
  const sharpMatch = chordSymbol.match(/^([A-G]#)/);
  const rootNote = sharpMatch ? sharpMatch[1] : chordSymbol[0];
  
  const suffix = chordSymbol.slice(rootNote.length);
  
  // Map suffix to quality
  // IMPORTANT: These quality names must match what getChordTones() expects in musicTheory.ts
  const qualityMap: Record<string, ChordQuality> = {
    '': 'maj',
    'm': 'min',
    'min': 'min',
    'dim': 'dim',
    'aug': 'aug',
    '7': 'dom7',
    'maj7': 'maj7',
    'M7': 'maj7',
    'm7': 'min7',
    'min7': 'min7',
    'dim7': 'dim7',
    'm7b5': 'min7b5',
    '9': 'dom9',
    'maj9': 'maj9',
    'm9': 'min9',
    '11': 'dom11',
    'maj11': 'maj11',
    'm11': 'min11',
    '13': 'dom13',
    'maj13': 'maj13',
    'm13': 'min13',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': '6',
    'm6': 'min6',
    'add9': 'add9',
    'madd9': 'minadd9',
  };
  
  const quality = qualityMap[suffix] || 'major';
  
  return { rootNote, quality };
}

/**
 * Create a ChordInstance from a chord symbol
 */
export function createChordInstance(
  chordSymbol: string,
  startTime: number,
  duration: number,
  pixelsPerBeat: number
): ChordInstance {
  const { rootNote, quality } = parseChordSymbol(chordSymbol);
  const notes = getChordTones(rootNote, quality);
  const color = NOTE_COLORS[rootNote] || '#888888';
  
  return {
    id: uuidv4(),
    chordSymbol,
    chordQuality: quality,
    notes,
    rootNote,
    startTime,
    duration,
    position: startTime * pixelsPerBeat,
    width: duration * pixelsPerBeat,
    color,
    voicingIndex: 0,
  };
}

/**
 * Transpose a note by semitones
 */
export function transposeNote(note: string, semitones: number): string {
  // Normalize flat notes to sharp equivalents
  const normalizedNote = normalizeNoteToSharp(note);
  const noteIndex = NOTES.indexOf(normalizedNote);
  if (noteIndex === -1) return note;

  const newIndex = (noteIndex + semitones + 12) % 12;
  return NOTES[newIndex];
}

/**
 * Transpose a chord symbol by semitones
 */
export function transposeChord(chordSymbol: string, semitones: number): string {
  const { rootNote, quality } = parseChordSymbol(chordSymbol);
  const newRoot = transposeNote(rootNote, semitones);
  
  // Reconstruct chord symbol
  const suffix = chordSymbol.slice(rootNote.length);
  return newRoot + suffix;
}

/**
 * Transpose a progression to a new key
 */
export function transposeProgression(
  progression: GeneratedProgression,
  targetKey: string
): GeneratedProgression {
  // Assume progression is in C major by default
  const sourceKey = 'C';
  const sourceIndex = NOTES.indexOf(sourceKey);
  const targetIndex = NOTES.indexOf(targetKey);
  const semitones = (targetIndex - sourceIndex + 12) % 12;
  
  return {
    ...progression,
    chords: progression.chords.map(chord => transposeChord(chord, semitones)),
  };
}

/**
 * Calculate total duration of a chord progression
 */
export function getTotalDuration(chords: ChordInstance[]): number {
  if (chords.length === 0) return 0;
  
  const lastChord = chords.reduce((latest, chord) => {
    const endTime = chord.startTime + chord.duration;
    const latestEndTime = latest.startTime + latest.duration;
    return endTime > latestEndTime ? chord : latest;
  }, chords[0]);
  
  return lastChord.startTime + lastChord.duration;
}

/**
 * Update chord positions and widths based on zoom level
 */
export function updateChordPositions(
  chords: ChordInstance[],
  pixelsPerBeat: number
): ChordInstance[] {
  return chords.map(chord => ({
    ...chord,
    position: chord.startTime * pixelsPerBeat,
    width: chord.duration * pixelsPerBeat,
  }));
}

/**
 * Validate chord progression (no overlaps, valid durations)
 */
export function validateChordProgression(chords: ChordInstance[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for minimum duration
  chords.forEach(chord => {
    if (chord.duration < 0.25) {
      errors.push(`Chord ${chord.chordSymbol} has duration less than 0.25 beats`);
    }
  });

  // Check for negative start times
  chords.forEach(chord => {
    if (chord.startTime < 0) {
      errors.push(`Chord ${chord.chordSymbol} has negative start time`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get color for a chord based on its root note
 */
export function getChordColor(chordSymbol: string): string {
  const { rootNote } = parseChordSymbol(chordSymbol);
  return NOTE_COLORS[rootNote] || '#888888';
}

/**
 * Generate chord voicing (notes) for a chord symbol
 * Returns an array of note names for the chord
 */
export function generateChordVoicing(chordSymbol: string): string[] {
  const { rootNote, quality } = parseChordSymbol(chordSymbol);
  return getChordTones(rootNote, quality);
}
