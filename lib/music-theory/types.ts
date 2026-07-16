/**
 * Complete TypeScript Type Definitions for Pentatonic Triad System
 * Based on blueprint: .blueprints/triad-anchor-sys/06-type-definitions.md
 */

// ============================================================================
// Core Music Theory Types
// ============================================================================

/**
 * Pitch class represented as 0-11 (C=0, C#=1, ... B=11)
 */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Note names with sharps
 */
export type NoteNameSharp = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/**
 * Note names with flats
 */
export type NoteNameFlat = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'Gb' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

/**
 * Combined note name type
 */
export type NoteName = NoteNameSharp | NoteNameFlat;

/**
 * Core note representation
 */
export interface Note {
  /** Pitch class 0-11 */
  pitchClass: PitchClass;
  /** Display name (e.g., "C#" or "Db") */
  name: NoteName;
  /** Optional enharmonic spelling */
  enharmonic?: NoteName;
}

/**
 * Interval names for display
 */
export type IntervalName = '1' | 'b2' | '2' | 'b3' | '3' | '4' | 'b5' | '5' | '#5' | '6' | 'b7' | '7';

/**
 * Interval in semitones
 */
export type Semitones = number;

// ============================================================================
// Guitar-Specific Types
// ============================================================================

/**
 * Guitar string numbers (1 = high E, 6 = low E)
 */
export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Fret numbers (0 = open, up to 24 typically)
 */
export type FretNumber = number;

/**
 * A position on the fretboard
 */
export interface FretPosition {
  /** String number (1-6) */
  string: StringNumber;
  /** Fret number (0-24) */
  fret: FretNumber;
}

/**
 * A note placed on the fretboard with full context
 */
export interface FretboardNote extends FretPosition {
  /** The note at this position */
  note: Note;
  /** Whether this is part of a triad */
  isTriadNote?: boolean;
  /** Whether this is the root of the current chord */
  isRoot?: boolean;
  /** Interval from root (for display) */
  intervalFromRoot?: IntervalName;
  /** Suggested finger (1-4) */
  suggestedFinger?: FingerNumber;
  /** CSS class for styling */
  styleClass?: string;
  /** Whether note is muted (two-note mode) */
  isMuted?: boolean;
  /** Whether this is a pentatonic note */
  isPentatonic?: boolean;
  /** Whether this is an embellishment target */
  isEmbellishment?: boolean;
}

/**
 * Finger numbers (1=index, 2=middle, 3=ring, 4=pinky)
 */
export type FingerNumber = 0 | 1 | 2 | 3 | 4;  // 0 = open string

// ============================================================================
// Triad Types
// ============================================================================

/**
 * Triad qualities
 */
export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';

/**
 * Triad inversions
 */
export type Inversion = 'root' | 'first' | 'second';

/**
 * String set identifiers (which 3 adjacent strings)
 */
export type StringSet = '123' | '234' | '345' | '456';

/**
 * String set metadata
 */
export interface StringSetInfo {
  id: StringSet;
  strings: [StringNumber, StringNumber, StringNumber];
  name: string; // e.g., "E-B-G" or "D-A-E"
}

/**
 * A triad (abstract chord, not positioned on fretboard)
 */
export interface Triad {
  /** Root note */
  root: Note;
  /** Chord quality */
  quality: TriadQuality;
  /** All three notes [root, third, fifth] */
  notes: [Note, Note, Note];
  /** Intervals in semitones from root */
  intervals: [0, Semitones, Semitones];
  /** Display name (e.g., "C", "Am", "Bdim") */
  displayName?: string;
}

/**
 * Fingering for a triad voicing
 */
