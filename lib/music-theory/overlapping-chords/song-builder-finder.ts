/**
 * Song Builder Overlapping Chords Finder
 * Finds chords that overlap with the scale from the 2nd fretboard,
 * filtered by the current fretboard position from the 1st fretboard
 */

import { OverlappingChord, ChordQuality, FretNote } from './types';
import { getScale } from '@/lib/musicTheory';
import { isNoteInScale, areEnharmonicEquivalents } from './scale-analyzer';
import { TriadPosition } from '@/lib/triad-positions';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get unique note names from an array of notes (removing duplicates and enharmonic equivalents)
 */
function getUniqueNoteNames(notes: string[]): string[] {
  const unique: string[] = [];
  for (const note of notes) {
    if (!unique.some(n => areEnharmonicEquivalents(n, note))) {
      unique.push(note);
    }
  }
  return unique;
}

/**
 * Chord interval patterns (in semitones from root)
 * Includes all common chord qualities from the chord progression system
 */
const CHORD_INTERVALS: Record<string, number[]> = {
  // Triads
  'major': [0, 4, 7],
  'maj': [0, 4, 7],
  'minor': [0, 3, 7],
  'min': [0, 3, 7],
  'diminished': [0, 3, 6],
  'dim': [0, 3, 6],
  'augmented': [0, 4, 8],
  'aug': [0, 4, 8],

  // 7th Chords
  'dominant7': [0, 4, 7, 10],
  'dom7': [0, 4, 7, 10],
  '7': [0, 4, 7, 10],
  'major7': [0, 4, 7, 11],
  'maj7': [0, 4, 7, 11],
  'minor7': [0, 3, 7, 10],
  'min7': [0, 3, 7, 10],
  'm7': [0, 3, 7, 10],
  'diminished7': [0, 3, 6, 9],
  'dim7': [0, 3, 6, 9],
  'min7b5': [0, 3, 6, 10], // Half-diminished

  // Extended Chords
  'major9': [0, 4, 7, 11, 14],
  'maj9': [0, 4, 7, 11, 14],
  'minor9': [0, 3, 7, 10, 14],
  'min9': [0, 3, 7, 10, 14],
  'm9': [0, 3, 7, 10, 14],
  'dominant9': [0, 4, 7, 10, 14],
  'dom9': [0, 4, 7, 10, 14],
  '9': [0, 4, 7, 10, 14],
  'major11': [0, 4, 7, 11, 14, 17],
  'maj11': [0, 4, 7, 11, 14, 17],
  'minor11': [0, 3, 7, 10, 14, 17],
  'min11': [0, 3, 7, 10, 14, 17],
  'm11': [0, 3, 7, 10, 14, 17],
  'dominant11': [0, 4, 7, 10, 14, 17],
  'dom11': [0, 4, 7, 10, 14, 17],
  '11': [0, 4, 7, 10, 14, 17],
  'major13': [0, 4, 7, 11, 14, 17, 21],
  'maj13': [0, 4, 7, 11, 14, 17, 21],
  'minor13': [0, 3, 7, 10, 14, 17, 21],
  'min13': [0, 3, 7, 10, 14, 17, 21],
  'm13': [0, 3, 7, 10, 14, 17, 21],
  'dominant13': [0, 4, 7, 10, 14, 17, 21],
  'dom13': [0, 4, 7, 10, 14, 17, 21],
  '13': [0, 4, 7, 10, 14, 17, 21],

  // Suspended & Add Chords
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '6': [0, 4, 7, 9],
  'minor6': [0, 3, 7, 9],
  'min6': [0, 3, 7, 9],
  'm6': [0, 3, 7, 9],
  'add9': [0, 4, 7, 14],
  'minor-add9': [0, 3, 7, 14],
  'minadd9': [0, 3, 7, 14],
  'madd9': [0, 3, 7, 14],
};

/**
 * Get chord symbol from root note and quality
 */
function getChordSymbol(rootNote: string, quality: string): string {
  const qualitySymbols: Record<string, string> = {
    // Triads
    'major': '',
    'maj': '',
    'minor': 'm',
    'min': 'm',
    'diminished': 'dim',
    'dim': 'dim',
    'augmented': 'aug',
    'aug': 'aug',

    // 7th Chords
    'dominant7': '7',
    'dom7': '7',
    '7': '7',
    'major7': 'maj7',
    'maj7': 'maj7',
    'minor7': 'm7',
    'min7': 'm7',
    'm7': 'm7',
    'diminished7': 'dim7',
    'dim7': 'dim7',
    'min7b5': 'm7b5',

    // Extended
    'major9': 'maj9',
    'maj9': 'maj9',
    'minor9': 'm9',
    'min9': 'm9',
    'm9': 'm9',
    'dominant9': '9',
    'dom9': '9',
    '9': '9',
    'major11': 'maj11',
    'maj11': 'maj11',
    'minor11': 'm11',
    'min11': 'm11',
    'm11': 'm11',
    'dominant11': '11',
    'dom11': '11',
    '11': '11',
    'major13': 'maj13',
    'maj13': 'maj13',
    'minor13': 'm13',
    'min13': 'm13',
    'm13': 'm13',
    'dominant13': '13',
    'dom13': '13',
    '13': '13',

    // Suspended & Add
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': '6',
    'minor6': 'm6',
    'min6': 'm6',
    'm6': 'm6',
    'add9': 'add9',
    'minor-add9': 'madd9',
    'minadd9': 'madd9',
    'madd9': 'madd9',
  };
  return `${rootNote}${qualitySymbols[quality] || quality}`;
}

