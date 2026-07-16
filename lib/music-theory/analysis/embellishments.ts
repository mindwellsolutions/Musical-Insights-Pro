/**
 * Embellishment Analysis
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { isPitchInPentatonic } from '../scales/pentatonic';
import type { 
  TriadVoicing, 
  PentatonicScale, 
  Embellishment,
  EmbellishmentType,
  FretPosition
} from '../types';

// ============================================================================
// Embellishment Discovery
// ============================================================================

/**
 * Find all embellishment opportunities for a voicing
 * @param voicing Triad voicing
 * @param pentatonicScale Pentatonic scale
 * @param maxDistance Maximum fret distance for embellishments
 * @returns Array of embellishments
 */
export function findEmbellishments(
  voicing: TriadVoicing,
  pentatonicScale: PentatonicScale,
  maxDistance: number = 3
): Embellishment[] {
  const embellishments: Embellishment[] = [];
  
  // Check each note in the voicing
  for (const position of voicing.positions) {
    // Find nearby pentatonic notes on the same string
    const nearbyEmbellishments = findEmbellishmentsForPosition(
      position,
      pentatonicScale,
      maxDistance
    );
    
    embellishments.push(...nearbyEmbellishments);
  }
  
  return embellishments;
}

/**
 * Find embellishments for a single position
 * @param position Fretboard position
 * @param pentatonicScale Pentatonic scale
 * @param maxDistance Maximum fret distance
 * @returns Array of embellishments from this position
 */
function findEmbellishmentsForPosition(
  position: FretPosition,
  pentatonicScale: PentatonicScale,
  maxDistance: number
): Embellishment[] {
  const embellishments: Embellishment[] = [];
  
  // Check frets above and below on the same string
  for (let distance = 1; distance <= maxDistance; distance++) {
    // Check above
    const aboveFret = position.fret + distance;
    if (aboveFret <= 24) {
      const aboveEmbellishment = checkEmbellishmentTarget(
        position,
        { string: position.string, fret: aboveFret },
        pentatonicScale,
        distance
      );
      if (aboveEmbellishment) {
        embellishments.push(aboveEmbellishment);
      }
    }
    
    // Check below
    const belowFret = position.fret - distance;
    if (belowFret >= 0) {
      const belowEmbellishment = checkEmbellishmentTarget(
        position,
        { string: position.string, fret: belowFret },
        pentatonicScale,
        distance
      );
      if (belowEmbellishment) {
        embellishments.push(belowEmbellishment);
      }
    }
  }
  
  return embellishments;
}

/**
 * Check if a target position is a valid embellishment
 * @param from Source position
 * @param to Target position
 * @param pentatonicScale Pentatonic scale
 * @param distance Fret distance
 * @returns Embellishment or null
 */
function checkEmbellishmentTarget(
  from: FretPosition,
  to: FretPosition,
  pentatonicScale: PentatonicScale,
  distance: number
): Embellishment | null {
  // Calculate pitch at target position
  const targetPitch = ((to.fret + [4, 11, 7, 2, 9, 4][to.string - 1]) % 12) as any;
  
  // Check if target is in pentatonic scale
  if (!isPitchInPentatonic(targetPitch, pentatonicScale)) {
    return null;
  }
  
  // Determine embellishment type
  const type = getEmbellishmentType(from.fret, to.fret);
  
  return {
    from,
    to,
    type,
    distance
  };
}

/**
 * Determine embellishment type based on direction
 * @param fromFret Source fret
 * @param toFret Target fret
 * @returns Embellishment type
 */
function getEmbellishmentType(fromFret: number, toFret: number): EmbellishmentType {
  if (toFret > fromFret) {
    return 'slide'; // Could also be hammer-on
  } else {
    return 'pull-off';
  }
}

// ============================================================================
// Embellishment Analysis
// ============================================================================

/**
 * Group embellishments by type
 * @param embellishments Array of embellishments
 * @returns Embellishments grouped by type
 */
export function groupEmbellishmentsByType(embellishments: Embellishment[]) {
  const groups: Record<EmbellishmentType, Embellishment[]> = {
    'slide': [],
    'hammer-on': [],
    'pull-off': []
  };
  
  for (const emb of embellishments) {
    groups[emb.type].push(emb);
  }
  
  return groups;
}

/**
 * Get embellishments for a specific note in the voicing
 * @param embellishments All embellishments
 * @param position Position to filter by
 * @returns Embellishments from that position
 */
export function getEmbellishmentsForPosition(
  embellishments: Embellishment[],
  position: FretPosition
): Embellishment[] {
  return embellishments.filter(emb => 
    emb.from.string === position.string &&
    emb.from.fret === position.fret
  );
}

/**
 * Get closest embellishments (distance 1 only)
 * @param embellishments All embellishments
 * @returns Embellishments with distance 1
 */
export function getClosestEmbellishments(embellishments: Embellishment[]): Embellishment[] {
  return embellishments.filter(emb => emb.distance === 1);
}

/**
 * Sort embellishments by distance
 * @param embellishments Array of embellishments
 * @returns Sorted array (closest first)
 */
export function sortEmbellishmentsByDistance(embellishments: Embellishment[]): Embellishment[] {
  return [...embellishments].sort((a, b) => a.distance - b.distance);
}

