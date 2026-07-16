/**
 * CAGED System Utilities
 * 
 * Functions for calculating CAGED shape positions on the fretboard
 * based on root note and chord quality.
 */

import {
  NoteName,
  ChordQuality,
  CAGEDShapeName,
  CAGEDShape,
  NotePosition,
  NOTES,
  STANDARD_TUNING,
  CAGED_SHAPES,
  CAGED_ORDER,
  SHAPE_GAPS,
  E_SHAPE_ROOT_FRETS,
  CAGED_COLORS,
  INTERVAL_COLORS,
} from './caged-data';

// ============================================================================
// TYPE DEFINITIONS FOR COMPUTED POSITIONS
// ============================================================================

export interface ComputedNote {
  string: number;           // 0-5 (high E to low E)
  fret: number;             // Actual fret number on the guitar
  interval: string;         // R, 3, b3, 5, b5, #5
  noteName: NoteName;       // The actual note name
  color: string;            // Color for this interval
}

export interface ComputedCAGEDShape {
  shapeName: CAGEDShapeName;
  quality: ChordQuality;
  rootNote: NoteName;
  anchorFret: number;       // The fret where this shape's anchor is
  startFret: number;        // Leftmost fret of the shape
  endFret: number;          // Rightmost fret of the shape
  notes: ComputedNote[];    // All notes with their actual fret positions
  colors: {
    fill: string;
    stroke: string;
    text: string;
  };
}

export interface CAGEDPositions {
  rootNote: NoteName;
  quality: ChordQuality;
  shapes: ComputedCAGEDShape[];
}

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
 * Find the fret number on a given string where a specific note is located
 * Returns the lowest fret (0-11) where the note appears
 */
export function findFretForNote(string: number, targetNote: NoteName): number {
  const openNote = STANDARD_TUNING[string];
  const openNoteIndex = getNoteIndex(openNote);
  const targetIndex = getNoteIndex(targetNote);
  return ((targetIndex - openNoteIndex) % 12 + 12) % 12;
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
 * Get a single shape at a specific position
 */
export function getShapeAtPosition(
  shapeName: CAGEDShapeName,
  rootNote: NoteName,
  quality: ChordQuality,
  octave: number = 0
): ComputedCAGEDShape {
  const shapeData = CAGED_SHAPES[shapeName][quality];
  const baseAnchorFret = calculateShapeAnchorFret(shapeName, rootNote);
  const anchorFret = baseAnchorFret + (octave * 12);
  
  return computeShapePosition(shapeData, rootNote, quality, anchorFret);
}

// ============================================================================
// REGION/BOUNDING BOX CALCULATIONS (for outline rendering)
// ============================================================================

export interface ShapeRegion {
  shapeName: CAGEDShapeName;
  startFret: number;
  endFret: number;
  topString: number;      // 0 = high E
  bottomString: number;   // 5 = low E
  color: {
    fill: string;
    stroke: string;
    text: string;
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

// ============================================================================
// CHORD DISPLAY NAME UTILITIES
// ============================================================================

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
