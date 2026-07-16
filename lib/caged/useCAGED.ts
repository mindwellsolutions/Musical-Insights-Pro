/**
 * React Hook for CAGED System
 * Provides easy access to CAGED positions in React components
 */

import { useMemo } from 'react';
import type {
  NoteName,
  ChordQuality,
  CAGEDShapeName,
  CAGEDPositions,
  ComputedCAGEDShape,
  ShapeRegion,
} from './types';
import {
  getCAGEDPositions,
  getAllShapeRegions,
  getChordDisplayName,
  getChordSymbol,
} from './utils';

export interface UseCAGEDOptions {
  rootNote: NoteName;
  quality: ChordQuality;
  maxFret?: number;
  enabledShapes?: CAGEDShapeName[];  // Filter to show only specific shapes
}

export interface UseCAGEDResult {
  positions: CAGEDPositions;
  regions: ShapeRegion[];
  filteredShapes: ComputedCAGEDShape[];
  filteredRegions: ShapeRegion[];
  chordName: string;
  chordSymbol: string;
}

/**
 * Hook for accessing CAGED system data in React components
 */
export function useCAGED({
  rootNote,
  quality,
  maxFret = 15,
  enabledShapes,
}: UseCAGEDOptions): UseCAGEDResult {
  
  const positions = useMemo(
    () => getCAGEDPositions(rootNote, quality, maxFret),
    [rootNote, quality, maxFret]
  );
  
  const regions = useMemo(
    () => getAllShapeRegions(rootNote, quality, maxFret),
    [rootNote, quality, maxFret]
  );
  
  const filteredShapes = useMemo(() => {
    if (!enabledShapes || enabledShapes.length === 0) {
      return positions.shapes;
    }
    return positions.shapes.filter(s => enabledShapes.includes(s.shapeName));
  }, [positions.shapes, enabledShapes]);
  
  const filteredRegions = useMemo(() => {
    if (!enabledShapes || enabledShapes.length === 0) {
      return regions;
    }
    return regions.filter(r => enabledShapes.includes(r.shapeName));
  }, [regions, enabledShapes]);
  
  const chordName = useMemo(
    () => getChordDisplayName(rootNote, quality),
    [rootNote, quality]
  );
  
  const chordSymbol = useMemo(
    () => getChordSymbol(rootNote, quality),
    [rootNote, quality]
  );
  
  return {
    positions,
    regions,
    filteredShapes,
    filteredRegions,
    chordName,
    chordSymbol,
  };
}

export default useCAGED;