/**
 * Find chords that overlap with a scale within a specific fretboard position
 * @param scaleKey Root key of the scale
 * @param scaleMode Scale mode (e.g., 'Major', 'Minor', 'Dorian')
 * @param selectedPosition The selected triad position from the 1st fretboard
 * @param tuning Guitar tuning
 * @param stringCount Number of strings
 * @returns Array of overlapping chords within the position (100% overlap only)
 */
export function findOverlappingChordsInPosition(
  scaleKey: string,
  scaleMode: string,
  selectedPosition: TriadPosition | null,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount: number = 6
): OverlappingChord[] {
  if (!selectedPosition) return [];

  // Get scale notes
  const scaleNotes = getScale(scaleKey, scaleMode).notes;

  // Determine fret range based on selected position (±4 frets)
  const centerFret = selectedPosition.fretPosition;
  const minFret = Math.max(0, centerFret - 4);
  const maxFret = Math.min(24, centerFret + 4);

  // Generate all possible chord voicings within this position
  const overlappingChords: OverlappingChord[] = [];

  // For each root note
  for (const rootNote of NOTES) {
    const rootIndex = NOTES.indexOf(rootNote);

    // For each chord quality
    for (const [quality, intervals] of Object.entries(CHORD_INTERVALS)) {
      // Calculate chord tones
      const chordTones = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

      // Check if ALL chord tones are in the scale (100% overlap required)
      const tonesInScale = chordTones.filter(tone => isNoteInScale(tone, scaleNotes));
      const overlapCount = tonesInScale.length;
      const overlapPercentage = (overlapCount / chordTones.length) * 100;

      // ONLY include chords where ALL notes are in the scale (100% overlap)
      if (overlapPercentage !== 100) continue;

      // Generate voicings for this chord within the position
      const voicings = generateChordVoicingsInPosition(
        rootNote,
        quality,
        chordTones,
        minFret,
        maxFret,
        tuning,
        stringCount
      );

      // Add each voicing as a separate overlapping chord
      voicings.forEach(voicing => {
        overlappingChords.push({
          rootNote,
          quality: quality as any, // Allow any string quality
          notes: voicing.notes,
          fretRange: voicing.fretRange,
          stringRange: voicing.stringRange,
          overlapCount,
          overlapPercentage,
          chordSymbol: getChordSymbol(rootNote, quality),
          isSelected: false,
        });
      });
    }
  }

  // Sort by overlap percentage (highest first), then by fret position (lowest first)
  overlappingChords.sort((a, b) => {
    if (b.overlapPercentage !== a.overlapPercentage) {
      return b.overlapPercentage - a.overlapPercentage;
    }
    return a.fretRange[0] - b.fretRange[0];
  });

  // Remove duplicates (same chord symbol and fret range)
  const uniqueChords = overlappingChords.filter((chord, index, self) =>
    index === self.findIndex(c =>
      c.chordSymbol === chord.chordSymbol &&
      c.fretRange[0] === chord.fretRange[0] &&
      c.fretRange[1] === chord.fretRange[1]
    )
  );

  return uniqueChords;
}

/**
 * Generate chord voicings within a specific fret range
 */
function generateChordVoicingsInPosition(
  rootNote: string,
  quality: string,
  chordTones: string[],
  minFret: number,
  maxFret: number,
  tuning: string[],
  stringCount: number
): Array<{ notes: FretNote[]; fretRange: [number, number]; stringRange: [number, number] }> {
  const voicings: Array<{ notes: FretNote[]; fretRange: [number, number]; stringRange: [number, number] }> = [];
  
  // Simple voicing generation: find notes on each string within the fret range
  const allNotes: FretNote[] = [];
  
  for (let string = 0; string < stringCount; string++) {
    const openNote = tuning[string];
    const openNoteIndex = NOTES.indexOf(openNote);
    
    for (let fret = minFret; fret <= maxFret; fret++) {
      const noteIndex = (openNoteIndex + fret) % 12;
      const note = NOTES[noteIndex];
      
      if (chordTones.includes(note)) {
        allNotes.push({ string, fret, note });
      }
    }
  }
  
  // Group notes by fret position to create voicings
  // For simplicity, create one voicing per unique starting fret
  const fretGroups = new Map<number, FretNote[]>();
  
  allNotes.forEach(note => {
    const startFret = note.fret;
    if (!fretGroups.has(startFret)) {
      fretGroups.set(startFret, []);
    }
    fretGroups.get(startFret)!.push(note);
  });
  
  // Create voicings from groups that have at least 3 notes
  fretGroups.forEach((notes, startFret) => {
    if (notes.length >= 3) {
      const frets = notes.map(n => n.fret);
      const strings = notes.map(n => n.string);
      
      voicings.push({
        notes,
        fretRange: [Math.min(...frets), Math.max(...frets)],
        stringRange: [Math.min(...strings), Math.max(...strings)],
      });
    }
  });
  
  return voicings.slice(0, 3); // Limit to 3 voicings per chord
}

