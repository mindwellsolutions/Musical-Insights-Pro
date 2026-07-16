# Complete TypeScript Type Definitions

## Executive Summary

This document provides all TypeScript interfaces, types, and enums needed to implement the Pentatonic Triad System. These serve as the single source of truth for data structures throughout the application.

---

## 1. Core Music Theory Types

### 1.1 Note & Pitch Types

```typescript
/**
 * Pitch class represented as 0-11 (C=0, C#=1, ... B=11)
 */
type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Note names with sharps
 */
type NoteNameSharp = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/**
 * Note names with flats
 */
type NoteNameFlat = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'Gb' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

/**
 * Combined note name type
 */
type NoteName = NoteNameSharp | NoteNameFlat;

/**
 * Core note representation
 */
interface Note {
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
type IntervalName = '1' | 'b2' | '2' | 'b3' | '3' | '4' | 'b5' | '5' | '#5' | '6' | 'b7' | '7';

/**
 * Interval in semitones
 */
type Semitones = number;
```

### 1.2 Guitar-Specific Types

```typescript
/**
 * Guitar string numbers (1 = high E, 6 = low E)
 */
type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Fret numbers (0 = open, up to 24 typically)
 */
type FretNumber = number;

/**
 * A position on the fretboard
 */
interface FretPosition {
  /** String number (1-6) */
  string: StringNumber;
  /** Fret number (0-24) */
  fret: FretNumber;
}

/**
 * A note placed on the fretboard with full context
 */
interface FretboardNote extends FretPosition {
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
type FingerNumber = 1 | 2 | 3 | 4;

/**
 * Standard guitar tuning as pitch classes
 */
const STANDARD_TUNING: readonly [PitchClass, PitchClass, PitchClass, PitchClass, PitchClass, PitchClass] = 
  [4, 9, 2, 7, 11, 4] as const; // E, A, D, G, B, E
```

---

## 2. Triad Types

### 2.1 Quality & Inversion

```typescript
/**
 * Triad qualities
 */
type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';

/**
 * Triad inversions
 */
type Inversion = 'root' | 'first' | 'second';

/**
 * String set identifiers (which 3 adjacent strings)
 */
type StringSet = '123' | '234' | '345' | '456';

/**
 * String set metadata
 */
interface StringSetInfo {
  id: StringSet;
  strings: [StringNumber, StringNumber, StringNumber];
  name: string; // e.g., "E-B-G" or "D-A-E"
}

/**
 * All string sets with metadata
 */
const STRING_SET_INFO: Record<StringSet, StringSetInfo> = {
  '123': { id: '123', strings: [1, 2, 3], name: 'E-B-G' },
  '234': { id: '234', strings: [2, 3, 4], name: 'B-G-D' },
  '345': { id: '345', strings: [3, 4, 5], name: 'G-D-A' },
  '456': { id: '456', strings: [4, 5, 6], name: 'D-A-E' }
};
```

### 2.2 Triad Models

```typescript
/**
 * A triad (abstract chord, not positioned on fretboard)
 */
interface Triad {
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
 * A specific voicing of a triad on the fretboard
 */
interface TriadVoicing extends Triad {
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

/**
 * Fingering for a triad voicing
 */
interface TriadFingering {
  /** Finger assignments [bass, middle, treble] */
  fingers: [FingerNumber, FingerNumber, FingerNumber];
  /** Whether a barre is used */
  usesBarre: boolean;
  /** Fret span required */
  span: number;
  /** Difficulty rating 1-5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
}
```

---

## 3. Scale Types

### 3.1 Pentatonic Scale Types

```typescript
/**
 * Pentatonic mode
 */
type PentatonicMode = 'major' | 'minor';

/**
 * A pentatonic scale
 */
interface PentatonicScale {
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
type BoxPosition = 1 | 2 | 3 | 4 | 5;

/**
 * A pentatonic box pattern
 */
interface PentatonicBox {
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
 * Pentatonic formulas (intervals from root)
 */
const PENTATONIC_FORMULAS = {
  minor: [0, 3, 5, 7, 10] as const,  // 1, b3, 4, 5, b7
  major: [0, 2, 4, 7, 9] as const    // 1, 2, 3, 5, 6
} as const;
```

