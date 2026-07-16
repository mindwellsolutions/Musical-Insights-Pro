/**
 * AI Assistant Scale Database Mapper
 * 
 * Maps GPT-4o-mini canonical scale names to our internal EXTENDED_SCALE_INTERVALS database.
 * This enables token optimization by having AI return only scale names, then we populate
 * intervals, noteDegrees, and chordTones from our database.
 */

import { EXTENDED_SCALE_INTERVALS } from '@/lib/musicalCompatibility';
import { NOTES } from '@/lib/musicTheory';
import { NoteDegree } from './types';

/**
 * Map GPT-4o-mini canonical scale names to EXTENDED_SCALE_INTERVALS keys
 * GPT uses exact Unicode symbols (♭ ♯ ♮) and specific formatting
 */
export const AI_SCALE_NAME_TO_DB_KEY: Record<string, string> = {
  // Major modes
  'Ionian (Major)': 'Ionian (Major)',
  'Dorian': 'Dorian',
  'Phrygian': 'Phrygian',
  'Lydian': 'Lydian',
  'Mixolydian': 'Mixolydian',
  'Aeolian (Natural Minor)': 'Aeolian (Natural Minor)',
  'Locrian': 'Locrian',

  // Minor variations
  'Harmonic Minor': 'Harmonic Minor',
  'Melodic Minor': 'Melodic Minor',

  // Harmonic minor modes
  'Locrian ♮6': 'Locrian ♮6',
  'Ionian ♯5': 'Ionian ♯5',
  'Dorian ♯4': 'Dorian ♯4',
  'Phrygian Dominant': 'Phrygian Dominant',
  'Lydian ♯2': 'Lydian ♯2',
  'Mixolydian ♭9 ♭13': 'Mixolydian ♭9 ♭13',

  // Melodic minor modes
  'Dorian ♭2': 'Dorian ♭2',
  'Lydian Augmented': 'Lydian Augmented',
  'Lydian Dominant': 'Lydian Dominant',
  'Mixolydian ♭6': 'Mixolydian ♭6',
  'Aeolian ♭5': 'Aeolian ♭5',
  'Super Locrian': 'Super Locrian',

  // Pentatonic
  'Pentatonic Major': 'Pentatonic Major',
  'Pentatonic Minor': 'Pentatonic Minor',
  'Extended Pentatonic Major': 'Extended Pentatonic Major',
  'Extended Pentatonic Minor': 'Extended Pentatonic Minor',
  'Blues': 'Blues',
  'Japanese Pentatonic': 'Japanese Pentatonic',
  'Egyptian Pentatonic': 'Egyptian Pentatonic',

  // Symmetrical
  'Chromatic': 'Chromatic',
  'Whole Tone': 'Whole Tone',
  'Diminished (Half-Whole)': 'Diminished (Half-Whole)',
  'Diminished (Whole-Half)': 'Diminished (Whole-Half)',
  'Augmented': 'Augmented',
};

/**
 * Map AI scale name to database key with fuzzy matching
 */
export function mapAIScaleNameToDatabase(scaleName: string): string | null {
  // Direct match
  if (AI_SCALE_NAME_TO_DB_KEY[scaleName]) {
    return AI_SCALE_NAME_TO_DB_KEY[scaleName];
  }

  // Try case-insensitive match
  const lowerScaleName = scaleName.toLowerCase();
  for (const [aiName, dbKey] of Object.entries(AI_SCALE_NAME_TO_DB_KEY)) {
    if (aiName.toLowerCase() === lowerScaleName) {
      return dbKey;
    }
  }

  // Try without Unicode symbols (fallback for encoding issues)
  const normalizedName = scaleName
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/♮/g, '');

  for (const [aiName, dbKey] of Object.entries(AI_SCALE_NAME_TO_DB_KEY)) {
    const normalizedAiName = aiName
      .replace(/♭/g, 'b')
      .replace(/♯/g, '#')
      .replace(/♮/g, '');
    
    if (normalizedAiName === normalizedName) {
      return dbKey;
    }
  }

  console.warn(`[Scale Mapper] Unknown AI scale name: "${scaleName}"`);
  return null;
}

/**
 * Get scale intervals from database
 */
export function getScaleIntervals(scaleName: string): number[] | null {
  const dbKey = mapAIScaleNameToDatabase(scaleName);
  if (!dbKey) return null;

  const intervals = EXTENDED_SCALE_INTERVALS[dbKey];
  if (!intervals) {
    console.warn(`[Scale Mapper] No intervals found for: "${dbKey}"`);
    return null;
  }

  return intervals;
}

/**
 * Calculate note degrees for a scale
 */
export function calculateNoteDegrees(rootNote: string, intervals: number[]): NoteDegree[] {
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  const degreeRoles = [
    'root', '2nd', '3rd', '4th', '5th', '6th', '7th',
    '8th', '9th', '10th', '11th', '12th'
  ];

  return intervals.map((interval, index) => {
    const note = NOTES[(rootIndex + interval) % 12];
    const degree = index + 1;
    
    // Chord tones are typically 1, 3, 5, 7 (root, 3rd, 5th, 7th)
    const isChordTone = degree === 1 || degree === 3 || degree === 5 || degree === 7;
    
    // Determine role based on interval
    let role = degreeRoles[index] || `${degree}th`;
    
    // Add quality descriptors
    if (degree === 3) {
      role = interval === 3 ? 'minor 3rd' : interval === 4 ? 'major 3rd' : role;
    } else if (degree === 7) {
      role = interval === 10 ? 'minor 7th' : interval === 11 ? 'major 7th' : role;
    }

    return { note, degree, role, isChordTone };
  });
}

/**
 * Extract chord tones from note degrees
 */
export function extractChordTones(noteDegrees: NoteDegree[]): string[] {
  return noteDegrees
    .filter(nd => nd.isChordTone)
    .map(nd => nd.note);
}