/**
 * Find chords that overlap with visible scale notes from the 2nd fretboard
 * This version uses the actual visible notes on the fretboard instead of just the scale
 * @param visibleScaleNotes Array of note names visible on the 2nd fretboard
 * @param selectedPosition The selected triad position from the 1st fretboard
 * @param allowedChords Optional array of allowed chord symbols (e.g., from nearby diatonic chords or chord progression)
 * @param tuning Guitar tuning
 * @param stringCount Number of strings
 * @returns Array of overlapping chords within the position (100% overlap only)
 */
export function findOverlappingChordsFromVisibleNotes(
  visibleScaleNotes: string[],
  selectedPosition: TriadPosition | null,
  allowedChords?: Array<{ rootNote: string; chordQuality: string }>,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount: number = 6
): OverlappingChord[] {
  if (!selectedPosition || visibleScaleNotes.length === 0) return [];

  // Get unique note names from visible scale notes
  const uniqueScaleNotes = getUniqueNoteNames(visibleScaleNotes);

  console.log('🔍 Finding overlapping chords:');
  console.log('  - Visible scale notes:', uniqueScaleNotes);
  console.log('  - Allowed chords:', allowedChords);
  console.log('  - Position fret:', selectedPosition.fretPosition);

  // Determine fret range based on selected position (±4 frets)
  const centerFret = selectedPosition.fretPosition;
  const minFret = Math.max(0, centerFret - 4);
  const maxFret = Math.min(24, centerFret + 4);

  // Generate all possible chord voicings within this position
  const overlappingChords: OverlappingChord[] = [];

  // Determine which chords to check
  const chordsToCheck = allowedChords && allowedChords.length > 0
    ? allowedChords
    : NOTES.flatMap(rootNote =>
        Object.keys(CHORD_INTERVALS).map(quality => ({ rootNote, chordQuality: quality }))
      );

  console.log('  - Chords to check:', chordsToCheck.length);

  // For each allowed chord
  for (const { rootNote, chordQuality } of chordsToCheck) {
    const rootIndex = NOTES.indexOf(rootNote);
    const intervals = CHORD_INTERVALS[chordQuality];

    if (!intervals) {
      console.warn(`⚠️ No intervals found for chord quality: ${chordQuality}`);
      continue;
    }

    // Calculate chord tones
    const chordTones = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

    // Check if ALL chord tones are in the visible scale notes (100% overlap required)
    const tonesInScale = chordTones.filter(tone =>
      uniqueScaleNotes.some(scaleNote => areEnharmonicEquivalents(tone, scaleNote))
    );
    const overlapCount = tonesInScale.length;
    const overlapPercentage = (overlapCount / chordTones.length) * 100;

    // ONLY include chords where ALL notes are in the visible scale (100% overlap)
    if (overlapPercentage !== 100) continue;

    // Generate voicings for this chord within the position
    const voicings = generateChordVoicingsInPosition(
      rootNote,
      chordQuality,
      chordTones,
      minFret,
      maxFret,
      tuning,
      stringCount
    );

    // Add each voicing as a separate overlapping chord
    voicings.forEach(voicing => {
      overlappingChords.push({
        rootNote,
        quality: chordQuality as any, // Allow any string quality
        notes: voicing.notes,
        fretRange: voicing.fretRange,
        stringRange: voicing.stringRange,
        overlapCount,
        overlapPercentage,
        chordSymbol: getChordSymbol(rootNote, chordQuality),
        isSelected: false,
      });
    });
  }

  // Sort by overlap percentage (highest first), then by fret position (lowest first)
  overlappingChords.sort((a, b) => {
    if (b.overlapPercentage !== a.overlapPercentage) {
      return b.overlapPercentage - a.overlapPercentage;
    }
    return a.fretRange[0] - b.fretRange[0];
  });

  // Remove duplicates (same chord symbol and fret range)
  const uniqueChords = overlappingChords.filter((chord, index, self) =>
    index === self.findIndex(c =>
      c.chordSymbol === chord.chordSymbol &&
      c.fretRange[0] === chord.fretRange[0] &&
      c.fretRange[1] === chord.fretRange[1]
    )
  );

  console.log('  - Found overlapping chords:', uniqueChords.length);
  console.log('  - Chord symbols:', uniqueChords.map(c => c.chordSymbol).join(', '));

  return uniqueChords;
}