### 3.2 Major Scale Types

```typescript
/**
 * Scale mode (for diatonic chord generation)
 */
type ScaleMode = 'major' | 'minor';

/**
 * A diatonic scale
 */
interface DiatonicScale {
  /** Root/tonic */
  root: Note;
  /** Scale mode */
  mode: ScaleMode;
  /** All seven notes */
  notes: Note[];
  /** Intervals from root */
  intervals: Semitones[];
}

/**
 * Major scale formula
 */
const MAJOR_SCALE_FORMULA = [0, 2, 4, 5, 7, 9, 11] as const;

/**
 * Natural minor scale formula
 */
const MINOR_SCALE_FORMULA = [0, 2, 3, 5, 7, 8, 10] as const;
```

---

## 4. Chord & Progression Types

### 4.1 Diatonic Chord Types

```typescript
/**
 * Roman numeral chord symbols
 */
type RomanNumeral = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°' |
                    'i' | 'II' | 'III' | 'iv' | 'v' | 'VI' | 'VII';

/**
 * Chord function names
 */
type ChordFunction = 
  | 'Tonic'
  | 'Supertonic'
  | 'Mediant'
  | 'Subdominant'
  | 'Dominant'
  | 'Submediant'
  | 'Leading Tone';

/**
 * A diatonic chord with context
 */
interface DiatonicChord {
  /** The triad */
  triad: Triad;
  /** Roman numeral */
  numeral: RomanNumeral;
  /** Scale degree (1-7) */
  scaleDegree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Functional name */
  function: ChordFunction;
}

/**
 * Diatonic chords for major keys
 */
const MAJOR_KEY_NUMERALS: readonly RomanNumeral[] = 
  ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const;

/**
 * Diatonic chords for minor keys
 */
const MINOR_KEY_NUMERALS: readonly RomanNumeral[] = 
  ['i', 'II', 'III', 'iv', 'v', 'VI', 'VII'] as const;
```

### 4.2 Progression Types

```typescript
/**
 * A chord in a progression with timing
 */
interface ProgressionChord {
  /** The chord */
  chord: DiatonicChord;
  /** Selected voicing */
  voicing: TriadVoicing;
  /** Duration in beats */
  beats: number;
  /** Position in progression (0-indexed) */
  position: number;
}

/**
 * A complete chord progression
 */
interface ChordProgression {
  /** Unique identifier */
  id: string;
  /** Display name (e.g., "I-IV-V-I") */
  name: string;
  /** Key of the progression */
  key: Note;
  /** Mode (major/minor) */
  mode: ScaleMode;
  /** Chords in order */
  chords: ProgressionChord[];
  /** Total beats */
  totalBeats: number;
  /** Tempo in BPM (optional) */
  tempo?: number;
}

/**
 * Preset progression templates
 */
interface ProgressionPreset {
  /** Preset name */
  name: string;
  /** Description */
  description: string;
  /** Numerals in order */
  numerals: RomanNumeral[];
  /** Beats per chord (default) */
  defaultBeats: number[];
  /** Genre/style tag */
  genre?: string;
}

/**
 * Common progression presets
 */
const PROGRESSION_PRESETS: ProgressionPreset[] = [
  { name: 'I-IV-V-I', description: 'Classic Rock/Pop', numerals: ['I', 'IV', 'V', 'I'], defaultBeats: [4, 4, 4, 4] },
  { name: 'I-V-vi-IV', description: 'Pop Ballad', numerals: ['I', 'V', 'vi', 'IV'], defaultBeats: [4, 4, 4, 4] },
  { name: 'ii-V-I', description: 'Jazz Standard', numerals: ['ii', 'V', 'I'], defaultBeats: [4, 4, 8] },
  { name: 'I-vi-IV-V', description: '50s Progression', numerals: ['I', 'vi', 'IV', 'V'], defaultBeats: [4, 4, 4, 4] },
  { name: 'vi-IV-I-V', description: 'Modern Pop', numerals: ['vi', 'IV', 'I', 'V'], defaultBeats: [4, 4, 4, 4] },
  { name: 'i-VI-III-VII', description: 'Minor Epic', numerals: ['i', 'VI', 'III', 'VII'], defaultBeats: [4, 4, 4, 4] },
  { name: 'I-iii-vi-IV', description: 'Emotional Pop', numerals: ['I', 'iii', 'vi', 'IV'], defaultBeats: [4, 4, 4, 4] },
  { name: '12-Bar Blues', description: 'Blues', numerals: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'], defaultBeats: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] }
];
```

