/**
 * Chord Neighborhood System - Type Definitions
 * Defines types for anchor voicings, nearby chords, and neighborhood state
 */

import { TriadType } from '@/lib/triad-theory';
import { ChordVoicing } from '@/lib/chord-voicings';

/**
 * Represents a specific triad voicing on the fretboard
 */
export interface AnchorVoicing {
  /** Root note of the triad (e.g., 'C', 'G#') */
  rootNote: string;
  
  /** Triad quality (major, minor, diminished, augmented) */
  quality: TriadType;
  
  /** String set used for this voicing (e.g., [1, 2, 3] for strings 1-3) */
  stringSet: number[];
  
  /** Inversion type (root, first, second) */
  inversion: 'root' | 'first' | 'second';
  
  /** Starting fret position */
  fretPosition: number;
  
  /** Specific fret numbers for each string in the voicing */
  frets: number[];
  
  /** Notes in the voicing (in order from lowest to highest string) */
  notes: string[];
}

/**
 * Represents a nearby chord relative to an anchor voicing
 */
export interface NearbyChord {
  /** Root note of the nearby chord */
  rootNote: string;

  /** Chord quality */
  quality: TriadType;

  /** Roman numeral degree (e.g., 'I', 'ii', 'V') */
  degree: string;

  /** Chord function (e.g., 'Tonic', 'Dominant') */
  function: string;

  /** Distance in frets from anchor voicing */
  distance: number;

  /** Number of common tones shared with anchor */
  commonTones: number;

  /** The common tone note names */
  commonToneNotes: string[];

  /** Nearest voicing of this chord to the anchor */
  nearestVoicing: AnchorVoicing;

  /** All available voicings within the search range */
  allVoicings: AnchorVoicing[];

  /** Full chord voicings (for chord mode, not just triads) */
  chordVoicings?: ChordVoicing[];

  /** Selected voicing index (for user's chosen voicing) */
  selectedVoicingIndex?: number;

  /** The actual selected voicing object (when user picks a specific voicing) */
  selectedVoicing?: ChordVoicing;

  /** Chord symbol (e.g., 'Cmaj7', 'Am', 'G7') */
  chordSymbol?: string;

  /** Notes in the chord (for full chords, not just triads) */
  chordNotes?: string[];
}

/**
 * State for the chord neighborhood system
 */
export interface ChordNeighborhoodState {
  /** Currently selected anchor voicing (null if none selected) */
  anchorVoicing: AnchorVoicing | null;

  /** List of nearby diatonic chords */
  nearbyChords: NearbyChord[];

  /** Multiple anchor voicings (for notes shared by multiple chords) */
  anchorVoicings: AnchorVoicing[];

  /** Active tab index when multiple anchors are present */
  activeAnchorIndex: number;

  /** List of nearby diatonic chords for each anchor */
  nearbyChordsByAnchor: NearbyChord[][];

  /** Currently selected nearby chord for overlay (null if none) */
  selectedOverlay: NearbyChord | null;

  /** Whether the neighborhood panel is visible */
  isPanelVisible: boolean;

  /** Search range in frets (default: 2-6) */
  searchRange: {
    min: number;
    max: number;
  };

  /** Mode: 'triads' or 'chords' */
  selectionMode?: 'triads' | 'chords';

  /** Whether the chord diagram sidebar is visible */
  isChordDiagramSidebarVisible?: boolean;

  /** Chords in the current progression (for display and voicing selection) */
  progressionChords?: NearbyChord[];
}

/**
 * Diatonic chord definition for a key
 */
export interface DiatonicChordDef {
  /** Scale degree (0-6) */
  degree: number;
  
  /** Roman numeral (e.g., 'I', 'ii', 'vii°') */
  numeral: string;
  
  /** Semitones from tonic */
  semitones: number;
  
  /** Chord quality */
  quality: TriadType;
  
  /** Chord function */
  function: string;
}

