/**
 * Chord Neighborhood System - Diatonic Chord Generation
 * Generates diatonic chords for major and minor keys
 */

import { TriadType } from '@/lib/triad-theory';
import { DiatonicChordDef } from './types';

/**
 * Diatonic chord formulas for major keys
 * I, ii, iii, IV, V, vi, vii°
 */
const DIATONIC_MAJOR: DiatonicChordDef[] = [
  { degree: 0, numeral: 'I', semitones: 0, quality: 'major', function: 'Tonic' },
  { degree: 1, numeral: 'ii', semitones: 2, quality: 'minor', function: 'Supertonic' },
  { degree: 2, numeral: 'iii', semitones: 4, quality: 'minor', function: 'Mediant' },
  { degree: 3, numeral: 'IV', semitones: 5, quality: 'major', function: 'Subdominant' },
  { degree: 4, numeral: 'V', semitones: 7, quality: 'major', function: 'Dominant' },
  { degree: 5, numeral: 'vi', semitones: 9, quality: 'minor', function: 'Submediant' },
  { degree: 6, numeral: 'vii°', semitones: 11, quality: 'diminished', function: 'Leading Tone' },
];

/**
 * Diatonic chord formulas for natural minor keys
 * i, ii°, III, iv, v, VI, VII
 */
const DIATONIC_MINOR: DiatonicChordDef[] = [
  { degree: 0, numeral: 'i', semitones: 0, quality: 'minor', function: 'Tonic' },
  { degree: 1, numeral: 'ii°', semitones: 2, quality: 'diminished', function: 'Supertonic' },
  { degree: 2, numeral: 'III', semitones: 3, quality: 'major', function: 'Mediant' },
  { degree: 3, numeral: 'iv', semitones: 5, quality: 'minor', function: 'Subdominant' },
  { degree: 4, numeral: 'v', semitones: 7, quality: 'minor', function: 'Dominant' },
  { degree: 5, numeral: 'VI', semitones: 8, quality: 'major', function: 'Submediant' },
  { degree: 6, numeral: 'VII', semitones: 10, quality: 'major', function: 'Subtonic' },
];

/**
 * Get all diatonic chords for a given key
 * @param keyRoot Root note of the key (e.g., 'C', 'G#')
 * @param mode 'major' or 'minor'
 * @returns Array of diatonic chord definitions with actual root notes
 */
export function getDiatonicChords(
  keyRoot: string,
  mode: 'major' | 'minor'
): Array<DiatonicChordDef & { rootNote: string }> {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyRootIndex = NOTES.indexOf(keyRoot);
  
  if (keyRootIndex === -1) {
    throw new Error(`Invalid key root: ${keyRoot}`);
  }
  
  const formulas = mode === 'major' ? DIATONIC_MAJOR : DIATONIC_MINOR;
  
  return formulas.map(chord => {
    const rootNoteIndex = (keyRootIndex + chord.semitones) % 12;
    const rootNote = NOTES[rootNoteIndex];
    
    return {
      ...chord,
      rootNote,
    };
  });
}

/**
 * Get chord symbol for a diatonic chord
 * @param rootNote Root note of the chord
 * @param quality Chord quality
 * @returns Chord symbol (e.g., 'C', 'Dm', 'B°')
 */
export function getChordSymbol(rootNote: string, quality: TriadType): string {
  const suffixes: Record<TriadType, string> = {
    major: '',
    minor: 'm',
    diminished: '°',
    augmented: '+',
  };
  
  return `${rootNote}${suffixes[quality]}`;
}

/**
 * Determine the key mode from a triad
 * For simplicity, we assume major triads are in major keys and minor triads are in minor keys
 * @param quality Triad quality
 * @returns 'major' or 'minor'
 */
export function getKeyModeFromTriad(quality: TriadType): 'major' | 'minor' {
  return quality === 'minor' ? 'minor' : 'major';
}

