/**
 * Comprehensive chord library for the Add Chord Modal
 */

export interface ChordDefinition {
  symbol: string;
  name: string;
  category: string;
  notes?: string[];
}

export const CHORD_CATEGORIES = [
  'Triads',
  '7th Chords',
  'Extended',
  'Altered',
  'Sus',
  'Add',
] as const;

export type ChordCategory = typeof CHORD_CATEGORIES[number];

export const CHORD_LIBRARY: Record<ChordCategory, ChordDefinition[]> = {
  'Triads': [
    { symbol: 'C', name: 'C Major', category: 'Triads', notes: ['C', 'E', 'G'] },
    { symbol: 'Cm', name: 'C Minor', category: 'Triads', notes: ['C', 'Eb', 'G'] },
    { symbol: 'Cdim', name: 'C Diminished', category: 'Triads', notes: ['C', 'Eb', 'Gb'] },
    { symbol: 'Caug', name: 'C Augmented', category: 'Triads', notes: ['C', 'E', 'G#'] },
    { symbol: 'D', name: 'D Major', category: 'Triads', notes: ['D', 'F#', 'A'] },
    { symbol: 'Dm', name: 'D Minor', category: 'Triads', notes: ['D', 'F', 'A'] },
    { symbol: 'E', name: 'E Major', category: 'Triads', notes: ['E', 'G#', 'B'] },
    { symbol: 'Em', name: 'E Minor', category: 'Triads', notes: ['E', 'G', 'B'] },
    { symbol: 'F', name: 'F Major', category: 'Triads', notes: ['F', 'A', 'C'] },
    { symbol: 'Fm', name: 'F Minor', category: 'Triads', notes: ['F', 'Ab', 'C'] },
    { symbol: 'G', name: 'G Major', category: 'Triads', notes: ['G', 'B', 'D'] },
    { symbol: 'Gm', name: 'G Minor', category: 'Triads', notes: ['G', 'Bb', 'D'] },
    { symbol: 'A', name: 'A Major', category: 'Triads', notes: ['A', 'C#', 'E'] },
    { symbol: 'Am', name: 'A Minor', category: 'Triads', notes: ['A', 'C', 'E'] },
    { symbol: 'B', name: 'B Major', category: 'Triads', notes: ['B', 'D#', 'F#'] },
    { symbol: 'Bm', name: 'B Minor', category: 'Triads', notes: ['B', 'D', 'F#'] },
  ],
  
  '7th Chords': [
    { symbol: 'Cmaj7', name: 'C Major 7', category: '7th Chords', notes: ['C', 'E', 'G', 'B'] },
    { symbol: 'Cm7', name: 'C Minor 7', category: '7th Chords', notes: ['C', 'Eb', 'G', 'Bb'] },
    { symbol: 'C7', name: 'C Dominant 7', category: '7th Chords', notes: ['C', 'E', 'G', 'Bb'] },
    { symbol: 'Cdim7', name: 'C Diminished 7', category: '7th Chords', notes: ['C', 'Eb', 'Gb', 'Bbb'] },
    { symbol: 'Cm7b5', name: 'C Half-Diminished', category: '7th Chords', notes: ['C', 'Eb', 'Gb', 'Bb'] },
    { symbol: 'Dmaj7', name: 'D Major 7', category: '7th Chords', notes: ['D', 'F#', 'A', 'C#'] },
    { symbol: 'Dm7', name: 'D Minor 7', category: '7th Chords', notes: ['D', 'F', 'A', 'C'] },
    { symbol: 'D7', name: 'D Dominant 7', category: '7th Chords', notes: ['D', 'F#', 'A', 'C'] },
    { symbol: 'Emaj7', name: 'E Major 7', category: '7th Chords', notes: ['E', 'G#', 'B', 'D#'] },
    { symbol: 'Em7', name: 'E Minor 7', category: '7th Chords', notes: ['E', 'G', 'B', 'D'] },
    { symbol: 'E7', name: 'E Dominant 7', category: '7th Chords', notes: ['E', 'G#', 'B', 'D'] },
    { symbol: 'Fmaj7', name: 'F Major 7', category: '7th Chords', notes: ['F', 'A', 'C', 'E'] },
    { symbol: 'Fm7', name: 'F Minor 7', category: '7th Chords', notes: ['F', 'Ab', 'C', 'Eb'] },
    { symbol: 'F7', name: 'F Dominant 7', category: '7th Chords', notes: ['F', 'A', 'C', 'Eb'] },
    { symbol: 'Gmaj7', name: 'G Major 7', category: '7th Chords', notes: ['G', 'B', 'D', 'F#'] },
    { symbol: 'Gm7', name: 'G Minor 7', category: '7th Chords', notes: ['G', 'Bb', 'D', 'F'] },
    { symbol: 'G7', name: 'G Dominant 7', category: '7th Chords', notes: ['G', 'B', 'D', 'F'] },
    { symbol: 'Amaj7', name: 'A Major 7', category: '7th Chords', notes: ['A', 'C#', 'E', 'G#'] },
    { symbol: 'Am7', name: 'A Minor 7', category: '7th Chords', notes: ['A', 'C', 'E', 'G'] },
    { symbol: 'A7', name: 'A Dominant 7', category: '7th Chords', notes: ['A', 'C#', 'E', 'G'] },
    { symbol: 'Bmaj7', name: 'B Major 7', category: '7th Chords', notes: ['B', 'D#', 'F#', 'A#'] },
    { symbol: 'Bm7', name: 'B Minor 7', category: '7th Chords', notes: ['B', 'D', 'F#', 'A'] },
    { symbol: 'B7', name: 'B Dominant 7', category: '7th Chords', notes: ['B', 'D#', 'F#', 'A'] },
  ],
  
  'Extended': [
    { symbol: 'C9', name: 'C Dominant 9', category: 'Extended' },
    { symbol: 'Cmaj9', name: 'C Major 9', category: 'Extended' },
    { symbol: 'Cm9', name: 'C Minor 9', category: 'Extended' },
    { symbol: 'C11', name: 'C Dominant 11', category: 'Extended' },
    { symbol: 'Cmaj11', name: 'C Major 11', category: 'Extended' },
    { symbol: 'Cm11', name: 'C Minor 11', category: 'Extended' },
    { symbol: 'C13', name: 'C Dominant 13', category: 'Extended' },
    { symbol: 'Cmaj13', name: 'C Major 13', category: 'Extended' },
    { symbol: 'Cm13', name: 'C Minor 13', category: 'Extended' },
    { symbol: 'D9', name: 'D Dominant 9', category: 'Extended' },
    { symbol: 'E9', name: 'E Dominant 9', category: 'Extended' },
    { symbol: 'F9', name: 'F Dominant 9', category: 'Extended' },
    { symbol: 'G9', name: 'G Dominant 9', category: 'Extended' },
    { symbol: 'A9', name: 'A Dominant 9', category: 'Extended' },
    { symbol: 'B9', name: 'B Dominant 9', category: 'Extended' },
  ],
  
  'Altered': [
    { symbol: 'C7b5', name: 'C7 Flat 5', category: 'Altered' },
    { symbol: 'C7#5', name: 'C7 Sharp 5', category: 'Altered' },
    { symbol: 'C7b9', name: 'C7 Flat 9', category: 'Altered' },
    { symbol: 'C7#9', name: 'C7 Sharp 9', category: 'Altered' },
    { symbol: 'C7#11', name: 'C7 Sharp 11', category: 'Altered' },
    { symbol: 'C7alt', name: 'C7 Altered', category: 'Altered' },
    { symbol: 'D7b5', name: 'D7 Flat 5', category: 'Altered' },
    { symbol: 'E7b9', name: 'E7 Flat 9', category: 'Altered' },
    { symbol: 'F7#9', name: 'F7 Sharp 9', category: 'Altered' },
    { symbol: 'G7alt', name: 'G7 Altered', category: 'Altered' },
    { symbol: 'A7b5', name: 'A7 Flat 5', category: 'Altered' },
    { symbol: 'B7#5', name: 'B7 Sharp 5', category: 'Altered' },
  ],
  
  'Sus': [
    { symbol: 'Csus2', name: 'C Suspended 2', category: 'Sus', notes: ['C', 'D', 'G'] },
    { symbol: 'Csus4', name: 'C Suspended 4', category: 'Sus', notes: ['C', 'F', 'G'] },
    { symbol: 'C7sus4', name: 'C7 Suspended 4', category: 'Sus', notes: ['C', 'F', 'G', 'Bb'] },
    { symbol: 'Dsus2', name: 'D Suspended 2', category: 'Sus', notes: ['D', 'E', 'A'] },
    { symbol: 'Dsus4', name: 'D Suspended 4', category: 'Sus', notes: ['D', 'G', 'A'] },
    { symbol: 'Esus2', name: 'E Suspended 2', category: 'Sus', notes: ['E', 'F#', 'B'] },
    { symbol: 'Esus4', name: 'E Suspended 4', category: 'Sus', notes: ['E', 'A', 'B'] },
    { symbol: 'Fsus2', name: 'F Suspended 2', category: 'Sus', notes: ['F', 'G', 'C'] },
    { symbol: 'Fsus4', name: 'F Suspended 4', category: 'Sus', notes: ['F', 'Bb', 'C'] },
    { symbol: 'Gsus2', name: 'G Suspended 2', category: 'Sus', notes: ['G', 'A', 'D'] },
    { symbol: 'Gsus4', name: 'G Suspended 4', category: 'Sus', notes: ['G', 'C', 'D'] },
    { symbol: 'Asus2', name: 'A Suspended 2', category: 'Sus', notes: ['A', 'B', 'E'] },
    { symbol: 'Asus4', name: 'A Suspended 4', category: 'Sus', notes: ['A', 'D', 'E'] },
    { symbol: 'Bsus2', name: 'B Suspended 2', category: 'Sus', notes: ['B', 'C#', 'F#'] },
    { symbol: 'Bsus4', name: 'B Suspended 4', category: 'Sus', notes: ['B', 'E', 'F#'] },
  ],
  
  'Add': [
    { symbol: 'Cadd9', name: 'C Add 9', category: 'Add', notes: ['C', 'E', 'G', 'D'] },
    { symbol: 'Cadd11', name: 'C Add 11', category: 'Add', notes: ['C', 'E', 'G', 'F'] },
    { symbol: 'Cmadd9', name: 'C Minor Add 9', category: 'Add', notes: ['C', 'Eb', 'G', 'D'] },
    { symbol: 'Dadd9', name: 'D Add 9', category: 'Add', notes: ['D', 'F#', 'A', 'E'] },
    { symbol: 'Eadd9', name: 'E Add 9', category: 'Add', notes: ['E', 'G#', 'B', 'F#'] },
    { symbol: 'Fadd9', name: 'F Add 9', category: 'Add', notes: ['F', 'A', 'C', 'G'] },
    { symbol: 'Gadd9', name: 'G Add 9', category: 'Add', notes: ['G', 'B', 'D', 'A'] },
    { symbol: 'Aadd9', name: 'A Add 9', category: 'Add', notes: ['A', 'C#', 'E', 'B'] },
    { symbol: 'Badd9', name: 'B Add 9', category: 'Add', notes: ['B', 'D#', 'F#', 'C#'] },
  ],
};

/**
 * Search chords by symbol or name
 */
export function searchChords(query: string): ChordDefinition[] {
  const lowerQuery = query.toLowerCase();
  const results: ChordDefinition[] = [];
  
  Object.values(CHORD_LIBRARY).forEach(category => {
    category.forEach(chord => {
      if (
        chord.symbol.toLowerCase().includes(lowerQuery) ||
        chord.name.toLowerCase().includes(lowerQuery)
      ) {
        results.push(chord);
      }
    });
  });
  
  return results;
}

