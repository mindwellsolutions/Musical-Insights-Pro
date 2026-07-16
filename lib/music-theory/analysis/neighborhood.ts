/**
 * Chord Neighborhood Analysis
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { findZoneForVoicing } from '../zones/zone-manager';
import { calculateVoiceLeading, isSmoothVoiceLeading } from './voice-leading';
import { buildDiatonicScale, findScaleDegree, getDiatonicRomanNumeral } from '../scales/diatonic';
import type { 
  TriadVoicing, 
  ChordNeighborhood,
  ScaleMode,
  PitchClass
} from '../types';

// ============================================================================
// Neighborhood Discovery
// ============================================================================

/**
 * Find chord neighborhood for a voicing
 * @param currentVoicing Current voicing
 * @param allVoicings All available voicings
 * @param key Key root pitch class
 * @param mode Key mode
 * @param maxDistance Maximum fret distance to consider
 * @returns Chord neighborhood
 */
export function findChordNeighborhood(
  currentVoicing: TriadVoicing,
  allVoicings: TriadVoicing[],
  key: PitchClass,
  mode: ScaleMode,
  maxDistance: number = 5
): ChordNeighborhood {
  const currentZone = findZoneForVoicing(currentVoicing);
  const scale = buildDiatonicScale(key, mode);
  
  // Filter voicings that are:
  // 1. Different from current
  // 2. In same zone or adjacent zones
  // 3. Within fret distance
  const candidates = allVoicings.filter(voicing => {
    if (voicing.voicingId === currentVoicing.voicingId) return false;
    
    const voicingZone = findZoneForVoicing(voicing);
    if (!voicingZone || !currentZone) return false;
    
    // Check zone proximity
    const zoneDiff = Math.abs(voicingZone.zoneNumber - currentZone.zoneNumber);
    if (zoneDiff > 1) return false;
    
    // Check fret distance
    const fretDistance = Math.abs(voicing.centerFret - currentVoicing.centerFret);
    if (fretDistance > maxDistance) return false;
    
    return true;
  });
  
  // Calculate voice leading for each candidate
  const neighbors = candidates.map(voicing => {
    const voiceLeading = calculateVoiceLeading(currentVoicing, voicing);
    const degree = findScaleDegree(voicing, scale);
    const diatonicRelationship = degree 
      ? getDiatonicRomanNumeral(degree - 1, mode)
      : undefined;
    
    return {
      voicing,
      voiceLeading,
      diatonicRelationship
    };
  });
  
  // Sort by voice leading quality
  neighbors.sort((a, b) => a.voiceLeading.quality - b.voiceLeading.quality);
  
  return {
    currentVoicing,
    neighbors
  };
}

/**
 * Find smooth voice leading neighbors only
 * @param currentVoicing Current voicing
 * @param allVoicings All available voicings
 * @param key Key root pitch class
 * @param mode Key mode
 * @returns Chord neighborhood with only smooth connections
 */
export function findSmoothNeighbors(
  currentVoicing: TriadVoicing,
  allVoicings: TriadVoicing[],
  key: PitchClass,
  mode: ScaleMode
): ChordNeighborhood {
  const neighborhood = findChordNeighborhood(currentVoicing, allVoicings, key, mode);
  
  return {
    currentVoicing,
    neighbors: neighborhood.neighbors.filter(n => isSmoothVoiceLeading(n.voiceLeading))
  };
}

// ============================================================================
// Neighborhood Analysis
// ============================================================================

/**
 * Get diatonic neighbors only
 * @param neighborhood Chord neighborhood
 * @returns Neighbors that are diatonic to the key
 */
export function getDiatonicNeighbors(neighborhood: ChordNeighborhood) {
  return neighborhood.neighbors.filter(n => n.diatonicRelationship !== undefined);
}

/**
 * Get chromatic neighbors only
 * @param neighborhood Chord neighborhood
 * @returns Neighbors that are not diatonic to the key
 */
export function getChromaticNeighbors(neighborhood: ChordNeighborhood) {
  return neighborhood.neighbors.filter(n => n.diatonicRelationship === undefined);
}

/**
 * Group neighbors by chord quality
 * @param neighborhood Chord neighborhood
 * @returns Neighbors grouped by quality
 */
export function groupNeighborsByQuality(neighborhood: ChordNeighborhood) {
  const groups: Record<string, typeof neighborhood.neighbors> = {
    major: [],
    minor: [],
    diminished: [],
    augmented: []
  };
  
  for (const neighbor of neighborhood.neighbors) {
    groups[neighbor.voicing.quality].push(neighbor);
  }
  
  return groups;
}

/**
 * Get top N neighbors by voice leading quality
 * @param neighborhood Chord neighborhood
 * @param count Number of neighbors to return
 * @returns Top N neighbors
 */
export function getTopNeighbors(
  neighborhood: ChordNeighborhood,
  count: number = 5
) {
  return neighborhood.neighbors.slice(0, count);
}

/**
 * Find specific chord in neighborhood
 * @param neighborhood Chord neighborhood
 * @param targetRoot Target chord root pitch class
 * @param targetQuality Target chord quality
 * @returns Matching neighbor or null
 */
export function findChordInNeighborhood(
  neighborhood: ChordNeighborhood,
  targetRoot: PitchClass,
  targetQuality: string
) {
  return neighborhood.neighbors.find(n => 
    n.voicing.root.pitchClass === targetRoot &&
    n.voicing.quality === targetQuality
  ) || null;
}

