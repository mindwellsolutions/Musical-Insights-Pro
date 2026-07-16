# System Architecture & Data Models

## Executive Summary

This document defines the complete technical architecture, data structures, and state management required to implement the Pentatonic Triad System. It is designed to integrate with an existing fretboard UI system.

---

## 1. High-Level Architecture

### 1.1 Component Hierarchy
```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Shell                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Control    │  │  Fretboard   │  │    Information       │  │
│  │    Panel     │  │    Engine    │  │      Panels          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                  │                    │               │
│         ▼                  ▼                    ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Key Selector │  │ Layer System │  │ Position Details     │  │
│  │ Chord Prog.  │  │ - Pentatonic │  │ Chord Neighborhood   │  │
│  │ String Set   │  │ - Triads     │  │ Fingering Guide      │  │
│  │ Inversions   │  │ - Extensions │  │ Voice Leading Path   │  │
│  │ Mode Toggle  │  │ - Indicators │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Global State Store                           │
├─────────────────────────────────────────────────────────────────┤
│  selectedKey | selectedChord | stringSet | inversion | mode     │
│  currentZone | progression | playbackPosition | viewSettings    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Music Theory Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  NoteCalculator | TriadBuilder | PentatonicMapper | VoiceLeader │
│  ChordNeighborhood | ZoneManager | EmbellishmentFinder          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Diagram
```
User Action (Select Key: C Major)
        │
        ▼
┌───────────────────┐
│ State Update      │
│ key: 'C'          │
│ mode: 'major'     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Music Engine      │
│ calculates:       │
│ - Relative minor  │
│ - Pentatonic pos. │
│ - Available triads│
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Derived State     │
│ pentatonicNotes[] │
│ triadPositions[]  │
│ voiceLeadPaths[]  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Fretboard Render  │
│ - Layer stack     │
│ - Note colors     │
│ - Indicators      │
└───────────────────┘
```

---

## 2. Core Data Models

### 2.1 Note Model
```typescript
interface Note {
  // Absolute pitch class (0-11, where 0 = C)
  pitchClass: number;
  
  // Display name with enharmonic preference
  name: string;           // e.g., "C#" or "Db"
  
  // Alternative spelling
  enharmonic?: string;    // e.g., "Db" if name is "C#"
}

// Constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
```

### 2.2 Fretboard Position Model
```typescript
interface FretPosition {
  string: number;         // 1-6 (1 = high E, 6 = low E)
  fret: number;           // 0-24 (0 = open)
}

interface FretboardNote extends FretPosition {
  note: Note;
  
  // Visual properties (set by rendering logic)
  isRoot?: boolean;
  isTriadNote?: boolean;
  isPentatonicNote?: boolean;
  isGhostNote?: boolean;
  isEmbellishment?: boolean;
  
  // Interval context
  intervalFromRoot?: string;  // '1', 'b3', '3', '4', '5', 'b7', etc.
  
  // Finger recommendation
  suggestedFinger?: 1 | 2 | 3 | 4;
}
```

### 2.3 Triad Model
```typescript
type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
type Inversion = 'root' | 'first' | 'second';
type StringSet = '123' | '234' | '345' | '456';

interface Triad {
  root: Note;
  quality: TriadQuality;
  
  // The three notes in the triad
  notes: [Note, Note, Note];  // [root, third, fifth]
  
  // Intervals in semitones from root
  intervals: [number, number, number];
}

interface TriadVoicing extends Triad {
  inversion: Inversion;
  stringSet: StringSet;
  
  // Actual fretboard positions
  positions: [FretboardNote, FretboardNote, FretboardNote];
  
  // Voicing metadata
  lowestFret: number;
  highestFret: number;
  centerFret: number;       // For zone calculation
  
  // Fingering
  fingering: [number, number, number];
  
  // Unique identifier for this specific voicing
  voicingId: string;        // e.g., "Cmaj_123_root_5" (C major, strings 123, root pos, fret 5)
}
```

### 2.4 Pentatonic Scale Model
```typescript
type PentatonicType = 'minor' | 'major';
type BoxPosition = 1 | 2 | 3 | 4 | 5;

interface PentatonicScale {
  root: Note;
  type: PentatonicType;
  
  // The five notes in the scale
  notes: [Note, Note, Note, Note, Note];
  
  // Intervals in semitones from root
  intervals: number[];      // Minor: [0, 3, 5, 7, 10], Major: [0, 2, 4, 7, 9]
}

interface PentatonicBox extends PentatonicScale {
  boxPosition: BoxPosition;
  
  // All fretboard positions within this box
  positions: FretboardNote[];
  
