/**
 * Scale Compatibility Engine
 * Calculates compatibility ratings between musical keys and scales/modes
 * Rating system: 1-10 (10 = perfect match, 1 = poor match)
 */

import { NOTES, SCALE_INTERVALS, getScaleNotes } from '../musicTheory';

export interface CompatibilityResult {
  scaleName: string;
  rootNote: string;
  rating: number;
  isPrimary: boolean;
  chordTones: string[];
  guideTones: string[];
  musicalContext: string;
  scaleIntervals: number[];
}

/**
 * Calculate how many notes are shared between two scales
 */
function calculateCommonTones(keyNotes: string[], scaleNotes: string[]): number {
  return keyNotes.filter(note => scaleNotes.includes(note)).length;
}

/**
 * Determine if a scale is a mode of the given key
 */
function isModeOfKey(keyNotes: string[], scaleNotes: string[]): boolean {
  // A mode contains all the same notes, just starting from a different degree
  if (keyNotes.length !== scaleNotes.length) return false;
  return keyNotes.every(note => scaleNotes.includes(note));
}

/**
 * Calculate compatibility rating between a musical key and a scale/mode
 */
export function calculateCompatibilityRating(
  keyName: string,
  keyQuality: 'major' | 'minor',
  scaleName: string,
  scaleRootNote: string
): number {
  // Get the root note of the key
  const keyRootNote = keyName.replace(/m$/, ''); // Remove 'm' suffix if minor
  
  // Get notes in the key
  const keyScaleName = keyQuality === 'major' ? 'Major' : 'Minor';
  const keyNotes = getScaleNotes(keyRootNote, keyScaleName);
  
  // Get notes in the scale/mode
  const scaleNotes = getScaleNotes(scaleRootNote, scaleName);
  
  // Calculate common tones
  const commonTones = calculateCommonTones(keyNotes, scaleNotes);
  const totalKeyNotes = keyNotes.length;
  
  // Rating 10: Perfect match
  // Same key and scale
  if (keyRootNote === scaleRootNote && keyScaleName === scaleName) {
    return 10;
  }
  
  // Relative minor/major
  if (keyQuality === 'major' && scaleName === 'Minor') {
    const relativeMinorRoot = NOTES[(NOTES.indexOf(keyRootNote) + 9) % 12];
    if (scaleRootNote === relativeMinorRoot) return 10;
  }
  if (keyQuality === 'minor' && scaleName === 'Major') {
    const relativeMajorRoot = NOTES[(NOTES.indexOf(keyRootNote) + 3) % 12];
    if (scaleRootNote === relativeMajorRoot) return 10;
  }
  
  // Rating 9: Excellent match
  // Diatonic modes of the key
  if (isModeOfKey(keyNotes, scaleNotes)) {
    return 9;
  }
  
  // Pentatonic scales in key
  if ((scaleName === 'Pentatonic Major' || scaleName === 'Pentatonic Minor') && commonTones >= 5) {
    return 9;
  }
  
  // Rating 8: Very good match
  // Blues scales with good common tones
  if (scaleName === 'Blues' && commonTones >= 5) {
    return 8;
  }
  
  // Harmonic/Melodic minor variations
  if ((scaleName === 'Harmonic Minor' || scaleName === 'Melodic Minor') && commonTones >= 6) {
    return 8;
  }
  
  // Rating 7: Good match
  // Parallel modes (same root, different mode)
  if (keyRootNote === scaleRootNote && commonTones >= 5) {
    return 7;
  }
  
  // Rating 6: Moderate match
  // Chromatic neighbor scales
  const keyRootIndex = NOTES.indexOf(keyRootNote);
  const scaleRootIndex = NOTES.indexOf(scaleRootNote);
  const semitoneDifference = Math.min(
    Math.abs(keyRootIndex - scaleRootIndex),
    12 - Math.abs(keyRootIndex - scaleRootIndex)
  );
  
  if (semitoneDifference === 1 && commonTones >= 4) {
    return 6;
  }
  
  // Rating 5: Acceptable match
  if (commonTones >= 4) {
    return 5;
  }
  
  // Rating 3-4: Poor to moderate match
  if (commonTones >= 3) {
    return 4;
  }
  
  if (commonTones >= 2) {
    return 3;
  }
  
  // Rating 1-2: Very poor match
  return commonTones >= 1 ? 2 : 1;
}