export interface TriadFingering {
  /** Finger assignments [bass, middle, treble] */
  fingers: [FingerNumber, FingerNumber, FingerNumber];
  /** Whether a barre is used */
  usesBarre: boolean;
  /** Fret span required */
  span: number;
  /** Difficulty rating 1-5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

/**
 * A specific voicing of a triad on the fretboard
 */
export interface TriadVoicing extends Triad {
  /** Which inversion */
  inversion: Inversion;
  /** Which string set */
  stringSet: StringSet;
  /** The three fretboard positions [bass, middle, treble] */
  positions: [FretboardNote, FretboardNote, FretboardNote];
  /** Lowest fret used */
  lowestFret: FretNumber;
  /** Highest fret used */
  highestFret: FretNumber;
  /** Center fret (for zone calculation) */
  centerFret: FretNumber;
  /** Fingering assignment */
  fingering: TriadFingering;
  /** Unique identifier for this voicing */
  voicingId: string;
}

// ============================================================================
// Scale Types
// ============================================================================

/**
 * Pentatonic mode
 */
export type PentatonicMode = 'major' | 'minor';

/**
 * A pentatonic scale
 */
export interface PentatonicScale {
  /** Root note */
  root: Note;
  /** Major or minor pentatonic */
  mode: PentatonicMode;
  /** The five notes in the scale */
  notes: [Note, Note, Note, Note, Note];
  /** Intervals from root */
  intervals: [0, Semitones, Semitones, Semitones, Semitones];
  /** Relative major/minor */
  relative: Note;
}

/**
 * Pentatonic box position number (1-5)
 */
export type BoxPosition = 1 | 2 | 3 | 4 | 5;

/**
 * A pentatonic box pattern
 */
export interface PentatonicBox {
  /** Box position number */
  position: BoxPosition;
  /** The scale this box belongs to */
  scale: PentatonicScale;
  /** Starting fret for this box */
  startFret: FretNumber;
  /** Ending fret for this box */
  endFret: FretNumber;
  /** All note positions in this box */
  notes: FretboardNote[];
  /** The root note positions in this box */
  rootPositions: FretPosition[];
}

/**
 * Scale mode (for diatonic chord generation)
 */
export type ScaleMode = 'major' | 'minor';

/**
 * A diatonic scale
 */
export interface DiatonicScale {
  /** Root/tonic */
  root: Note;
  /** Scale mode */
  mode: ScaleMode;
  /** All seven notes */
  notes: Note[];
  /** Intervals from root */
  intervals: Semitones[];
}

// ============================================================================
// CAGED & Zone Types
// ============================================================================

/**
 * CAGED shape names
 */
export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * Zone number (1-10 for full 24-fret coverage)
 */
export type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * A zone on the fretboard
 */
export interface Zone {
  /** Zone number */
  zoneNumber: ZoneNumber;
  /** Starting fret */
  startFret: FretNumber;
  /** Ending fret */
  endFret: FretNumber;
  /** Center fret */
  centerFret: FretNumber;
  /** Associated CAGED shape */
  cagedShape: CAGEDShape;
}

// ============================================================================
// Voice Leading & Analysis Types
// ============================================================================

/**
 * Voice leading connection between two voicings
 */
export interface VoiceLeadingConnection {
  /** Source voicing */
  from: TriadVoicing;
  /** Target voicing */
  to: TriadVoicing;
  /** Total semitone movement */
  totalMovement: number;
  /** Individual voice movements [bass, middle, treble] */
  movements: [number, number, number];
  /** Quality rating (lower is better) */
  quality: number;
}

/**
 * Embellishment technique
 */
export type EmbellishmentType = 'slide' | 'hammer-on' | 'pull-off';

/**
 * An embellishment opportunity
 */
export interface Embellishment {
  /** Source position (triad note) */
  from: FretPosition;
  /** Target position (pentatonic note) */
  to: FretPosition;
  /** Type of embellishment */
  type: EmbellishmentType;
  /** Distance in frets */
  distance: number;
}

/**
 * Chord neighborhood - compatible chords within reach
 */
export interface ChordNeighborhood {
  /** Current voicing */
  currentVoicing: TriadVoicing;
  /** Nearby compatible voicings */
  neighbors: Array<{
    voicing: TriadVoicing;
    voiceLeading: VoiceLeadingConnection;
    diatonicRelationship?: string;
  }>;
}

// ============================================================================
// Chord Progression Types
// ============================================================================

/**
 * A chord in a progression
 */
export interface ProgressionChord {
  /** The triad */
  triad: Triad;
  /** Roman numeral (e.g., "I", "IV", "V") */
  romanNumeral: string;
  /** Duration in beats */
  duration: number;
  /** Suggested voicing */
  suggestedVoicing?: TriadVoicing;
}

/**
 * A chord progression
 */
export interface ChordProgression {
  /** Progression name */
  name: string;
  /** Key */
  key: Note;
  /** Mode */
  mode: ScaleMode;
  /** Chords in sequence */
  chords: ProgressionChord[];
  /** Voice leading path */
  voiceLeadingPath?: VoiceLeadingConnection[];
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Two-note mode configuration
 */
export type TwoNoteMode = 'off' | 'remove-middle' | 'remove-bass';

/**
 * View toggles
 */
export interface ViewToggles {
  /** Show pentatonic overlay */
  showPentatonic: boolean;
  /** Show bar chord reference */
  showBarChord: boolean;
  /** Show embellishments */
  showEmbellishments: boolean;
  /** Show voice leading lines */
  showVoiceLeading: boolean;
  /** Show chord neighborhood */
  showNeighborhood: boolean;
  /** Show CAGED shapes overlay */
  showCAGEDShapes: boolean;
}

/**
 * Application state for triad system
 */
export interface TriadSystemState {
  /** Selected key */
  selectedKey: Note;
  /** Selected mode */
  selectedMode: ScaleMode;
  /** Selected triad quality */
  selectedQuality: TriadQuality;
  /** Selected string sets */
  selectedStringSets: StringSet[];
  /** Selected inversions */
  selectedInversions: Inversion[];
  /** Current zone */
  currentZone: Zone | null;
  /** Two-note mode */
  twoNoteMode: TwoNoteMode;
  /** View toggles */
  viewToggles: ViewToggles;
  /** Selected voicing */
  selectedVoicing: TriadVoicing | null;
  /** Current progression */
  currentProgression: ChordProgression | null;
  /** Selected CAGED shapes for filtering */
  selectedCAGEDShapes: CAGEDShape[];
}

// ============================================================================
// Render Data Types
// ============================================================================

/**
 * Prepared data for fretboard rendering
 */
export interface FretboardRenderData {
  /** Triad notes to display */
  triadNotes: FretboardNote[];
  /** Pentatonic overlay notes */
  pentatonicNotes: FretboardNote[];
  /** Bar chord reference notes */
  barChordNotes: FretboardNote[];
  /** Embellishment connections */
  embellishments: Embellishment[];
  /** Voice leading connections */
  voiceLeadingLines: VoiceLeadingConnection[];
  /** Zone highlight */
  zoneHighlight: Zone | null;
}