  // Fret boundaries
  startFret: number;
  endFret: number;
  
  // Zone this box belongs to
  zone: number;
}
```

### 2.5 Chord Progression Model
```typescript
interface ChordInProgression {
  chord: Triad;
  romanNumeral: string;     // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  durationBeats: number;
  
  // Voice-led voicing (calculated)
  suggestedVoicing?: TriadVoicing;
}

interface Progression {
  key: Note;
  mode: 'major' | 'minor';
  
  chords: ChordInProgression[];
  
  // Time signature
  beatsPerMeasure: number;
  
  // Tempo (for playback)
  bpm?: number;
}
```

### 2.6 Voice Leading Model
```typescript
interface VoiceLeadingPath {
  fromVoicing: TriadVoicing;
  toVoicing: TriadVoicing;
  
  // Movement for each voice (in semitones, negative = down)
  voiceMovement: [number, number, number];
  
  // Total semitone distance (lower = smoother)
  totalDistance: number;
  
  // Number of common tones
  commonTones: number;
  
  // Quality rating
  smoothnessRating: 'excellent' | 'good' | 'acceptable' | 'rough';
}
```

### 2.7 Zone Model
```typescript
interface Zone {
  zoneNumber: number;       // 1-6
  
  // Fret boundaries
  startFret: number;
  endFret: number;
  centerFret: number;
  
  // Reference shapes in this zone
  cagedShape: 'E' | 'D' | 'C' | 'A' | 'G';
  
  // Content for current key
  barChordReference?: FretboardNote[];
  triadVoicings: TriadVoicing[];
  pentatonicBox: PentatonicBox;
  compatibleChords: Triad[];
}
```

### 2.8 Embellishment Model
```typescript
type EmbellishmentType = 'hammer-on' | 'pull-off' | 'slide-up' | 'slide-down' | 'grace-note';

interface Embellishment {
  type: EmbellishmentType;
  
  // Source position (where the embellishment starts)
  from: FretboardNote;
  
  // Target position (where the embellishment ends)
  to: FretboardNote;
  
  // Semitone distance
  interval: number;
  
  // Finger used
  finger: 1 | 2 | 3 | 4;
}

interface EmbellishmentSet {
  triadVoicing: TriadVoicing;
  
  // Available embellishments for this voicing
  embellishments: Embellishment[];
  
  // Notes within pentatonic reach of this voicing
  reachableNotes: FretboardNote[];
}
```

---

## 3. Application State Model

### 3.1 Global State Structure
```typescript
interface AppState {
  // ===== User Selections =====
  selectedKey: Note;
  selectedMode: 'major' | 'minor';
  selectedChord: Triad | null;
  selectedStringSet: StringSet | 'all';
  selectedInversion: Inversion | 'all';
  
  // ===== View Configuration =====
  viewSettings: {
    showPentatonicOverlay: boolean;
    showGhostNotes: boolean;
    showRootMarkers: boolean;
    showBarChordReference: boolean;
    showEmbellishments: boolean;
    showFingerings: boolean;
    twoNoteMode: boolean;           // The "breathing" technique
    twoNoteModeType: 'outside' | 'top';
  };
  
  // ===== Zone Navigation =====
  currentZone: number;              // 1-6
  zoneData: Zone[];
  
  // ===== Progression Mode =====
  progression: Progression | null;
  progressionPosition: number;      // Current chord index
  isProgressionPlaying: boolean;
  
  // ===== Calculated Data (Derived) =====
  derivedState: {
    relativePentatonic: PentatonicScale;
    currentPentatonicBox: PentatonicBox;
    availableTriadVoicings: TriadVoicing[];
    currentVoicing: TriadVoicing | null;
    voiceLeadingOptions: VoiceLeadingPath[];
    compatibleNeighborChords: Triad[];
    embellishmentSet: EmbellishmentSet | null;
  };
  
  // ===== UI State =====
  uiState: {
    hoveredPosition: FretPosition | null;
    selectedPosition: FretPosition | null;
    activeInfoPanel: 'position' | 'voiceleading' | 'neighborhood' | null;
    isLoading: boolean;
  };
}
```

### 3.2 State Selectors (Computed Properties)
```typescript
// Key selectors for UI components

// Get the pentatonic scale for the current key
const selectPentatonicScale = (state: AppState): PentatonicScale => {
  if (state.selectedMode === 'major') {
    // Return relative minor pentatonic
    const relativeMinorRoot = (state.selectedKey.pitchClass - 3 + 12) % 12;
    return buildMinorPentatonic(relativeMinorRoot);
  }
  return buildMinorPentatonic(state.selectedKey.pitchClass);
};

