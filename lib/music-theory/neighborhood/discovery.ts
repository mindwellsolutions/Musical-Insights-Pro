/**
 * Chord Neighborhood System - Neighborhood Discovery
 * Finds nearby diatonic chords relative to an anchor voicing
 */

import { AnchorVoicing, NearbyChord } from './types';
import { getDiatonicChords, getChordSymbol } from './diatonic';
import { calculateDistance, countCommonTones, getCommonToneNotes, isWithinRange } from './distance';
import { getAllTriadPositions } from './voicing-generator';

/**
 * Find all nearby diatonic chords within a distance range from an anchor voicing
 * 
 * @param anchor The anchor voicing to search from
 * @param minDistance Minimum distance in frets (default: 2)
 * @param maxDistance Maximum distance in frets (default: 6)
 * @returns Array of nearby chords sorted by distance
 */
export function findNearbyChords(
  anchor: AnchorVoicing,
  minDistance: number = 2,
  maxDistance: number = 6
): NearbyChord[] {
  // Determine the key from the anchor chord
  const keyRoot = anchor.rootNote;
  const keyMode = anchor.quality === 'minor' ? 'minor' : 'major';
  
  // Get all diatonic chords in the key
  const diatonicChords = getDiatonicChords(keyRoot, keyMode);
  
  const nearbyChords: NearbyChord[] = [];
  
  // For each diatonic chord, find its nearest voicing to the anchor
  for (const diatonicChord of diatonicChords) {
    // Skip the anchor chord itself
    if (diatonicChord.rootNote === anchor.rootNote && diatonicChord.quality === anchor.quality) {
      continue;
    }
    
    // Get all voicings for this chord
    const allVoicings = getAllTriadPositions(diatonicChord.rootNote, diatonicChord.quality);
    
    // Filter voicings within the distance range
    const voicingsInRange = allVoicings.filter(voicing =>
      isWithinRange(anchor, voicing, minDistance, maxDistance)
    );
    
    if (voicingsInRange.length === 0) {
      continue; // No voicings in range for this chord
    }
    
    // Find the nearest voicing
    let nearestVoicing = voicingsInRange[0];
    let minDist = calculateDistance(anchor, nearestVoicing);
    
    for (const voicing of voicingsInRange) {
      const dist = calculateDistance(anchor, voicing);
      if (dist < minDist) {
        minDist = dist;
        nearestVoicing = voicing;
      }
    }
    
    // Calculate common tones with the nearest voicing
    const commonTones = countCommonTones(anchor, nearestVoicing);
    const commonToneNotes = getCommonToneNotes(anchor, nearestVoicing);
    
    // Create nearby chord entry
    nearbyChords.push({
      rootNote: diatonicChord.rootNote,
      quality: diatonicChord.quality,
      degree: diatonicChord.numeral,
      function: diatonicChord.function,
      distance: minDist,
      commonTones,
      commonToneNotes,
      nearestVoicing,
      allVoicings: voicingsInRange,
    });
  }
  
  // Sort by distance (closest first)
  nearbyChords.sort((a, b) => a.distance - b.distance);
  
  return nearbyChords;
}

/**
 * Get a user-friendly description of the distance
 * @param distance Distance in frets
 * @returns Description string
 */
export function getDistanceDescription(distance: number): string {
  if (distance <= 2) return 'Very Close';
  if (distance <= 4) return 'Close';
  if (distance <= 6) return 'Nearby';
  return 'Far';
}

/**
 * Get a user-friendly description of common tones
 * @param commonTones Number of common tones
 * @returns Description string
 */
export function getCommonTonesDescription(commonTones: number): string {
  if (commonTones === 3) return 'All notes shared';
  if (commonTones === 2) return '2 common tones';
  if (commonTones === 1) return '1 common tone';
  return 'No common tones';
}

/**
 * Find ALL diatonic chords with their nearest voicings, regardless of distance
 * This includes all 12 chromatic notes × 4 qualities (major, minor, diminished, augmented)
 * Used for chord progression generation where we need access to all possible chords
 *
 * @param anchor The anchor voicing to search from
 * @param keyRoot Optional: The root note of the key (if not provided, uses anchor's root note)
 * @param keyMode Optional: The mode of the key (if not provided, infers from anchor's quality)
 * @returns Array of all possible chords sorted by distance from anchor
 */
export function findAllDiatonicChordsWithNearestVoicings(
  anchor: AnchorVoicing,
  keyRoot?: string,
  keyMode?: 'major' | 'minor'
): NearbyChord[] {
  const allChords: NearbyChord[] = [];

  // All 12 chromatic notes
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // All 4 qualities
  const allQualities: Array<'major' | 'minor' | 'diminished' | 'augmented'> =
    ['major', 'minor', 'diminished', 'augmented'];

  // Determine the key for diatonic chord degrees
  // Use provided key if available, otherwise infer from anchor chord
  const actualKeyRoot = keyRoot || anchor.rootNote;
  const actualKeyMode = keyMode || (anchor.quality === 'minor' ? 'minor' : 'major');
  const diatonicChords = getDiatonicChords(actualKeyRoot, actualKeyMode);

  // For each note and quality combination
  for (const rootNote of allNotes) {
    for (const quality of allQualities) {
      // NOTE: We DO NOT skip the anchor chord itself anymore!
      // AI recommendations may include the same chord as the anchor,
      // and we need to be able to match it for progression display.
      // The anchor chord will just have distance = 0 and appear first in the sorted list.

      // Get all voicings for this chord
      const allVoicings = getAllTriadPositions(rootNote, quality);

      if (allVoicings.length === 0) {
        continue; // No voicings available for this chord
      }

      // Find the nearest voicing to the anchor (no distance filtering)
      let nearestVoicing = allVoicings[0];
      let minDist = calculateDistance(anchor, nearestVoicing);

      for (const voicing of allVoicings) {
        const dist = calculateDistance(anchor, voicing);
        if (dist < minDist) {
          minDist = dist;
          nearestVoicing = voicing;
        }
      }

      // Calculate common tones with the nearest voicing
      const commonTones = countCommonTones(anchor, nearestVoicing);
      const commonToneNotes = getCommonToneNotes(anchor, nearestVoicing);

      // Check if this chord is in the diatonic set for the key
      const diatonicMatch = diatonicChords.find(
        dc => dc.rootNote === rootNote && dc.quality === quality
      );

      // Create nearby chord entry
      allChords.push({
        rootNote,
        quality,
        degree: diatonicMatch?.numeral || getChordSymbol(rootNote, quality),
        function: diatonicMatch?.function || 'Chromatic',
        distance: minDist,
        commonTones,
        commonToneNotes,
        nearestVoicing,
        allVoicings,
      });
    }
  }

  // Sort by distance (closest first)
  allChords.sort((a, b) => a.distance - b.distance);

  return allChords;
}

