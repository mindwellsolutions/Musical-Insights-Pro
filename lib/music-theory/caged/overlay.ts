/**
 * CAGED Overlay Generation
 * Creates visual overlay data for CAGED shapes on the fretboard
 */

import { ZONE_DEFINITIONS } from '../constants';
import type { CAGEDShape, Zone } from '../types';

// CAGED shape colors matching the blueprint
export const CAGED_COLORS: Record<CAGEDShape, string> = {
  C: '#ef4444',  // Red
  A: '#f97316',  // Orange
  G: '#eab308',  // Yellow
  E: '#22c55e',  // Green
  D: '#3b82f6',  // Blue
};

/**
 * CAGED overlay zone data
 */
export interface CAGEDOverlayZone {
  zone: Zone;
  shape: CAGEDShape;
  color: string;
  startFret: number;
  endFret: number;
  label: string;
}

/**
 * Get CAGED overlay zones for selected shapes
 * @param selectedShapes Array of selected CAGED shapes
 * @returns Array of overlay zones to render
 */
export function getCAGEDOverlayZones(selectedShapes: CAGEDShape[]): CAGEDOverlayZone[] {
  const overlayZones: CAGEDOverlayZone[] = [];

  for (const zone of ZONE_DEFINITIONS) {
    if (selectedShapes.includes(zone.cagedShape)) {
      overlayZones.push({
        zone,
        shape: zone.cagedShape,
        color: CAGED_COLORS[zone.cagedShape],
        startFret: zone.startFret,
        endFret: zone.endFret,
        label: zone.cagedShape
      });
    }
  }

  return overlayZones;
}

/**
 * Get all CAGED zones (for reference)
 * @returns All CAGED zones
 */
export function getAllCAGEDZones(): CAGEDOverlayZone[] {
  return getCAGEDOverlayZones(['C', 'A', 'G', 'E', 'D']);
}

/**
 * Get CAGED shape for a specific fret
 * @param fret Fret number
 * @returns CAGED shape or null
 */
export function getCAGEDShapeForFret(fret: number): CAGEDShape | null {
  const zone = ZONE_DEFINITIONS.find(
    z => fret >= z.startFret && fret <= z.endFret
  );
  return zone?.cagedShape || null;
}

/**
 * Check if a fret is within a selected CAGED shape zone
 * @param fret Fret number
 * @param selectedShapes Selected CAGED shapes
 * @returns True if fret is in a selected shape zone
 */
export function isFretInSelectedCAGEDZone(
  fret: number,
  selectedShapes: CAGEDShape[]
): boolean {
  const shape = getCAGEDShapeForFret(fret);
  return shape !== null && selectedShapes.includes(shape);
}