// Get triads filtered by current string set and inversion
const selectFilteredTriads = (state: AppState): TriadVoicing[] => {
  let voicings = state.derivedState.availableTriadVoicings;
  
  if (state.selectedStringSet !== 'all') {
    voicings = voicings.filter(v => v.stringSet === state.selectedStringSet);
  }
  
  if (state.selectedInversion !== 'all') {
    voicings = voicings.filter(v => v.inversion === state.selectedInversion);
  }
  
  return voicings;
};

// Get notes to render on fretboard
const selectFretboardNotes = (state: AppState): FretboardNote[] => {
  // Layer 1: Pentatonic ghost notes (if enabled)
  // Layer 2: Triad notes
  // Layer 3: Embellishment indicators (if enabled)
  // Implementation combines layers with proper z-ordering
};
```

---

## 4. Music Theory Engine API

### 4.1 Note Calculator Module
```typescript
module NoteCalculator {
  // Get note at any fret position
  getNoteAtPosition(position: FretPosition): Note;
  
  // Find all positions of a note on fretboard
  findNotePositions(note: Note, fretRange?: [number, number]): FretPosition[];
  
  // Calculate interval between two notes
  getInterval(from: Note, to: Note): number;
  
  // Get relative minor for a major key
  getRelativeMinor(majorRoot: Note): Note;
  
  // Get relative major for a minor key
  getRelativeMajor(minorRoot: Note): Note;
  
  // Transpose a note by semitones
  transpose(note: Note, semitones: number): Note;
}
```

### 4.2 Triad Builder Module
```typescript
module TriadBuilder {
  // Build a triad from root and quality
  buildTriad(root: Note, quality: TriadQuality): Triad;
  
  // Get all voicings for a triad
  getAllVoicings(
    triad: Triad, 
    options?: {
      stringSet?: StringSet | 'all';
      inversion?: Inversion | 'all';
      fretRange?: [number, number];
    }
  ): TriadVoicing[];
  
  // Get a specific voicing
  getVoicing(
    triad: Triad,
    stringSet: StringSet,
    inversion: Inversion,
    startFret: number
  ): TriadVoicing;
  
  // Apply two-note mode to voicing
  applyTwoNoteMode(
    voicing: TriadVoicing, 
    mode: 'outside' | 'top'
  ): [FretboardNote, FretboardNote];
}
```

### 4.3 Pentatonic Mapper Module
```typescript
module PentatonicMapper {
  // Build pentatonic scale
  buildPentatonic(root: Note, type: PentatonicType): PentatonicScale;
  
  // Get pentatonic box at specific position
  getPentatonicBox(
    scale: PentatonicScale, 
    boxPosition: BoxPosition
  ): PentatonicBox;
  
  // Find which pentatonic box contains a given fret range
  findBoxForFretRange(
    scale: PentatonicScale, 
    startFret: number, 
    endFret: number
  ): PentatonicBox;
  
  // Check if a note is in the pentatonic scale
  isInPentatonic(note: Note, scale: PentatonicScale): boolean;
  
  // Get all pentatonic notes in a fret range
  getPentatonicInRange(
    scale: PentatonicScale, 
    fretRange: [number, number],
    stringSet?: StringSet
  ): FretboardNote[];
}
```

### 4.4 Voice Leader Module
```typescript
module VoiceLeader {
  // Calculate voice leading between two voicings
  calculateVoiceLeading(
    from: TriadVoicing, 
    to: TriadVoicing
  ): VoiceLeadingPath;
  
  // Find optimal voicing for next chord based on current position
  findOptimalNextVoicing(
    currentVoicing: TriadVoicing,
    nextChord: Triad,
    constraints?: {
      stringSet?: StringSet;
      maxFretDistance?: number;
      preferCommonTones?: boolean;
    }
  ): TriadVoicing;
  
  // Get all voice leading options ranked by smoothness
  getAllVoiceLeadingOptions(
    currentVoicing: TriadVoicing,
    nextChord: Triad
  ): VoiceLeadingPath[];
  
  // Calculate optimal voicings for entire progression
  optimizeProgression(
    progression: Progression,
    startingVoicing?: TriadVoicing
  ): TriadVoicing[];
}
```

### 4.5 Chord Neighborhood Module
```typescript
module ChordNeighborhood {
  // Get chords compatible with current key
  getDiatonicChords(key: Note, mode: 'major' | 'minor'): Triad[];
  
  // Get chords within N frets of current position
  getNearbyChords(
    currentVoicing: TriadVoicing,
    maxFretDistance: number
  ): Triad[];
  
