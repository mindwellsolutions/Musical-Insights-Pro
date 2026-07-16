/**
 * CAGED System Type Definitions
 * Defines types for the CAGED chord shape system
 */

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented';
export type CAGEDShapeName = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * Note position within a CAGED shape (relative to anchor fret)
 */
export interface NotePosition {
  string: number;      // 0 = high E, 5 = low E
  fretOffset: number;  // Offset from the shape's anchor fret
  interval: 'R' | '3' | 'b3' | '5' | 'b5' | '#5';  // What interval this note represents
}

/**
 * CAGED shape definition
 */
export interface CAGEDShape {
  name: CAGEDShapeName;
  notes: NotePosition[];
  anchorString: number;      // Which string the primary root is on
  anchorFretOffset: number;  // Fret offset of the anchor root within the shape
  minFretOffset: number;     // Bounding box for drawing the outline
  maxFretOffset: number;
}

/**
 * Computed note with actual fret position
 */
export interface ComputedNote {
  string: number;           // 0-5 (high E to low E)
  fret: number;             // Actual fret number on the guitar
  interval: string;         // R, 3, b3, 5, b5, #5
  noteName: NoteName;       // The actual note name
  color: string;            // Color for this interval
}

/**
 * Computed CAGED shape with actual fret positions
 */
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

/**
 * Shape region for rendering colored outlines
 */
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
 * Complete CAGED positions for a chord
 */
export interface CAGEDPositions {
  rootNote: NoteName;
  quality: ChordQuality;
  shapes: ComputedCAGEDShape[];
}

