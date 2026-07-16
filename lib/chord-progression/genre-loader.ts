/**
 * Genre progression loader and converter
 */

import { ChordInstance, ChordQuality } from './types';
import { generateChordVoicing, getChordColor } from './chord-utils';
import genreDatabase from '@/music-theory/chord-progressions/genre-progressions-database.json';

/**
 * Normalize legacy chord quality names to current ChordQuality type
 */
function normalizeChordQuality(quality: string): ChordQuality {
  const mapping: Record<string, ChordQuality> = {
    'major': 'maj',
    'minor': 'min',
    'diminished': 'dim',
    'augmented': 'aug',
    'dominant7': 'dom7',
    'major7': 'maj7',
    'minor7': 'min7'
  };
  return (mapping[quality] || quality) as ChordQuality;
}

export interface GenreProgression {
  id: string;
  name: string;
  description: string;
  chords: string[];
  romanNumerals: string[];
  genre: string[];
  difficulty: number;
  musicalCharacter?: string;
  famousSongs?: string[];
  rationale?: string;
  scaleRecommendations?: Record<string, Array<{
    scaleName: string;
    compatibilityScore: number;
    usage: string;
  }>>;
}

export interface GenreCategory {
  description: string;
  progressions: GenreProgression[];
}

/**
 * Get all available genres
 */
export function getAvailableGenres(): string[] {
  return Object.keys(genreDatabase.genres);
}

/**
 * Get progressions for a specific genre
 */
export function getProgressionsByGenre(genre: string): GenreProgression[] {
  const genreData = genreDatabase.genres[genre as keyof typeof genreDatabase.genres];
  return (genreData?.progressions as GenreProgression[]) || [];
}

/**
 * Get all progressions across all genres
 */
export function getAllProgressions(): GenreProgression[] {
  const allProgressions: GenreProgression[] = [];
  Object.values(genreDatabase.genres).forEach(genre => {
    allProgressions.push(...(genre.progressions as GenreProgression[]));
  });
  return allProgressions;
}

/**
 * Search progressions by keyword
 */
export function searchProgressions(query: string): GenreProgression[] {
  const lowerQuery = query.toLowerCase();
  return getAllProgressions().filter(prog =>
    prog.name.toLowerCase().includes(lowerQuery) ||
    prog.description.toLowerCase().includes(lowerQuery) ||
    (prog.musicalCharacter?.toLowerCase().includes(lowerQuery) ?? false) ||
    (prog.famousSongs?.some(song => song.toLowerCase().includes(lowerQuery)) ?? false)
  );
}

/**
 * Convert genre progression to ChordInstance array
 */
export function convertProgressionToChords(
  progression: GenreProgression,
  key: string,
  pixelsPerBeat: number,
  beatsPerChord: number = 4
): ChordInstance[] {
  const chords: ChordInstance[] = [];
  let currentTime = 0;

  progression.chords.forEach((chordSymbol, index) => {
    // Transpose chord to the target key if needed
    const transposedChord = transposeChord(chordSymbol, 'C', key);

    // Generate voicing
    const voicing = generateChordVoicing(transposedChord);

    const chord: ChordInstance = {
      id: crypto.randomUUID(),
      chordSymbol: transposedChord,
      chordQuality: normalizeChordQuality(getChordQuality(transposedChord)),
      notes: voicing,
      rootNote: getRootNote(transposedChord),
      startTime: currentTime,
      duration: beatsPerChord,
      position: currentTime * pixelsPerBeat,
      width: beatsPerChord * pixelsPerBeat,
      color: getChordColor(transposedChord),
      voicingIndex: 0,
    };

    chords.push(chord);
    currentTime += beatsPerChord;
  });

  return chords;
}

/**
 * Transpose a chord from one key to another
 */
function transposeChord(chord: string, fromKey: string, toKey: string): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const fromIndex = notes.indexOf(fromKey);
  const toIndex = notes.indexOf(toKey);
  const interval = (toIndex - fromIndex + 12) % 12;
  
  // Extract root note and quality
  const rootMatch = chord.match(/^[A-G][#b]?/);
  if (!rootMatch) return chord;
  
  const root = rootMatch[0];
  const quality = chord.slice(root.length);
  
  // Transpose root
  const rootIndex = notes.indexOf(root.replace('b', '#'));
  if (rootIndex === -1) return chord;
  
  const newRootIndex = (rootIndex + interval) % 12;
  const newRoot = notes[newRootIndex];
  
  return newRoot + quality;
}

/**
 * Get chord quality from chord symbol
 */
function getChordQuality(chordSymbol: string): 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7' {
  if (chordSymbol.includes('dim')) return 'diminished';
  if (chordSymbol.includes('aug') || chordSymbol.includes('+')) return 'augmented';
  if (chordSymbol.includes('maj7') || chordSymbol.includes('M7')) return 'major7';
  if (chordSymbol.includes('m7') || chordSymbol.includes('min7')) return 'minor7';
  if (chordSymbol.includes('7')) return 'dominant7';
  if (chordSymbol.includes('m') || chordSymbol.includes('min')) return 'minor';
  return 'major';
}

/**
 * Get root note from chord symbol
 */
function getRootNote(chordSymbol: string): string {
  const match = chordSymbol.match(/^[A-G][#b]?/);
  return match ? match[0] : 'C';
}