  // Get "neighborhood" - all compatible chords in zone
  getChordNeighborhood(zone: Zone, key: Note): {
    primaryChord: Triad;
    relativeChord: Triad;      // Relative major/minor
    neighboringChords: Triad[];
    substitutions: Triad[];    // Chords that can substitute
  };
}
```

### 4.6 Zone Manager Module
```typescript
module ZoneManager {
  // Get zone for a given fret position
  getZoneForFret(fret: number): Zone;
  
  // Build complete zone data for a key
  buildZoneData(key: Note, mode: 'major' | 'minor'): Zone[];
  
  // Navigate between zones
  getNextZone(currentZone: number): Zone;
  getPreviousZone(currentZone: number): Zone;
  
  // Find zone that contains a specific voicing
  findZoneForVoicing(voicing: TriadVoicing): Zone;
}
```

### 4.7 Embellishment Finder Module
```typescript
module EmbellishmentFinder {
  // Get all embellishments for a voicing
  getEmbellishments(
    voicing: TriadVoicing,
    pentatonicScale: PentatonicScale
  ): EmbellishmentSet;
  
  // Get slide approach notes (one fret below each triad note)
  getSlideApproaches(voicing: TriadVoicing): Embellishment[];
  
  // Get pentatonic notes within finger reach of voicing
  getReachableNotes(
    voicing: TriadVoicing,
    pentatonicScale: PentatonicScale,
    maxStretch?: number  // Frets beyond voicing boundary
  ): FretboardNote[];
}
```

---

## 5. Pre-computed Data Tables

### 5.1 Triad Shape Templates
```typescript
// Pre-computed relative shapes for each string set and inversion
// Fret offsets from root position

const TRIAD_SHAPES: Record<TriadQuality, Record<StringSet, Record<Inversion, number[]>>> = {
  major: {
    '123': {
      root:   [0, 0, 1],    // Relative frets: [string1, string2, string3]
      first:  [0, 1, 0],
      second: [1, 0, 0]
    },
    '234': {
      root:   [0, 0, 2],
      first:  [0, 2, 0],
      second: [2, 0, 0]
    },
    // ... continue for all combinations
  },
  minor: {
    // Similar structure with minor intervals
  },
  // ... diminished, augmented
};
```

### 5.2 Pentatonic Box Templates
```typescript
// Pre-computed pentatonic boxes relative to root
// Each box defined by its lowest note position

const PENTATONIC_BOX_TEMPLATES: Record<BoxPosition, {
  fretOffset: number;       // Offset from root fret
  pattern: [number, number][];  // [string, fretOffset] pairs
}> = {
  1: {
    fretOffset: 0,
    pattern: [
      [6, 0], [6, 3],
      [5, 0], [5, 2],
      [4, 0], [4, 2],
      [3, 0], [3, 2],
      [2, 0], [2, 3],
      [1, 0], [1, 3]
    ]
  },
  // ... boxes 2-5
};
```

### 5.3 Diatonic Chord Table
```typescript
// Chords in major key by scale degree
const DIATONIC_CHORDS_MAJOR: { degree: number; quality: TriadQuality; numeral: string }[] = [
  { degree: 0, quality: 'major', numeral: 'I' },
  { degree: 2, quality: 'minor', numeral: 'ii' },
  { degree: 4, quality: 'minor', numeral: 'iii' },
  { degree: 5, quality: 'major', numeral: 'IV' },
  { degree: 7, quality: 'major', numeral: 'V' },
  { degree: 9, quality: 'minor', numeral: 'vi' },
  { degree: 11, quality: 'diminished', numeral: 'vii°' }
];
```

---

## 6. Event System

### 6.1 Application Events
```typescript
type AppEvent = 
  | { type: 'KEY_CHANGED'; payload: { key: Note; mode: 'major' | 'minor' } }
  | { type: 'CHORD_SELECTED'; payload: { chord: Triad } }
  | { type: 'VOICING_SELECTED'; payload: { voicing: TriadVoicing } }
  | { type: 'STRING_SET_CHANGED'; payload: { stringSet: StringSet | 'all' } }
  | { type: 'INVERSION_CHANGED'; payload: { inversion: Inversion | 'all' } }
  | { type: 'ZONE_CHANGED'; payload: { zone: number } }
  | { type: 'VIEW_SETTING_TOGGLED'; payload: { setting: keyof AppState['viewSettings'] } }
  | { type: 'TWO_NOTE_MODE_TOGGLED'; payload: { type: 'outside' | 'top' | 'off' } }
  | { type: 'PROGRESSION_LOADED'; payload: { progression: Progression } }
  | { type: 'PROGRESSION_STEP'; payload: { direction: 'next' | 'previous' } }
  | { type: 'POSITION_HOVERED'; payload: { position: FretPosition | null } }
  | { type: 'POSITION_CLICKED'; payload: { position: FretPosition } };
