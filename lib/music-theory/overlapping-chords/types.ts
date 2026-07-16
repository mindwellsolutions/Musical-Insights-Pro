/**
 * Overlapping Chords Feature - Type Definitions
 * Defines all TypeScript interfaces and types for the overlapping chords system
 */

import { TriadType } from '@/lib/triad-theory';

export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

export type OverlapType = 'complete' | 'partial';

export type ChordQuality = 
  | 'major' 
  | 'minor' 
  | 'diminished' 
  | 'augmented' 
  | 'dominant7' 
  | 'major7' 
  | 'minor7';

/**
 * Represents a note position on the fretboard
 */
export interface FretNote {
  string: number;  // 0-based string index (0 = low E, 5 = high E)
  fret: number;    // 0-based fret number
  note: string;    // Note name (e.g., 'C', 'D#')
}

/**
 * Defines fret and string boundaries for an area on the fretboard
 */
export interface FretBoundary {
  minFret: number;
  maxFret: number;
  minString: number;
  maxString: number;
}

/**
 * Represents a specific chord voicing on the fretboard
 */
export interface ChordVoicing {
  rootNote: string;
  quality: ChordQuality;
  notes: FretNote[];  // All notes in the voicing
  fretRange: [number, number];  // [min, max] fret positions
  stringRange: [number, number];  // [min, max] string positions
}

/**
 * Represents a chord that overlaps with a CAGED area or scale
 */
export interface OverlappingChord extends ChordVoicing {
  overlapCount: number;  // Number of notes overlapping with target
  overlapPercentage: number;  // Percentage of chord notes overlapping
  chordSymbol: string;  // Display name (e.g., "Cmaj", "Am7")
  isSelected: boolean;  // User selection state
  color?: string;  // Assigned color for display
}

/**
 * Main state for the overlapping chords feature
 */
export interface OverlappingChordsState {
  enabled: boolean;
  mode: 'caged' | 'scale';
  overlapType: OverlapType;

  // CAGED Mode State
  selectedCagedShapes: CAGEDShape[];
  cagedPositions: Record<CAGEDShape, number>;  // shape -> fret position

  // Scale Mode State
  selectedScale: {
    key: string;
    mode: string;
  } | null;
  selectedScalePositions: number[];  // starting fret positions (0-12)

  // Selected chords for display
  selectedChords: OverlappingChord[];

  // Saved fretboard state (for restore on toggle off)
  savedFretboardState: FretboardState | null;
}

/**
 * Minimal fretboard state for save/restore functionality
 */
export interface FretboardState {
  displayedNotes: FretNote[];
  highlightedAreas?: any;  // CAGED areas or scale positions
  // Add other necessary fretboard state properties as needed
}

/**
 * Color assignment for a chord
 */
export interface ChordColorAssignment {
  chordId: string;  // Unique identifier for chord
  color: string;    // Hex color code
}

/**
 * Data structure for fretboard display
 */
export interface FretboardDisplayData {
  type: 'overlapping-chords' | 'normal';
  chords?: OverlappingChord[];  // Selected chords to display
  mode?: 'caged' | 'scale';
  cagedShapes?: CAGEDShape[];  // For background display
  scalePositions?: number[];   // For background display
}

