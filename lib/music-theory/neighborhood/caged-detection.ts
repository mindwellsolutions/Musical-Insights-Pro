/**
 * CAGED Shape Detection for Voicings
 * Detects which CAGED shape area(s) a voicing belongs to using computed CAGED regions
 */

import { AnchorVoicing } from './types';
import { getCAGEDPositions, type NoteName, type ChordQuality, type ShapeRegion } from '@/lib/caged';
import type { CAGEDShape } from '@/lib/music-theory/types';

/**
 * Get computed CAGED shape regions for a voicing
 * This uses the actual CAGED system calculations, not generic zones
 *
 * @param voicing The anchor voicing to analyze
 * @returns Array of ALL shape regions that the voicing touches
 */
export function getCAGEDRegionsForVoicing(voicing: AnchorVoicing): ShapeRegion[] {
  // Get all CAGED positions for this chord
  const cagedPositions = getCAGEDPositions(
    voicing.rootNote as NoteName,
    voicing.quality as ChordQuality,
    24 // Full 24-fret range
  );

  console.log('🔍 ========================================');
  console.log('🔍 getCAGEDRegionsForVoicing - Analyzing voicing:');
  console.log('🔍   Root:', voicing.rootNote, 'Quality:', voicing.quality);
  console.log('🔍   String Set:', voicing.stringSet);
  console.log('🔍   Frets:', voicing.frets);
  console.log('🔍   Notes:', voicing.notes);
  console.log('🔍 Available CAGED shapes:', cagedPositions.shapes.map(s => `${s.shapeName} (frets ${s.startFret}-${s.endFret})`));

  // Find ALL CAGED shapes that contain ANY of the voicing's frets
  // This handles cases where a voicing spans multiple CAGED shapes
  const matchingRegions: ShapeRegion[] = [];

  for (const shape of cagedPositions.shapes) {
    const strings = shape.notes.map(n => n.string);
    const shapeTopString = Math.min(...strings);
    const shapeBottomString = Math.max(...strings);

    console.log(`🔍 Checking shape ${shape.shapeName} (frets ${shape.startFret}-${shape.endFret}, strings ${shapeTopString}-${shapeBottomString}):`);

    // Check if ANY of the voicing's notes (fret + string combination) fall within this shape's region
    // This ensures we only include shapes that actually contain chord notes, not just overlapping fret ranges
    let matchFound = false;
    const hasMatchingNote = voicing.frets.some((fret, index) => {
      // Skip muted strings (-1)
      if (fret === -1) return false;

      // Get the actual guitar string number from the stringSet
      const actualString = voicing.stringSet[index];
      const note = voicing.notes[index];

      // Check if this note falls within the shape's fret AND string range
      const isInFretRange = fret >= shape.startFret && fret <= shape.endFret;
      const isInStringRange = actualString >= shapeTopString && actualString <= shapeBottomString;

      const matches = isInFretRange && isInStringRange;

      console.log(`🔍   Note ${note} at string ${actualString}, fret ${fret}: fretMatch=${isInFretRange}, stringMatch=${isInStringRange}, MATCH=${matches}`);

      if (matches) matchFound = true;
      return matches;
    });

    if (hasMatchingNote) {
      const region: ShapeRegion = {
        shapeName: shape.shapeName,
        startFret: Math.max(0, shape.startFret),
        endFret: shape.endFret,
        topString: shapeTopString,
        bottomString: shapeBottomString,
        color: shape.colors,
      };

      matchingRegions.push(region);
      console.log(`🔍 ✅ MATCHED CAGED region: ${region.shapeName} (frets ${region.startFret}-${region.endFret}, strings ${region.topString}-${region.bottomString})`);
    } else {
      console.log(`🔍 ❌ NO MATCH for shape ${shape.shapeName}`);
    }
  }

  console.log('🔍 Total matching regions:', matchingRegions.length, matchingRegions.map(r => r.shapeName));
  console.log('🔍 ========================================');
  return matchingRegions;
}

/**
 * Detect which CAGED shape(s) a voicing belongs to
 * Returns all CAGED shape names that contain notes from the voicing
 *
 * @param voicing The anchor voicing to analyze
 * @returns Array of CAGED shape names
 */
export function detectCAGEDShapesForVoicing(voicing: AnchorVoicing): CAGEDShape[] {
  const regions = getCAGEDRegionsForVoicing(voicing);
  const shapeNames = regions.map(r => r.shapeName as CAGEDShape);

  console.log('🔍 Detected CAGED shapes:', shapeNames);
  return shapeNames;
}

/**
 * Detect CAGED shapes including octave duplicates
 * For a given voicing, finds all CAGED shapes with the same name
 * This is useful for showing scale patterns across octaves
 *
 * Since CAGED shapes repeat (e.g., 'E' appears at zones 1 and 6),
 * this function simply returns the unique shape names from the voicing.
 * The filtering logic will then match ALL zones with those shape names.
 *
 * @param voicing The anchor voicing to analyze
 * @returns Array of CAGED shape names (already includes all octaves via zone matching)
 */
export function detectCAGEDShapesWithOctaves(voicing: AnchorVoicing): CAGEDShape[] {
  // Get the CAGED shapes from the voicing
  // Since we return shape names (not zone numbers), the filtering logic
  // will automatically match all zones with these shape names (including octaves)
  return detectCAGEDShapesForVoicing(voicing);
}

/**
 * Check if a voicing has only one unique CAGED shape
 * (all notes fall within the same CAGED area)
 * 
 * @param voicing The anchor voicing to check
 * @returns True if all notes are in the same CAGED shape
 */
export function isSingleCAGEDShape(voicing: AnchorVoicing): boolean {
  const shapes = detectCAGEDShapesForVoicing(voicing);
  return shapes.length === 1;
}

/**
 * Get all CAGED shapes for multiple voicings
 * Useful for "Show All" mode where multiple nearby chords are displayed
 * 
 * @param voicings Array of anchor voicings
 * @param includeOctaves Whether to include octave duplicates
 * @returns Array of unique CAGED shape names
 */
export function detectCAGEDShapesForMultipleVoicings(
  voicings: AnchorVoicing[],
  includeOctaves: boolean = false
): CAGEDShape[] {
  const allShapes = new Set<CAGEDShape>();

  for (const voicing of voicings) {
    const shapes = includeOctaves 
      ? detectCAGEDShapesWithOctaves(voicing)
      : detectCAGEDShapesForVoicing(voicing);
    
    shapes.forEach(shape => allShapes.add(shape));
  }

  return Array.from(allShapes);
}