```

### 6.2 State Update Flow
```typescript
// Reducer pattern for state updates
function appReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'KEY_CHANGED':
      // 1. Update selected key
      // 2. Recalculate relative pentatonic
      // 3. Recalculate all triad voicings
      // 4. Recalculate zone data
      // 5. Reset progression position
      return computeNewState(state, event.payload);
      
    case 'VOICING_SELECTED':
      // 1. Set current voicing
      // 2. Calculate embellishment set
      // 3. Calculate voice leading options for progression
      // 4. Update current zone
      return computeNewState(state, event.payload);
      
    // ... handle all events
  }
}
```

---

## 7. Integration Points

### 7.1 Existing Fretboard UI Integration
```typescript
// Interface your existing fretboard component should expose
interface FretboardUIAdapter {
  // Clear all displayed notes
  clearNotes(): void;
  
  // Display notes with visual properties
  displayNotes(notes: FretboardNote[]): void;
  
  // Highlight specific positions
  highlightPositions(positions: FretPosition[], style: HighlightStyle): void;
  
  // Show connection lines between positions
  showConnections(from: FretPosition, to: FretPosition, style: ConnectionStyle): void;
  
  // Display zone indicator
  showZoneIndicator(zone: Zone): void;
  
  // Register click handler
  onPositionClick(handler: (position: FretPosition) => void): void;
  
  // Register hover handler
  onPositionHover(handler: (position: FretPosition | null) => void): void;
}
```

### 7.2 Required CSS Classes / Styling Hooks
```typescript
// CSS class names the fretboard must support
const STYLE_CLASSES = {
  // Note types
  NOTE_ROOT: 'note-root',
  NOTE_TRIAD: 'note-triad',
  NOTE_PENTATONIC: 'note-pentatonic',
  NOTE_GHOST: 'note-ghost',
  NOTE_EMBELLISHMENT: 'note-embellishment',
  
  // Triad intervals
  NOTE_ROOT_INTERVAL: 'note-interval-root',
  NOTE_THIRD: 'note-interval-third',
  NOTE_FIFTH: 'note-interval-fifth',
  
  // States
  NOTE_HOVERED: 'note-hovered',
  NOTE_SELECTED: 'note-selected',
  NOTE_MUTED: 'note-muted',          // For two-note mode
  
  // Indicators
  INDICATOR_SLIDE: 'indicator-slide',
  INDICATOR_HAMMER: 'indicator-hammer',
  INDICATOR_PULL: 'indicator-pull',
  
  // Zones
  ZONE_ACTIVE: 'zone-active',
  ZONE_ADJACENT: 'zone-adjacent',
  
  // Connections
  CONNECTION_VOICELEAD: 'connection-voicelead',
  CONNECTION_TRIAD: 'connection-triad'
};
```

---

## 8. Performance Considerations

### 8.1 Caching Strategy
```typescript
// Cache frequently computed values
interface ComputationCache {
  // Key -> all triad voicings (computed once per key change)
  triadVoicingsByKey: Map<string, TriadVoicing[]>;
  
  // Key -> pentatonic positions (computed once per key change)
  pentatonicByKey: Map<string, FretboardNote[]>;
  
  // Voicing pair -> voice leading (computed on demand)
  voiceLeadingCache: Map<string, VoiceLeadingPath>;
  
  // Zone data by key (computed once per key change)
  zoneDataByKey: Map<string, Zone[]>;
}

// Cache invalidation triggers
const CACHE_INVALIDATORS = {
  KEY_CHANGED: ['triadVoicingsByKey', 'pentatonicByKey', 'zoneDataByKey'],
  // Voice leading cache grows dynamically, trim if > 1000 entries
};
```

### 8.2 Rendering Optimization
```typescript
// Only re-render layers that changed
interface RenderLayers {
  pentatonicLayer: FretboardNote[];    // Rarely changes
  triadLayer: FretboardNote[];          // Changes on chord/voicing select
  embellishmentLayer: FretboardNote[];  // Changes on voicing select
  indicatorLayer: Indicator[];          // Changes frequently
}

// Diff-based update
function updateFretboard(prev: RenderLayers, next: RenderLayers) {
  if (prev.pentatonicLayer !== next.pentatonicLayer) {
    renderPentatonicLayer(next.pentatonicLayer);
  }
  // ... similar for other layers
}
```

---

*This architecture document provides the complete technical foundation for implementing the Pentatonic Triad System.*