---

## 5. Voice Leading Types

```typescript
/**
 * Voice leading quality ratings
 */
type VoiceLeadingQuality = 'excellent' | 'good' | 'acceptable' | 'rough';

/**
 * Movement of a single voice
 */
interface VoiceMovement {
  /** Starting position */
  from: FretboardNote;
  /** Ending position */
  to: FretboardNote;
  /** Semitones moved */
  semitones: Semitones;
  /** Frets moved on fretboard */
  fretDistance: number;
  /** Whether voice stays on same string */
  sameString: boolean;
}

/**
 * Complete voice leading between two voicings
 */
interface VoiceLeading {
  /** Source voicing */
  from: TriadVoicing;
  /** Target voicing */
  to: TriadVoicing;
  /** Individual voice movements */
  movements: [VoiceMovement, VoiceMovement, VoiceMovement];
  /** Total semitone movement */
  totalMovement: Semitones;
  /** Number of common tones (0-3) */
  commonTones: number;
  /** Quality rating */
  quality: VoiceLeadingQuality;
  /** Smoothness score (0-100, higher = smoother) */
  smoothnessScore: number;
}

/**
 * Optimized voice leading path through a progression
 */
interface VoiceLeadingPath {
  /** Progression this path is for */
  progression: ChordProgression;
  /** Optimized voicings in order */
  voicings: TriadVoicing[];
  /** Voice leading between each pair */
  transitions: VoiceLeading[];
  /** Overall smoothness score */
  overallSmoothness: number;
  /** String set consistency (same string set throughout?) */
  stringSetConsistent: boolean;
}

/**
 * Thresholds for voice leading quality
 */
const VOICE_LEADING_THRESHOLDS = {
  excellent: { maxSemitones: 2, minCommonTones: 2 },
  good: { maxSemitones: 4, minCommonTones: 1 },
  acceptable: { maxSemitones: 6, minCommonTones: 0 },
  // Anything above is 'rough'
} as const;
```

---

## 6. Zone Types

```typescript
/**
 * Zone numbers (1-6 covering frets 0-15+)
 */
type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * CAGED shape names
 */
type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * A fretboard zone
 */
interface Zone {
  /** Zone number */
  zoneNumber: ZoneNumber;
  /** Starting fret */
  startFret: FretNumber;
  /** Ending fret */
  endFret: FretNumber;
  /** Center fret (anchor point) */
  centerFret: FretNumber;
  /** Associated CAGED shape */
  cagedShape: CAGEDShape;
  /** Triad voicings available in this zone */
  triadVoicings?: TriadVoicing[];
  /** Pentatonic box for this zone */
  pentatonicBox?: PentatonicBox;
  /** Compatible chords in this zone */
  compatibleChords?: Triad[];
}

/**
 * Zone definitions (static)
 */
const ZONE_DEFINITIONS: readonly Zone[] = [
  { zoneNumber: 1, startFret: 0, endFret: 3, centerFret: 2, cagedShape: 'E' },
  { zoneNumber: 2, startFret: 2, endFret: 6, centerFret: 4, cagedShape: 'D' },
  { zoneNumber: 3, startFret: 5, endFret: 9, centerFret: 7, cagedShape: 'C' },
  { zoneNumber: 4, startFret: 7, endFret: 11, centerFret: 9, cagedShape: 'A' },
  { zoneNumber: 5, startFret: 10, endFret: 14, centerFret: 12, cagedShape: 'G' },
  { zoneNumber: 6, startFret: 12, endFret: 15, centerFret: 14, cagedShape: 'E' }
] as const;
```