/**
 * Get musical context description for a scale/mode in a key
 */
export function getMusicalContext(
  keyName: string,
  keyQuality: 'major' | 'minor',
  scaleName: string,
  scaleRootNote: string,
  rating: number
): string {
  const keyRootNote = keyName.replace(/m$/, '');
  
  if (rating === 10) {
    if (keyRootNote === scaleRootNote) {
      return `Primary scale for ${keyName}. Perfect for melodic lines and improvisation.`;
    }
    return `Relative ${scaleName.toLowerCase()} of ${keyName}. Shares all the same notes.`;
  }
  
  if (rating === 9) {
    return `Diatonic mode of ${keyName}. Excellent for modal improvisation and color.`;
  }
  
  if (rating === 8) {
    return `Strong harmonic relationship with ${keyName}. Great for adding tension and color.`;
  }
  
  if (rating === 7) {
    return `Parallel mode with good compatibility. Useful for modal interchange.`;
  }
  
  if (rating === 6) {
    return `Moderate compatibility. Can be used for chromatic approaches and passing tones.`;
  }
  
  if (rating >= 5) {
    return `Acceptable for experimental sounds and outside playing.`;
  }
  
  return `Limited compatibility. Use sparingly for specific effects.`;
}

/**
 * Get all compatible scales for a given musical key
 */
export function getCompatibleScales(
  keyName: string,
  keyQuality: 'major' | 'minor'
): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];
  const scaleNames = Object.keys(SCALE_INTERVALS);
  
  // For each scale type
  for (const scaleName of scaleNames) {
    // For each possible root note
    for (const rootNote of NOTES) {
      const rating = calculateCompatibilityRating(keyName, keyQuality, scaleName, rootNote);
      
      // Only include scales with rating >= 5 (acceptable or better)
      if (rating >= 5) {
        const scaleNotes = getScaleNotes(rootNote, scaleName);
        const intervals = SCALE_INTERVALS[scaleName];
        
        // Calculate chord tones (1st, 3rd, 5th, 7th if available)
        const chordTones: string[] = [];
        if (scaleNotes.length >= 1) chordTones.push(scaleNotes[0]); // Root
        if (scaleNotes.length >= 3) chordTones.push(scaleNotes[2]); // 3rd
        if (scaleNotes.length >= 5) chordTones.push(scaleNotes[4]); // 5th
        if (scaleNotes.length >= 7) chordTones.push(scaleNotes[6]); // 7th
        
        // Guide tones are typically 3rd and 7th
        const guideTones: string[] = [];
        if (scaleNotes.length >= 3) guideTones.push(scaleNotes[2]); // 3rd
        if (scaleNotes.length >= 7) guideTones.push(scaleNotes[6]); // 7th
        
        results.push({
          scaleName,
          rootNote,
          rating,
          isPrimary: rating === 10,
          chordTones,
          guideTones,
          musicalContext: getMusicalContext(keyName, keyQuality, scaleName, rootNote, rating),
          scaleIntervals: intervals,
        });
      }
    }
  }
  
  // Sort by rating (highest first)
  return results.sort((a, b) => b.rating - a.rating);
}

/**
 * Get the primary (best) scale for a musical key
 */
export function getPrimaryScale(
  keyName: string,
  keyQuality: 'major' | 'minor'
): CompatibilityResult | null {
  const compatibleScales = getCompatibleScales(keyName, keyQuality);
  return compatibleScales.find(scale => scale.isPrimary) || compatibleScales[0] || null;
}

