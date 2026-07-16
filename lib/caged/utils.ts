/**
 * CAGED System Utilities
 * Functions for calculating CAGED shape positions on the fretboard
 */

import type {
  NoteName,
  ChordQuality,
  CAGEDShapeName,
  CAGEDShape,
  ComputedNote,
  ComputedCAGEDShape,
  ShapeRegion,
  CAGEDPositions,
} from './types';
import {
  NOTES,
  STANDARD_TUNING,
  CAGED_ORDER,
  SHAPE_GAPS,
  E_SHAPE_ROOT_FRETS,
  CAGED_COLORS,
  INTERVAL_COLORS,
} from './constants';
import { CAGED_SHAPES } from './shapes';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the index of a note in the chromatic scale
 */
export function getNoteIndex(note: NoteName): number {
  return NOTES.indexOf(note);
}

/**
 * Get a note name from a chromatic index (wraps around)
 */
export function getNoteFromIndex(index: number): NoteName {
  return NOTES[((index % 12) + 12) % 12];
}

/**
 * Get the note at a specific fret on a specific string
 */
export function getNoteAtPosition(string: number, fret: number): NoteName {
  const openNote = STANDARD_TUNING[string];
  const openNoteIndex = getNoteIndex(openNote);
  return getNoteFromIndex(openNoteIndex + fret);
}

/**
 * Calculate the anchor fret for a specific CAGED shape given a root note
 */
export function calculateShapeAnchorFret(
  shapeName: CAGEDShapeName,
  rootNote: NoteName
): number {
  // Start with E shape position (root on 6th string)
  const eShapeFret = E_SHAPE_ROOT_FRETS[rootNote];
  
  // Calculate offset from E shape to target shape
  let offset = 0;
  const shapeIndex = CAGED_ORDER.indexOf(shapeName);
  
  for (let i = 0; i < shapeIndex; i++) {
    offset += SHAPE_GAPS[CAGED_ORDER[i]];
  }
  
  return (eShapeFret + offset) % 12;
}

/**
 * Compute the actual fret positions for a single CAGED shape
 */
function computeShapePosition(
  shapeData: CAGEDShape,
  rootNote: NoteName,
  quality: ChordQuality,
  anchorFret: number
): ComputedCAGEDShape {
  const notes: ComputedNote[] = shapeData.notes.map(notePos => {
    const actualFret = anchorFret + notePos.fretOffset;
    const noteName = getNoteAtPosition(notePos.string, actualFret);
    
    return {
      string: notePos.string,
      fret: actualFret,
      interval: notePos.interval,
      noteName,
      color: INTERVAL_COLORS[notePos.interval],
    };
  });
  
  const startFret = anchorFret + shapeData.minFretOffset;
  const endFret = anchorFret + shapeData.maxFretOffset;
  
  return {
    shapeName: shapeData.name,
    quality,
    rootNote,
    anchorFret,
    startFret,
    endFret,
    notes,
    colors: CAGED_COLORS[shapeData.name],
  };
}

/**
 * Get the actual fret positions for all shapes of a given root note and quality
 */
export function calculateAllShapePositions(
  rootNote: NoteName,
  quality: ChordQuality,
  maxFret: number = 15
): ComputedCAGEDShape[] {
  const shapes: ComputedCAGEDShape[] = [];
  
  for (const shapeName of CAGED_ORDER) {
    const shapeData = CAGED_SHAPES[shapeName][quality];
    const baseAnchorFret = calculateShapeAnchorFret(shapeName, rootNote);
    
    // Generate shapes at all octave positions within the fret range
    for (let octaveOffset = 0; octaveOffset <= 1; octaveOffset++) {
      const anchorFret = baseAnchorFret + (octaveOffset * 12);
      
      // Skip if shape would be mostly off the fretboard
      if (anchorFret > maxFret) continue;
      
      const computedShape = computeShapePosition(
        shapeData,
        rootNote,
        quality,
        anchorFret
      );
      
      // Only include if at least part of the shape is visible
      if (computedShape.startFret <= maxFret && computedShape.endFret >= 0) {
        shapes.push(computedShape);
      }
    }
  }
  
  // Sort by starting fret position
  shapes.sort((a, b) => a.startFret - b.startFret);

  return shapes;
}

/**
 * Get complete CAGED positions for a chord
 */
export function getCAGEDPositions(
  rootNote: NoteName,
  quality: ChordQuality,
  maxFret: number = 15
): CAGEDPositions {
  return {
    rootNote,
    quality,
    shapes: calculateAllShapePositions(rootNote, quality, maxFret),
  };
}

/**
 * Calculate the bounding region for a computed shape
 * This is useful for drawing outline boxes around CAGED regions
 */
export function getShapeRegion(shape: ComputedCAGEDShape): ShapeRegion {
  const strings = shape.notes.map(n => n.string);

  return {
    shapeName: shape.shapeName,
    startFret: Math.max(0, shape.startFret),
    endFret: shape.endFret,
    topString: Math.min(...strings),
    bottomString: Math.max(...strings),
    color: shape.colors,
  };
}

/**
 * Get all shape regions for visualization
 */
export function getAllShapeRegions(
  rootNote: NoteName,
  quality: ChordQuality,
  maxFret: number = 15
): ShapeRegion[] {
  const positions = getCAGEDPositions(rootNote, quality, maxFret);
  return positions.shapes.map(getShapeRegion);
}

/**
 * Get the display name for a chord (e.g., "G minor", "C# diminished")
 */
export function getChordDisplayName(rootNote: NoteName, quality: ChordQuality): string {
  const qualityNames: Record<ChordQuality, string> = {
    major: 'Major',
    minor: 'minor',
    diminished: 'dim',
    augmented: 'aug',
  };

  return `${rootNote} ${qualityNames[quality]}`;
}

/**
 * Get the chord symbol (e.g., "Gm", "C#dim", "Faug")
 */
export function getChordSymbol(rootNote: NoteName, quality: ChordQuality): string {
  const qualitySuffixes: Record<ChordQuality, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
  };

  return `${rootNote}${qualitySuffixes[quality]}`;
}