---

## 7. Embellishment Types

```typescript
/**
 * Types of embellishments
 */
type EmbellishmentType = 
  | 'hammer-on'
  | 'pull-off'
  | 'slide-up'
  | 'slide-down'
  | 'bend'
  | 'vibrato';

/**
 * An embellishment technique
 */
interface Embellishment {
  /** Type of embellishment */
  type: EmbellishmentType;
  /** Starting position */
  from: FretboardNote;
  /** Target position */
  to: FretboardNote;
  /** Interval in semitones */
  interval: Semitones;
  /** Suggested finger */
  finger: FingerNumber;
}

/**
 * Collection of embellishments for a voicing
 */
interface EmbellishmentSet {
  /** The base triad voicing */
  triadVoicing: TriadVoicing;
  /** Available embellishments */
  embellishments: Embellishment[];
  /** Reachable pentatonic notes */
  reachableNotes: FretboardNote[];
}
```

---

## 8. Chord Neighborhood Types

```typescript
/**
 * Relationship between two chords
 */
type ChordRelationship = 
  | 'Relative Minor'
  | 'Relative Major'
  | 'Subdominant (IV)'
  | 'Dominant (V)'
  | 'Supertonic (ii)'
  | 'Mediant (iii)'
  | 'Submediant (vi)'
  | 'Leading Tone (vii°)'
  | string; // Generic interval description

/**
 * A neighboring chord
 */
interface ChordNeighbor {
  /** The chord */
  chord: Triad;
  /** Best voicing near current position */
  voicing: TriadVoicing;
  /** Fret distance from current chord */
  fretDistance: number;
  /** Functional relationship */
  relationship: ChordRelationship;
}

/**
 * Complete chord neighborhood analysis
 */
interface ChordNeighborhood {
  /** Current chord being analyzed */
  currentChord: Triad;
  /** Current voicing */
  currentVoicing: TriadVoicing;
  /** Immediate neighbors (within 2 frets) */
  immediateNeighbors: ChordNeighbor[];
  /** Extended neighbors (3-4 frets away) */
  extendedNeighbors: ChordNeighbor[];
}
```

---

## 9. Two-Note Mode Types

```typescript
/**
 * Two-note mode options
 */
type TwoNoteMode = 'outside' | 'top';

/**
 * Two-note voicing (reduced from triad)
 */
interface TwoNoteVoicing {
  /** Original triad this came from */
  sourceTriad: TriadVoicing;
  /** Mode used */
  mode: TwoNoteMode;
  /** The two notes kept */
  notes: [FretboardNote, FretboardNote];
  /** The note that was removed/muted */
  mutedNote: FretboardNote;
  /** Description (e.g., "Root + 5th") */
  description: string;
}
```

---

## 10. Application State Types

### 10.1 User Selection State

```typescript
/**
 * Current user selections
 */
interface UserSelections {
  /** Selected key (pitch class) */
  key: PitchClass;
  /** Major or minor */
  mode: ScaleMode;
  /** Active string set filter (null = all) */
  stringSetFilter: StringSet | null;
  /** Active inversion filter (null = all) */
  inversionFilter: Inversion | null;
  /** Currently selected voicing */
  selectedVoicing: TriadVoicing | null;
  /** Current zone (1-6) */
  currentZone: ZoneNumber;
  /** Selected chord in progression (index) */
  progressionIndex: number | null;
}
```

### 10.2 View Settings State

```typescript
/**
 * View/display settings
 */
interface ViewSettings {
  /** Show pentatonic overlay */
  showPentatonicOverlay: boolean;
  /** Show bar chord reference */
  showBarChordReference: boolean;
  /** Show embellishments */
  showEmbellishments: boolean;
  /** Show voice leading lines */
  showVoiceLeading: boolean;
  /** Show chord neighborhood */
  showNeighborhood: boolean;
  /** Two-note mode enabled */
  twoNoteMode: boolean;
  /** Which two-note mode */
  twoNoteModeType: TwoNoteMode;
  /** Show fingering numbers */
  showFingering: boolean;
  /** Fingering display style */
  fingeringStyle: 'numbers' | 'diagram';
  /** Note label content */
  noteLabelContent: 'note' | 'interval' | 'finger' | 'none';
  /** Pentatonic box to show (null = all in zone) */
  pentatonicBox: BoxPosition | null;
}
```

