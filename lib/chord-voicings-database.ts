/**
 * Comprehensive Chord Voicing Database
 * Organizes all chord voicings by CAGED shape and fret position
 */

import { getStandardChordVoicings } from './chord-database';
import { ChordVoicing } from './chord-voicings';
import { getCAGEDPositions, type NoteName, type ChordQuality, type CAGEDShapeName } from './caged';

// Re-export CAGEDShapeName for external use
export type { CAGEDShapeName } from './caged/types';

export interface VoicingsByCAGED {
  shapeName: CAGEDShapeName;
  startFret: number;
  endFret: number;
  voicings: ChordVoicing[];
}

export interface ChordVoicingDatabase {
  rootNote: string;
  quality: string;
  allVoicings: ChordVoicing[];
  byCAGEDShape: VoicingsByCAGED[];
}

/**
 * Determine CAGED shape from voicing fret range
 */
function determineCAGEDShape(
  voicing: ChordVoicing,
  cagedShapes: ReturnType<typeof getCAGEDPositions>['shapes']
): CAGEDShapeName | null {
  const voicingFrets = voicing.positions
    .filter(p => p.fret >= 0)
    .map(p => p.fret);
  
  if (voicingFrets.length === 0) return null;
  
  const minFret = Math.min(...voicingFrets);
  const maxFret = Math.max(...voicingFrets);
  
  // Find which CAGED shape this voicing falls into
  for (const shape of cagedShapes) {
    // Check if voicing overlaps with this CAGED shape region
    if (minFret >= shape.startFret - 2 && maxFret <= shape.endFret + 2) {
      return shape.shapeName;
    }
  }
  
  return null;
}

/**
 * Get all voicings for a chord organized by CAGED shape
 */
export function getChordVoicingsByCAGED(
  rootNote: string,
  quality: string,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret: number = 15
): ChordVoicingDatabase {
  // Get all standard voicings from the database
  const allVoicings = getStandardChordVoicings(rootNote, quality, tuning);
  
  // Get CAGED positions for this chord
  const cagedPositions = getCAGEDPositions(
    rootNote as NoteName,
    quality as ChordQuality,
    maxFret
  );
  
  // Group voicings by CAGED shape
  const byCAGEDShape: VoicingsByCAGED[] = [];
  
  for (const shape of cagedPositions.shapes) {
    const shapeVoicings: ChordVoicing[] = [];
    
    for (const voicing of allVoicings) {
      const voicingShape = determineCAGEDShape(voicing, cagedPositions.shapes);
      
      if (voicingShape === shape.shapeName) {
        shapeVoicings.push(voicing);
      }
    }
    
    if (shapeVoicings.length > 0) {
      byCAGEDShape.push({
        shapeName: shape.shapeName,
        startFret: shape.startFret,
        endFret: shape.endFret,
        voicings: shapeVoicings.sort((a, b) => a.startFret - b.startFret),
      });
    }
  }
  
  return {
    rootNote,
    quality,
    allVoicings,
    byCAGEDShape,
  };
}

/**
 * Get voicings for a specific CAGED shape
 */
export function getVoicingsForCAGEDShape(
  rootNote: string,
  quality: string,
  shapeName: CAGEDShapeName,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): ChordVoicing[] {
  const database = getChordVoicingsByCAGED(rootNote, quality, tuning);
  const shapeData = database.byCAGEDShape.find(s => s.shapeName === shapeName);
  return shapeData?.voicings || [];
}

/**
 * Get voicings within a specific fret range
 */
export function getVoicingsInFretRange(
  rootNote: string,
  quality: string,
  minFret: number,
  maxFret: number,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): ChordVoicing[] {
  const database = getChordVoicingsByCAGED(rootNote, quality, tuning);
  
  return database.allVoicings.filter(voicing => {
    const voicingFrets = voicing.positions
      .filter(p => p.fret >= 0)
      .map(p => p.fret);
    
    if (voicingFrets.length === 0) return false;
    
    const vMinFret = Math.min(...voicingFrets);
    const vMaxFret = Math.max(...voicingFrets);
    
    return vMinFret >= minFret && vMaxFret <= maxFret;
  });
}

/**
 * Get the nearest CAGED shape to a given fret position
 */
export function getNearestCAGEDShape(
  rootNote: string,
  quality: string,
  targetFret: number
): CAGEDShapeName | null {
  const cagedPositions = getCAGEDPositions(
    rootNote as NoteName,
    quality as ChordQuality,
    24
  );
  
  let nearestShape: CAGEDShapeName | null = null;
  let minDistance = Infinity;
  
  for (const shape of cagedPositions.shapes) {
    const shapeMidpoint = (shape.startFret + shape.endFret) / 2;
    const distance = Math.abs(shapeMidpoint - targetFret);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestShape = shape.shapeName;
    }
  }
  
  return nearestShape;
}

