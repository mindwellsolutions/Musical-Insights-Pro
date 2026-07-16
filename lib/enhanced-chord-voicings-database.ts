/**
 * Enhanced Chord Voicings Database
 * Comprehensive database with ALL voicings for ALL chord types
 * Includes AI-generated descriptions and organized by categories
 */

import { getStandardChordVoicings } from './chord-database';
import { ChordVoicing } from './chord-voicings';
import { getCAGEDPositions, type NoteName, type ChordQuality, type CAGEDShapeName } from './caged';
import { COMPREHENSIVE_CHORD_QUALITIES, ALL_ROOT_NOTES } from './comprehensive-chord-definitions';
import { getCombinedVoicingDescription, getCAGEDDescription } from './voicing-descriptions';
import { generateAlgorithmicVoicings } from './algorithmic-voicing-generator';

export interface EnhancedChordVoicing extends ChordVoicing {
  description?: string;
  emotionalQuality?: string;
  cagedShape?: CAGEDShapeName;
  category?: string;
  chordQuality?: string;
}

export interface VoicingsByCategory {
  category: string;
  chordQualities: {
    quality: string;
    displayName: string;
    voicings: EnhancedChordVoicing[];
  }[];
}

export interface VoicingsByCAGEDShape {
  shapeName: CAGEDShapeName;
  startFret: number;
  endFret: number;
  voicings: EnhancedChordVoicing[];
  description: string;
}

export interface ComprehensiveChordVoicingDatabase {
  rootNote: string;
  allVoicings: EnhancedChordVoicing[];
  byCategory: VoicingsByCategory[];
  byCAGEDShape: VoicingsByCAGEDShape[];
  totalVoicings: number;
}

/**
 * Determine which CAGED shape a voicing belongs to
 */
function determineCAGEDShape(
  voicing: ChordVoicing,
  cagedShapes: any[]
): CAGEDShapeName | undefined {
  const voicingFrets = voicing.positions
    .filter(p => p.fret > 0)
    .map(p => p.fret);
  
  if (voicingFrets.length === 0) return undefined;
  
  const voicingCenter = (Math.min(...voicingFrets) + Math.max(...voicingFrets)) / 2;
  
  let closestShape: CAGEDShapeName | undefined;
  let minDistance = Infinity;
  
  for (const shape of cagedShapes) {
    const shapeCenter = (shape.startFret + shape.endFret) / 2;
    const distance = Math.abs(shapeCenter - voicingCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestShape = shape.shapeName;
    }
  }
  
  return closestShape;
}

/**
 * Enhance a voicing with descriptions and metadata
 */
function enhanceVoicing(
  voicing: ChordVoicing,
  rootNote: string,
  quality: string,
  category: string,
  cagedShape?: CAGEDShapeName
): EnhancedChordVoicing {
  const hasOpenStrings = voicing.positions.some(p => p.fret === 0 && p.finger === 0);
  const frettedPositions = voicing.positions.filter(p => p.fret > 0);
  const frets = frettedPositions.map(p => p.fret);
  const fretSpan = frets.length > 0 ? Math.max(...frets) - Math.min(...frets) : 0;
  const hasBarre = fretSpan > 0 && frettedPositions.filter(p => p.fret === Math.min(...frets)).length > 1;
  
  const description = getCombinedVoicingDescription(
    quality,
    voicing.startFret,
    cagedShape,
    hasOpenStrings,
    fretSpan,
    hasBarre
  );
  
  const cagedDesc = cagedShape ? getCAGEDDescription(cagedShape) : null;
  
  return {
    ...voicing,
    description,
    emotionalQuality: cagedDesc?.emotionalQuality,
    cagedShape,
    category,
    chordQuality: quality,
  };
}

/**
 * Get comprehensive voicing database for a specific root note
 * Includes ALL chord types from ALL categories
 */
export function getComprehensiveChordVoicings(
  rootNote: string,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret: number = 15
): ComprehensiveChordVoicingDatabase {
  const allVoicings: EnhancedChordVoicing[] = [];
  const byCategory: VoicingsByCategory[] = [];
  
  // Group chord qualities by category
  const categories = ['Triads', '7th Chords', 'Extended', 'Altered', 'Suspended', 'Add'] as const;
  
  for (const category of categories) {
    const categoryQualities = COMPREHENSIVE_CHORD_QUALITIES.filter(q => q.category === category);
    const categoryData: VoicingsByCategory = {
      category,
      chordQualities: [],
    };
    
    for (const qualityDef of categoryQualities) {
      // Get voicings from the standard database
      let standardVoicings = getStandardChordVoicings(rootNote, qualityDef.quality, tuning);

      // If no voicings found in database, generate algorithmically
      if (standardVoicings.length === 0) {
        console.log(`[Enhanced Voicings] No database voicings for ${rootNote} ${qualityDef.quality}, generating algorithmically...`);
        standardVoicings = generateAlgorithmicVoicings(rootNote, qualityDef.intervals, tuning, maxFret);
      }

      if (standardVoicings.length === 0) continue;
      
      // Get CAGED positions for this chord
      let cagedPositions: any = { shapes: [] };
      try {
        // Only get CAGED for basic qualities that support it
        if (['major', 'minor', 'diminished', 'augmented'].includes(qualityDef.quality)) {
          cagedPositions = getCAGEDPositions(
            rootNote as NoteName,
            qualityDef.quality as ChordQuality,
            maxFret
          );
        }
      } catch (e) {
        // CAGED not available for this quality
      }
      
      // Enhance each voicing
      const enhancedVoicings = standardVoicings.map(voicing => {
        const cagedShape = determineCAGEDShape(voicing, cagedPositions.shapes);
        return enhanceVoicing(voicing, rootNote, qualityDef.quality, category, cagedShape);
      });
      
      categoryData.chordQualities.push({
        quality: qualityDef.quality,
        displayName: qualityDef.displayName,
        voicings: enhancedVoicings,
      });
      
      allVoicings.push(...enhancedVoicings);
    }
    
    if (categoryData.chordQualities.length > 0) {
      byCategory.push(categoryData);
    }
  }
  
  // Organize by CAGED shape for ALL voicings
  const byCAGEDShape: VoicingsByCAGEDShape[] = [];

  // Group all voicings by their CAGED shape
  const shapeGroups = new Map<string, EnhancedChordVoicing[]>();

  for (const voicing of allVoicings) {
    if (voicing.cagedShape) {
      const key = `${voicing.cagedShape}-${voicing.startFret}`;
      if (!shapeGroups.has(key)) {
        shapeGroups.set(key, []);
      }
      shapeGroups.get(key)!.push(voicing);
    }
  }

  // Convert to array and sort by fret position
  for (const [key, voicings] of shapeGroups.entries()) {
    const [shapeName, startFretStr] = key.split('-');
    const startFret = parseInt(startFretStr);
    const endFret = Math.max(...voicings.map(v => v.endFret));

    byCAGEDShape.push({
      shapeName: shapeName as CAGEDShapeName,
      startFret,
      endFret,
      voicings: voicings.sort((a, b) => a.startFret - b.startFret),
      description: `${shapeName} shape voicings around fret ${startFret}`,
    });
  }

  // Sort by start fret
  byCAGEDShape.sort((a, b) => a.startFret - b.startFret);

  return {
    rootNote,
    allVoicings,
    byCategory,
    byCAGEDShape,
    totalVoicings: allVoicings.length,
  };
}