### 10.3 Derived State

```typescript
/**
 * Computed/derived state (cached)
 */
interface DerivedState {
  /** All diatonic chords for current key */
  diatonicChords: DiatonicChord[];
  /** Relative pentatonic scale */
  relativePentatonic: PentatonicScale;
  /** All available voicings (filtered) */
  availableVoicings: TriadVoicing[];
  /** Current voicing with full data */
  currentVoicing: TriadVoicing | null;
  /** Chord neighborhood for current voicing */
  chordNeighborhood: ChordNeighborhood | null;
  /** Embellishments for current voicing */
  embellishmentSet: EmbellishmentSet | null;
  /** Zone data for current key */
  zoneData: Zone[];
}
```

### 10.4 Progression State

```typescript
/**
 * Progression builder state
 */
interface ProgressionState {
  /** Current progression being built/played */
  currentProgression: ChordProgression | null;
  /** Optimized voice leading path */
  voiceLeadingPath: VoiceLeadingPath | null;
  /** Playback state */
  playback: {
    isPlaying: boolean;
    currentBeat: number;
    currentChordIndex: number;
    tempo: number;
  };
}
```

### 10.5 Complete App State

```typescript
/**
 * Complete application state
 */
interface AppState {
  /** User selections */
  selections: UserSelections;
  /** View settings */
  viewSettings: ViewSettings;
  /** Derived/computed state */
  derivedState: DerivedState;
  /** Progression state */
  progression: ProgressionState;
  /** UI state */
  ui: {
    activePanel: 'position' | 'voiceLeading' | 'neighborhood';
    isLoading: boolean;
    error: string | null;
  };
}
```

---

## 11. Rendering Types

### 11.1 Render Layer Types

```typescript
/**
 * Types of render layers
 */
type RenderLayerType = 
  | 'zone-highlight'
  | 'notes'
  | 'connections'
  | 'embellishments'
  | 'fingering';

/**
 * A render layer
 */
interface RenderLayer {
  /** Layer type */
  type: RenderLayerType;
  /** Z-index (lower = behind) */
  zIndex: number;
  /** Layer-specific data */
  data: unknown;
}

/**
 * Zone highlight layer
 */
interface ZoneHighlightLayer extends RenderLayer {
  type: 'zone-highlight';
  data: {
    startFret: FretNumber;
    endFret: FretNumber;
    color: string;
  };
}

/**
 * Notes layer
 */
interface NotesLayer extends RenderLayer {
  type: 'notes';
  data: {
    notes: FretboardNote[];
  };
}

/**
 * Connections layer (voice leading lines)
 */
interface ConnectionsLayer extends RenderLayer {
  type: 'connections';
  data: {
    connections: Array<{
      from: FretPosition;
      to: FretPosition;
      style: 'solid' | 'dashed';
      color: string;
    }>;
  };
}

/**
 * Complete fretboard render data
 */
interface FretboardRenderData {
  /** Layers to render (in order) */
  layers: RenderLayer[];
  /** Active zone */
  activeZone?: Zone;
  /** Fret range to display */
  fretRange: [FretNumber, FretNumber];
}
```

### 11.2 CSS Class Types

```typescript
/**
 * CSS classes for note styling
 */
type NoteStyleClass = 
  | 'note-root'
  | 'note-third'
  | 'note-third-minor'
  | 'note-fifth'
  | 'note-triad'
  | 'note-pentatonic-ghost'
  | 'note-barchord-ghost'
  | 'note-embellishment'
  | 'note-muted'
  | 'note-selected'
  | 'note-hover';

/**
 * CSS classes for connections
 */
type ConnectionStyleClass =
  | 'connection-voice-leading'
  | 'connection-embellishment'
  | 'connection-slide';
```

---

## 12. Event Types

