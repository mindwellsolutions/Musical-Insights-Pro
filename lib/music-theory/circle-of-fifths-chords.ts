/**
 * Circle of Fifths - Chord Analysis
 * Provides chord information for keys selected in the Circle of Fifths
 */

/**
 * Represents a chord in a key with its position and quality
 */
export interface KeyChord {
  rootNote: string;
  quality: 'major' | 'minor' | 'diminished';
  position: number; // 1-7 for scale degrees
  numeral: string; // Roman numeral (I, ii, iii, etc.)
  function: string; // Harmonic function
}

/**
 * Diatonic chord formulas for major keys
 * Position 1 = I (tonic), Position 4 = IV (subdominant), Position 5 = V (dominant)
 */
const MAJOR_KEY_CHORDS = [
  { position: 1, semitones: 0, quality: 'major' as const, numeral: 'I', function: 'Tonic' },
  { position: 2, semitones: 2, quality: 'minor' as const, numeral: 'ii', function: 'Supertonic' },
  { position: 3, semitones: 4, quality: 'minor' as const, numeral: 'iii', function: 'Mediant' },
  { position: 4, semitones: 5, quality: 'major' as const, numeral: 'IV', function: 'Subdominant' },
  { position: 5, semitones: 7, quality: 'major' as const, numeral: 'V', function: 'Dominant' },
  { position: 6, semitones: 9, quality: 'minor' as const, numeral: 'vi', function: 'Submediant' },
  { position: 7, semitones: 11, quality: 'diminished' as const, numeral: 'vii°', function: 'Leading Tone' },
];

/**
 * Diatonic chord formulas for natural minor keys
 * In minor keys, the position numbers remain the same relative to the minor scale
 * Position 1 = i (tonic), Position 4 = iv (subdominant), Position 5 = v (dominant)
 */
const MINOR_KEY_CHORDS = [
  { position: 1, semitones: 0, quality: 'minor' as const, numeral: 'i', function: 'Tonic' },
  { position: 2, semitones: 2, quality: 'diminished' as const, numeral: 'ii°', function: 'Supertonic' },
  { position: 3, semitones: 3, quality: 'major' as const, numeral: 'III', function: 'Mediant' },
  { position: 4, semitones: 5, quality: 'minor' as const, numeral: 'iv', function: 'Subdominant' },
  { position: 5, semitones: 7, quality: 'minor' as const, numeral: 'v', function: 'Dominant' },
  { position: 6, semitones: 8, quality: 'major' as const, numeral: 'VI', function: 'Submediant' },
  { position: 7, semitones: 10, quality: 'major' as const, numeral: 'VII', function: 'Subtonic' },
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get all chords in a major key with their positions
 * Uses the Circle of Fifths trick: 
 * - Position 1 (I) is the selected note
 * - Position 4 (IV) is one step counter-clockwise (left)
 * - Position 5 (V) is one step clockwise (right)
 * @param keyRoot The root note of the major key
 * @returns Array of chords in the key with their positions
 */
export function getMajorKeyChords(keyRoot: string): KeyChord[] {
  const keyRootIndex = NOTES.indexOf(keyRoot);
  
  if (keyRootIndex === -1) {
    throw new Error(`Invalid key root: ${keyRoot}`);
  }
  
  return MAJOR_KEY_CHORDS.map(chord => {
    const rootNoteIndex = (keyRootIndex + chord.semitones) % 12;
    const rootNote = NOTES[rootNoteIndex];
    
    return {
      rootNote,
      quality: chord.quality,
      position: chord.position,
      numeral: chord.numeral,
      function: chord.function,
    };
  });
}

/**
 * Get all chords in a minor key with their positions
 * In minor keys, the positions work the same way:
 * - Position 1 (i) is the selected note
 * - Position 4 (iv) is one step counter-clockwise (left) in the inner circle
 * - Position 5 (v) is one step clockwise (right) in the inner circle
 * @param keyRoot The root note of the minor key
 * @returns Array of chords in the key with their positions
 */
export function getMinorKeyChords(keyRoot: string): KeyChord[] {
  const keyRootIndex = NOTES.indexOf(keyRoot);
  
  if (keyRootIndex === -1) {
    throw new Error(`Invalid key root: ${keyRoot}`);
  }
  
  return MINOR_KEY_CHORDS.map(chord => {
    const rootNoteIndex = (keyRootIndex + chord.semitones) % 12;
    const rootNote = NOTES[rootNoteIndex];
    
    return {
      rootNote,
      quality: chord.quality,
      position: chord.position,
      numeral: chord.numeral,
      function: chord.function,
    };
  });
}

/**
 * Get the position of a chord in the Circle of Fifths
 * @param note The note to find
 * @param circleKeys Array of keys in the circle (major or minor)
 * @returns Index in the circle, or -1 if not found
 */
export function getCirclePosition(note: string, circleKeys: string[]): number {
  return circleKeys.indexOf(note);
}

/**
 * Get chord symbol for display
 * @param rootNote Root note of the chord
 * @param quality Chord quality
 * @returns Chord symbol (e.g., "C", "Am", "B°")
 */
export function getChordSymbol(rootNote: string, quality: 'major' | 'minor' | 'diminished'): string {
  const suffixes = {
    major: '',
    minor: 'm',
    diminished: '°',
  };
  
  return `${rootNote}${suffixes[quality]}`;
}

