/**
 * Zone Management System
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { ZONE_DEFINITIONS } from '../constants';
import type { 
  Zone, 
  ZoneNumber, 
  FretNumber, 
  TriadVoicing,
  CAGEDShape
} from '../types';

// ============================================================================
// Zone Lookup
// ============================================================================

/**
 * Get zone by zone number
 * @param zoneNumber Zone number (1-6)
 * @returns Zone object
 */
export function getZone(zoneNumber: ZoneNumber): Zone {
  return ZONE_DEFINITIONS[zoneNumber - 1];
}

/**
 * Get all zones
 * @returns Array of all six zones
 */
export function getAllZones(): readonly Zone[] {
  return ZONE_DEFINITIONS;
}

/**
 * Find which zone a fret is in
 * @param fret Fret number
 * @returns Zone or null if fret is out of range
 */
export function findZoneForFret(fret: FretNumber): Zone | null {
  return ZONE_DEFINITIONS.find(
    zone => fret >= zone.startFret && fret <= zone.endFret
  ) || null;
}

/**
 * Find which zone a voicing is in (based on center fret)
 * @param voicing Triad voicing
 * @returns Zone or null
 */
export function findZoneForVoicing(voicing: TriadVoicing): Zone | null {
  return findZoneForFret(voicing.centerFret);
}

// ============================================================================
// Zone Navigation
// ============================================================================

/**
 * Get the next zone
 * @param currentZone Current zone
 * @returns Next zone or null if at the end
 */
export function getNextZone(currentZone: Zone): Zone | null {
  const nextNumber = (currentZone.zoneNumber + 1) as ZoneNumber;
  return nextNumber <= 6 ? getZone(nextNumber) : null;
}

/**
 * Get the previous zone
 * @param currentZone Current zone
 * @returns Previous zone or null if at the beginning
 */
export function getPreviousZone(currentZone: Zone): Zone | null {
  const prevNumber = (currentZone.zoneNumber - 1) as ZoneNumber;
  return prevNumber >= 1 ? getZone(prevNumber) : null;
}

/**
 * Get zones by CAGED shape
 * @param shape CAGED shape
 * @returns Array of zones with that shape
 */
export function getZonesByCAGEDShape(shape: CAGEDShape): Zone[] {
  return ZONE_DEFINITIONS.filter(zone => zone.cagedShape === shape);
}

// ============================================================================
// Zone Filtering
// ============================================================================

/**
 * Filter voicings by zone
 * @param voicings Array of voicings
 * @param zone Zone to filter by
 * @returns Voicings in the zone
 */
export function filterVoicingsByZone(
  voicings: TriadVoicing[],
  zone: Zone
): TriadVoicing[] {
  return voicings.filter(voicing => {
    const voicingZone = findZoneForVoicing(voicing);
    return voicingZone?.zoneNumber === zone.zoneNumber;
  });
}

/**
 * Filter voicings by CAGED shape
 * @param voicings Array of voicings
 * @param shape CAGED shape
 * @returns Voicings in zones with that shape
 */
export function filterVoicingsByCAGEDShape(
  voicings: TriadVoicing[],
  shape: CAGEDShape
): TriadVoicing[] {
  const zones = getZonesByCAGEDShape(shape);
  return voicings.filter(voicing => {
    const voicingZone = findZoneForVoicing(voicing);
    return zones.some(zone => zone.zoneNumber === voicingZone?.zoneNumber);
  });
}

// ============================================================================
// Zone Analysis
// ============================================================================

/**
 * Check if a voicing fits within a zone
 * @param voicing Triad voicing
 * @param zone Zone to check
 * @returns True if voicing fits entirely within zone
 */
export function doesVoicingFitInZone(
  voicing: TriadVoicing,
  zone: Zone
): boolean {
  return (
    voicing.lowestFret >= zone.startFret &&
    voicing.highestFret <= zone.endFret
  );
}

/**
 * Get the optimal zone for a voicing (best fit)
 * @param voicing Triad voicing
 * @returns Best fitting zone
 */
export function getOptimalZoneForVoicing(voicing: TriadVoicing): Zone {
  // First try to find a zone that contains the entire voicing
  for (const zone of ZONE_DEFINITIONS) {
    if (doesVoicingFitInZone(voicing, zone)) {
      return zone;
    }
  }
  
  // If no zone contains it entirely, use center fret
  return findZoneForFret(voicing.centerFret) || getZone(1);
}

/**
 * Get zone description for display
 * @param zone Zone object
 * @returns Human-readable description
 */
export function getZoneDescription(zone: Zone): string {
  return `Zone ${zone.zoneNumber}: Frets ${zone.startFret}-${zone.endFret} (${zone.cagedShape} shape)`;
}