```typescript
/**
 * Fretboard interaction events
 */
interface FretboardEvent {
  /** Event type */
  type: 'click' | 'hover' | 'leave';
  /** Position clicked/hovered */
  position: FretPosition;
  /** Note at position (if any) */
  note?: FretboardNote;
  /** Original DOM event */
  originalEvent: MouseEvent | TouchEvent;
}

/**
 * Application events
 */
type AppEvent =
  | { type: 'KEY_CHANGE'; payload: { key: PitchClass; mode: ScaleMode } }
  | { type: 'SELECT_VOICING'; payload: { voicing: TriadVoicing } }
  | { type: 'FILTER_STRING_SET'; payload: { stringSet: StringSet | null } }
  | { type: 'FILTER_INVERSION'; payload: { inversion: Inversion | null } }
  | { type: 'CHANGE_ZONE'; payload: { zone: ZoneNumber } }
  | { type: 'TOGGLE_OVERLAY'; payload: { overlay: keyof ViewSettings; value: boolean } }
  | { type: 'SET_TWO_NOTE_MODE'; payload: { enabled: boolean; mode?: TwoNoteMode } }
  | { type: 'ADD_TO_PROGRESSION'; payload: { chord: DiatonicChord } }
  | { type: 'CLEAR_PROGRESSION' }
  | { type: 'OPTIMIZE_PROGRESSION' }
  | { type: 'PLAY_PROGRESSION' }
  | { type: 'STOP_PROGRESSION' };
```

---

## 13. API/Engine Types

```typescript
/**
 * Music theory engine interface
 */
interface MusicTheoryEngine {
  // Note operations
  getPitchClass(string: StringNumber, fret: FretNumber): PitchClass;
  getNoteName(pitchClass: PitchClass, preferFlats?: boolean): NoteName;
  findAllPositions(pitchClass: PitchClass, fretRange?: [FretNumber, FretNumber]): FretPosition[];
  
  // Triad operations
  buildTriad(root: PitchClass, quality: TriadQuality): Triad;
  getAllVoicings(triad: Triad, fretRange?: [FretNumber, FretNumber]): TriadVoicing[];
  getVoicingsForStringSet(triad: Triad, stringSet: StringSet, fretRange?: [FretNumber, FretNumber]): TriadVoicing[];
  
  // Scale operations
  buildPentatonic(root: PitchClass, mode: PentatonicMode): PentatonicScale;
  getPentatonicBox(scale: PentatonicScale, position: BoxPosition): PentatonicBox;
  getRelativeMinor(majorRoot: PitchClass): PitchClass;
  getRelativeMajor(minorRoot: PitchClass): PitchClass;
  
  // Diatonic operations
  getDiatonicChords(key: PitchClass, mode: ScaleMode): DiatonicChord[];
  
  // Voice leading
  calculateVoiceLeading(from: TriadVoicing, to: TriadVoicing): VoiceLeading;
  optimizeProgression(progression: ChordProgression): VoiceLeadingPath;
  
  // Neighborhood
  getChordNeighborhood(voicing: TriadVoicing, key: PitchClass, maxDistance?: number): ChordNeighborhood;
  
  // Embellishments
  getEmbellishments(voicing: TriadVoicing, pentatonic: PentatonicScale): EmbellishmentSet;
  
  // Zones
  getZoneForFret(fret: FretNumber): ZoneNumber;
  buildZoneData(key: PitchClass, mode: ScaleMode): Zone[];
}

/**
 * Fretboard adapter interface (for existing UI)
 */
interface FretboardAdapter {
  // Display methods
  clearNotes(): void;
  displayNotes(notes: FretboardNote[]): void;
  highlightPositions(positions: FretPosition[], className: string): void;
  showConnections(connections: ConnectionsLayer['data']['connections']): void;
  showZoneIndicator(zone: Zone): void;
  
  // Event methods
  onPositionClick(handler: (event: FretboardEvent) => void): void;
  onPositionHover(handler: (event: FretboardEvent) => void): void;
  
  // Rendering
  render(data: FretboardRenderData): void;
}
```

---

*This document provides the complete type system for the Pentatonic Triad System. All interfaces are designed to be immutable-friendly and compatible with React state management patterns.*
