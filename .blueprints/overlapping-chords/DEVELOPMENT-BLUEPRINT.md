# Overlapping Chords Feature - Complete Development Blueprint

## Table of Contents
1. [Overview](#overview)
2. [Feature Requirements](#feature-requirements)
3. [Technical Architecture](#technical-architecture)
4. [Data Structures & Types](#data-structures--types)
5. [Core Algorithms](#core-algorithms)
6. [State Management](#state-management)
7. [UI/UX Components](#uiux-components)
8. [Fretboard Integration](#fretboard-integration)
9. [Implementation Phases](#implementation-phases)
10. [Testing Requirements](#testing-requirements)

---

## Overview

The **Overlapping Chords** feature enables users to discover all playable chords within:
- **CAGED shape areas** (one or multiple selected shapes at specific fret positions)
- **Scale positions** (notes from a selected scale/mode at specific fretboard positions)

This helps musicians find chords that fit within their current playing position or scale context, enhancing improvisation and composition workflows.

### Key Capabilities
- Toggle on/off to show/hide the feature
- Two modes: **CAGED Areas** and **Scale Notes**
- Filter chords by overlap type: **Complete** (all chord notes match) or **Partial** (2+ notes match)
- Multi-select chords to display simultaneously on the fretboard
- Color-coded chord notes with shared note indicators
- Saves/restores fretboard state when toggling feature

---

## Feature Requirements

### Functional Requirements

#### FR-1: Toggle Control
- **Location**: Display below the single fretboard (when Triads & CAGED is OFF)
- **UI**: Card with toggle switch labeled "Overlapping Chords"
- **Behavior**: 
  - When enabled: Save current fretboard state to localStorage
  - When disabled: Restore saved fretboard state
  - Toggle state persists across sessions

#### FR-2: Mode Selection
- **Options**: "CAGED Areas" | "Scale Notes"
- **UI**: Toggle group (similar to Sharp/Flat notation toggle)
- **Behavior**: Switching modes clears selected chords and recalculates available chords

#### FR-3: CAGED Mode Controls
- **Shape Selection**: Multi-select checkboxes for C, A, G, E, D shapes
- **Position Input**: For each selected shape, show fret position selector (0-12)
- **Overlap Type**: Radio buttons for "Complete Overlap" | "Partial Overlap (2+ notes)"
- **Display**: Show all chords where notes fall within selected CAGED shape boundaries

#### FR-4: Scale Mode Controls
- **Scale Selection**: Dropdown populated from current Key & Scales section
- **Position Selection**: Multi-select checkboxes for scale positions (typically 5 positions)
- **Overlap Type**: Radio buttons for "Complete Overlap" | "Partial Overlap (2+ notes)"
- **Display**: Show all chords where notes overlap with scale notes at selected positions

#### FR-5: Chord Display Section
- **Layout**: Scrollable card list below the mode controls
- **Left Sidebar Tabs**: Filter chords by category
  - All Chords
  - Major
  - Minor
  - Diminished
  - Augmented
  - 7th Chords (if extended chords included)
- **Card Design**: Each chord card shows:
  - Chord symbol (e.g., "Cmaj", "Am", "G7")
  - Chord quality indicator
  - Number of overlapping notes badge
  - Fret position range indicator
  - Visual preview (optional mini-fretboard)

#### FR-6: Chord Interaction
- **Hover**: Temporarily override 1st fretboard to show hovered chord + CAGED/scale notes
- **Click**: Select/deselect chord for persistent display
- **Multi-select**: Allow selecting multiple chords simultaneously
- **Color Coding**: 
  - Each selected chord gets unique color for its notes
  - Shared notes between chords show circle border (existing pattern)
  - Use distinct colors from predefined palette

#### FR-7: Fretboard Display
- **1st Fretboard**: Shows selected chords overlaid on CAGED areas or scale notes
- **Note Rendering**: 
  - Chord notes colored by chord assignment
  - CAGED area notes or scale notes shown in background (dimmed)
  - Shared notes have circle border
- **State Management**: Fretboard updates reactively when chords selected/deselected

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Application                         │
│  (page.tsx or main fretboard component)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ Fretboard Component (existing)
                     │
                     └─ OverlappingChordsContainer
                        │
                        ├─ OverlappingChordsToggle
                        │
                        ├─ ModeSelector (CAGED | Scale)
                        │
                        ├─ CagedModeControls
                        │  ├─ ShapeSelector (multi-checkbox)
                        │  ├─ PositionInputs (per shape)
                        │  └─ OverlapTypeSelector (radio)
                        │
                        ├─ ScaleModeControls
                        │  ├─ ScaleDropdown
                        │  ├─ PositionSelector (multi-checkbox)
                        │  └─ OverlapTypeSelector (radio)
                        │
                        └─ ChordDisplaySection
                           ├─ ChordCategoryTabs (left sidebar)
                           └─ ChordList (scrollable)
                              └─ ChordCard (individual chord)
```

### Data Flow

```
User Interaction
      ↓
State Update (useOverlappingChords hook)
      ↓
Chord Calculation (findChordsInCagedArea | findChordsInScale)
      ↓
Filter by Category (ChordCategoryTabs)
      ↓
Render Chord Cards (ChordList)
      ↓
User Selects Chord
      ↓
Update Fretboard Display (onFretboardDataChange callback)
```

---

## Data Structures & Types

### Core Types

```typescript
// File: lib/music-theory/overlapping-chords/types.ts

export type CAGEDShape = 'C' | 'A' | 'G' | 'E' | 'D';

export type OverlapType = 'complete' | 'partial';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7';

export interface FretNote {
  string: number;  // 0-based string index
  fret: number;    // 0-based fret number
  note: string;    // Note name (e.g., 'C', 'D#')
}

export interface FretBoundary {
  minFret: number;
  maxFret: number;
  minString: number;
  maxString: number;
}

export interface ChordVoicing {
  rootNote: string;
  quality: ChordQuality;
  notes: FretNote[];  // All notes in the voicing
  fretRange: [number, number];  // [min, max] fret positions
  stringRange: [number, number];  // [min, max] string positions
}

export interface OverlappingChord extends ChordVoicing {
  overlapCount: number;  // Number of notes overlapping with target
  overlapPercentage: number;  // Percentage of chord notes overlapping
  chordSymbol: string;  // Display name (e.g., "Cmaj", "Am7")
  isSelected: boolean;  // User selection state
  color?: string;  // Assigned color for display
}

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

export interface FretboardState {
  // Minimal data to restore fretboard display
  displayedNotes: FretNote[];
  highlightedAreas?: any;  // CAGED areas or scale positions
  // Add other necessary fretboard state properties
}

export interface ChordColorAssignment {
  chordId: string;  // Unique identifier for chord
  color: string;    // Hex color code
}
```

---

## Core Algorithms

### Algorithm 1: Find Chords in CAGED Area

**Function**: `findChordsInCagedArea()`

**Location**: `lib/music-theory/overlapping-chords/chord-finder.ts`

**Signature**:
```typescript
function findChordsInCagedArea(
  shapes: CAGEDShape[],
  positions: Record<CAGEDShape, number>,
  overlapType: OverlapType,
  stringCount: number = 6
): OverlappingChord[]
```

**Algorithm**:
1. **Get CAGED Boundaries**: For each selected shape and position, calculate fret boundaries
   - Use existing CAGED shape data from `lib/triad-theory.ts` or similar
   - Each shape has defined fret pattern relative to root position
   - Calculate min/max fret and string ranges

2. **Generate Chord Voicings**: Create all possible chord voicings within fret range
   - Use existing voicing generator from `lib/music-theory/neighborhood/voicing-generator.ts`
   - Generate triads: major, minor, diminished, augmented
   - Optionally generate 7th chords: dom7, maj7, min7
   - Limit to reasonable fret range (e.g., 0-15)

3. **Check Overlap**: For each voicing, count notes within CAGED boundaries
   ```typescript
   for (const voicing of allVoicings) {
     let overlapCount = 0;
     for (const note of voicing.notes) {
       if (isNoteInCagedArea(note, cagedBoundaries)) {
         overlapCount++;
       }
     }
     // Calculate overlap percentage
     const overlapPercentage = (overlapCount / voicing.notes.length) * 100;
   }
   ```

4. **Filter by Overlap Type**:
   - **Complete**: `overlapPercentage === 100` (all notes in CAGED area)
   - **Partial**: `overlapCount >= 2` (at least 2 notes in CAGED area)

5. **Sort and Return**: Sort by overlap count (descending), then by fret position
   ```typescript
   return filteredChords.sort((a, b) => {
     if (b.overlapCount !== a.overlapCount) {
       return b.overlapCount - a.overlapCount;
     }
     return a.fretRange[0] - b.fretRange[0];
   });
   ```

**Helper Functions**:
```typescript
function getCagedFretBoundaries(
  shape: CAGEDShape,
  position: number
): FretBoundary {
  // Return min/max fret and string boundaries for the shape
  // Use existing CAGED shape definitions
}

function isNoteInCagedArea(
  note: FretNote,
  boundaries: FretBoundary[]
): boolean {
  // Check if note falls within any CAGED boundary
  return boundaries.some(boundary =>
    note.fret >= boundary.minFret &&
    note.fret <= boundary.maxFret &&
    note.string >= boundary.minString &&
    note.string <= boundary.maxString
  );
}
```

---

### Algorithm 2: Find Chords in Scale

**Function**: `findChordsInScale()`

**Location**: `lib/music-theory/overlapping-chords/chord-finder.ts`

**Signature**:
```typescript
function findChordsInScale(
  key: string,
  mode: string,
  positions: number[],
  overlapType: OverlapType,
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): OverlappingChord[]
```

**Algorithm**:
1. **Get Scale Notes**: Generate scale notes for the key/mode
   - Use existing scale generation from `lib/musicTheory.ts` or similar
   - Get all 7 notes in the scale (e.g., C major: C, D, E, F, G, A, B)

2. **Get Scale Positions on Fretboard**: For each selected position, find scale notes
   ```typescript
   const scaleNotesOnFretboard: FretNote[] = [];
   for (const position of positions) {
     // Get scale pattern for this position (e.g., 3-note-per-string pattern)
     const patternNotes = getScalePatternAtPosition(key, mode, position, tuning);
     scaleNotesOnFretboard.push(...patternNotes);
   }
   ```

3. **Generate Chord Voicings**: Same as CAGED mode
   - Generate all possible chord voicings within reasonable fret range

4. **Check Overlap**: For each voicing, count notes that are in the scale
   ```typescript
   for (const voicing of allVoicings) {
     let overlapCount = 0;
     for (const note of voicing.notes) {
       if (isNoteInScale(note.note, scaleNotes)) {
         overlapCount++;
       }
     }
     const overlapPercentage = (overlapCount / voicing.notes.length) * 100;
   }
   ```

5. **Filter by Overlap Type**:
   - **Complete**: All chord notes are in the scale (diatonic chords)
   - **Partial**: At least 2 chord notes are in the scale

6. **Sort and Return**: Sort by overlap count, then by fret position

**Helper Functions**:
```typescript
function getScalePatternAtPosition(
  key: string,
  mode: string,
  position: number,
  tuning: string[]
): FretNote[] {
  // Get all scale notes at this position using standard scale patterns
  // Typically covers 4-5 frets per position
}

function isNoteInScale(
  note: string,
  scaleNotes: string[]
): boolean {
  // Check if note is in scale, accounting for enharmonic equivalents
  // E.g., C# === Db
  return scaleNotes.some(scaleNote =>
    areEnharmonicEquivalents(note, scaleNote)
  );
}

function areEnharmonicEquivalents(
  note1: string,
  note2: string
): boolean {
  // Map notes to chromatic index and compare
  const chromaticMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  return chromaticMap[note1] === chromaticMap[note2];
}
```

---

### Algorithm 3: Chord Symbol Generation

**Function**: `getChordSymbol()`

**Location**: `lib/music-theory/overlapping-chords/chord-finder.ts`

**Signature**:
```typescript
function getChordSymbol(
  rootNote: string,
  quality: ChordQuality
): string
```

**Algorithm**:
```typescript
const qualitySymbols: Record<ChordQuality, string> = {
  'major': '',
  'minor': 'm',
  'diminished': 'dim',
  'augmented': 'aug',
  'dominant7': '7',
  'major7': 'maj7',
  'minor7': 'm7'
};

return `${rootNote}${qualitySymbols[quality]}`;
// Examples: "C", "Am", "Gdim", "D7", "Fmaj7"
```

---

### Algorithm 4: Color Assignment

**Function**: `assignChordColors()`

**Location**: `lib/music-theory/overlapping-chords/color-manager.ts`

**Purpose**: Assign distinct colors to selected chords for fretboard display

**Signature**:
```typescript
function assignChordColors(
  selectedChords: OverlappingChord[]
): ChordColorAssignment[]
```

**Algorithm**:
```typescript
const colorPalette = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

return selectedChords.map((chord, index) => ({
  chordId: `${chord.rootNote}-${chord.quality}`,
  color: colorPalette[index % colorPalette.length]
}));
```

---

## State Management

### Custom Hook: `useOverlappingChords`

**Location**: `hooks/use-overlapping-chords.ts`

**Purpose**: Manage all state for the Overlapping Chords feature

**Implementation**:

```typescript
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OverlappingChordsState, OverlappingChord, CAGEDShape, OverlapType } from '@/lib/music-theory/overlapping-chords/types';
import { findChordsInCagedArea, findChordsInScale } from '@/lib/music-theory/overlapping-chords/chord-finder';
import { assignChordColors } from '@/lib/music-theory/overlapping-chords/color-manager';

const INITIAL_STATE: OverlappingChordsState = {
  enabled: false,
  mode: 'caged',
  overlapType: 'complete',
  selectedCagedShapes: [],
  cagedPositions: { C: 0, A: 0, G: 0, E: 0, D: 0 },
  selectedScale: null,
  selectedScalePositions: [],
  selectedChords: [],
  savedFretboardState: null,
};

export function useOverlappingChords(
  currentKey: string,
  currentScale: string,
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
) {
  const [state, setState] = useLocalStorage<OverlappingChordsState>(
    'overlapping-chords-state',
    INITIAL_STATE
  );

  // Calculate available chords based on current mode and selections
  const availableChords = useMemo(() => {
    if (!state.enabled) return [];

    if (state.mode === 'caged') {
      if (state.selectedCagedShapes.length === 0) return [];
      return findChordsInCagedArea(
        state.selectedCagedShapes,
        state.cagedPositions,
        state.overlapType,
        stringCount
      );
    } else {
      // Scale mode
      if (!state.selectedScale || state.selectedScalePositions.length === 0) return [];
      return findChordsInScale(
        state.selectedScale.key,
        state.selectedScale.mode,
        state.selectedScalePositions,
        state.overlapType,
        stringCount,
        tuning
      );
    }
  }, [
    state.enabled,
    state.mode,
    state.selectedCagedShapes,
    state.cagedPositions,
    state.selectedScale,
    state.selectedScalePositions,
    state.overlapType,
    stringCount,
    tuning,
  ]);

  // Actions
  const toggleEnabled = useCallback((fretboardState?: any) => {
    setState(prev => ({
      ...prev,
      enabled: !prev.enabled,
      savedFretboardState: !prev.enabled ? fretboardState : null,
      selectedChords: !prev.enabled ? [] : prev.selectedChords,
    }));
  }, [setState]);

  const setMode = useCallback((mode: 'caged' | 'scale') => {
    setState(prev => ({
      ...prev,
      mode,
      selectedChords: [], // Clear selections when switching modes
    }));
  }, [setState]);

  const setOverlapType = useCallback((overlapType: OverlapType) => {
    setState(prev => ({ ...prev, overlapType }));
  }, [setState]);

  const toggleCagedShape = useCallback((shape: CAGEDShape) => {
    setState(prev => ({
      ...prev,
      selectedCagedShapes: prev.selectedCagedShapes.includes(shape)
        ? prev.selectedCagedShapes.filter(s => s !== shape)
        : [...prev.selectedCagedShapes, shape],
    }));
  }, [setState]);

  const setCagedPosition = useCallback((shape: CAGEDShape, position: number) => {
    setState(prev => ({
      ...prev,
      cagedPositions: { ...prev.cagedPositions, [shape]: position },
    }));
  }, [setState]);

  const setScale = useCallback((key: string, mode: string) => {
    setState(prev => ({
      ...prev,
      selectedScale: { key, mode },
    }));
  }, [setState]);

  const toggleScalePosition = useCallback((position: number) => {
    setState(prev => ({
      ...prev,
      selectedScalePositions: prev.selectedScalePositions.includes(position)
        ? prev.selectedScalePositions.filter(p => p !== position)
        : [...prev.selectedScalePositions, position],
    }));
  }, [setState]);

  const toggleChordSelection = useCallback((chord: OverlappingChord) => {
    setState(prev => {
      const isSelected = prev.selectedChords.some(
        c => c.rootNote === chord.rootNote && c.quality === chord.quality
      );

      let newSelectedChords: OverlappingChord[];
      if (isSelected) {
        newSelectedChords = prev.selectedChords.filter(
          c => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
        );
      } else {
        newSelectedChords = [...prev.selectedChords, { ...chord, isSelected: true }];
      }

      // Assign colors to selected chords
      const colorAssignments = assignChordColors(newSelectedChords);
      newSelectedChords = newSelectedChords.map((c, i) => ({
        ...c,
        color: colorAssignments[i].color,
      }));

      return { ...prev, selectedChords: newSelectedChords };
    });
  }, [setState]);

  const clearAllSelections = useCallback(() => {
    setState(prev => ({ ...prev, selectedChords: [] }));
  }, [setState]);

  return {
    state,
    availableChords,
    actions: {
      toggleEnabled,
      setMode,
      setOverlapType,
      toggleCagedShape,
      setCagedPosition,
      setScale,
      toggleScalePosition,
      toggleChordSelection,
      clearAllSelections,
    },
  };
}
```

### LocalStorage Keys

- **`overlapping-chords-state`**: Main feature state (persisted)
- **`overlapping-chords-saved-fretboard`**: Saved fretboard state for restoration

---

## UI/UX Components

### Component Hierarchy

```
OverlappingChordsContainer (main container)
├── OverlappingChordsToggle (enable/disable feature)
├── ModeSelector (CAGED vs Scale)
├── CagedModeControls (shown when mode === 'caged')
│   ├── ShapeSelector (multi-checkbox for C, A, G, E, D)
│   ├── PositionInputs (number input for each selected shape)
│   └── OverlapTypeSelector (radio buttons)
├── ScaleModeControls (shown when mode === 'scale')
│   ├── ScaleDropdown (select from current key/scales)
│   ├── PositionSelector (multi-checkbox for positions 1-5)
│   └── OverlapTypeSelector (radio buttons)
└── ChordDisplaySection (shown when enabled)
    ├── ChordCategoryTabs (left sidebar: All, Major, Minor, etc.)
    └── ChordList (scrollable)
        └── ChordCard[] (individual chord cards)
```

---

### Component 1: OverlappingChordsContainer

**Location**: `components/overlapping-chords/OverlappingChordsContainer.tsx`

**Purpose**: Main container that orchestrates all sub-components

**Props**:
```typescript
interface OverlappingChordsContainerProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  stringCount: number;
  tuning: string[];
  onFretboardDataChange: (data: any) => void;  // Callback to update fretboard
}
```

**Structure**:
```tsx
'use client';

import { useOverlappingChords } from '@/hooks/use-overlapping-chords';
import OverlappingChordsToggle from './OverlappingChordsToggle';
import ModeSelector from './ModeSelector';
import CagedModeControls from './CagedModeControls';
import ScaleModeControls from './ScaleModeControls';
import ChordDisplaySection from './ChordDisplaySection';

export default function OverlappingChordsContainer({
  theme,
  currentKey,
  currentScale,
  stringCount,
  tuning,
  onFretboardDataChange,
}: OverlappingChordsContainerProps) {
  const { state, availableChords, actions } = useOverlappingChords(
    currentKey,
    currentScale,
    stringCount,
    tuning
  );

  // Update fretboard when selected chords change
  useEffect(() => {
    if (state.enabled && state.selectedChords.length > 0) {
      onFretboardDataChange({
        type: 'overlapping-chords',
        chords: state.selectedChords,
        mode: state.mode,
        cagedShapes: state.selectedCagedShapes,
        scalePositions: state.selectedScalePositions,
      });
    } else if (!state.enabled && state.savedFretboardState) {
      // Restore saved fretboard state
      onFretboardDataChange(state.savedFretboardState);
    }
  }, [state.enabled, state.selectedChords, state.mode]);

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Toggle */}
      <OverlappingChordsToggle
        theme={theme}
        enabled={state.enabled}
        onToggle={actions.toggleEnabled}
      />

      {/* Show controls only when enabled */}
      {state.enabled && (
        <>
          {/* Mode Selector */}
          <ModeSelector
            theme={theme}
            mode={state.mode}
            onModeChange={actions.setMode}
          />

          {/* CAGED Mode Controls */}
          {state.mode === 'caged' && (
            <CagedModeControls
              theme={theme}
              selectedShapes={state.selectedCagedShapes}
              positions={state.cagedPositions}
              overlapType={state.overlapType}
              onToggleShape={actions.toggleCagedShape}
              onSetPosition={actions.setCagedPosition}
              onSetOverlapType={actions.setOverlapType}
            />
          )}

          {/* Scale Mode Controls */}
          {state.mode === 'scale' && (
            <ScaleModeControls
              theme={theme}
              currentKey={currentKey}
              currentScale={currentScale}
              selectedScale={state.selectedScale}
              selectedPositions={state.selectedScalePositions}
              overlapType={state.overlapType}
              onSetScale={actions.setScale}
              onTogglePosition={actions.toggleScalePosition}
              onSetOverlapType={actions.setOverlapType}
            />
          )}

          {/* Chord Display Section */}
          <ChordDisplaySection
            theme={theme}
            availableChords={availableChords}
            selectedChords={state.selectedChords}
            onToggleChord={actions.toggleChordSelection}
            onClearAll={actions.clearAllSelections}
          />
        </>
      )}
    </div>
  );
}
```

**Styling**:
- Use theme colors for consistency
- Card-based layout similar to existing components (CAGEDShapesCard, TriadTab)
- Responsive design with proper spacing

---

### Component 2: OverlappingChordsToggle

**Location**: `components/overlapping-chords/OverlappingChordsToggle.tsx`

**Purpose**: Toggle switch to enable/disable the feature

**Props**:
```typescript
interface OverlappingChordsToggleProps {
  theme: ThemeConfig;
  enabled: boolean;
  onToggle: (fretboardState?: any) => void;
}
```

**Structure**:
```tsx
'use client';

export default function OverlappingChordsToggle({
  theme,
  enabled,
  onToggle,
}: OverlappingChordsToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3
        className="text-lg font-semibold"
        style={{ color: theme.textPrimary }}
      >
        Overlapping Chords
      </h3>

      {/* Toggle Switch (similar to Triads & CAGED toggle) */}
      <button
        onClick={() => onToggle()}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
        style={{
          backgroundColor: enabled ? theme.accentPrimary : '#4b5563',
          border: `2px solid ${enabled ? theme.accentPrimary : '#6b7280'}`,
        }}
        aria-label="Toggle Overlapping Chords"
      >
        <span
          className="inline-block h-5 w-5 transform rounded-full transition-transform duration-200 ease-in-out shadow-md"
          style={{
            backgroundColor: '#ffffff',
            transform: enabled ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}
```

**Behavior**:
- When toggled ON: Save current fretboard state to localStorage
- When toggled OFF: Restore saved fretboard state
- Visual feedback with color change and smooth animation

---

### Component 3: ModeSelector

**Location**: `components/overlapping-chords/ModeSelector.tsx`

**Purpose**: Toggle between CAGED and Scale modes

**Props**:
```typescript
interface ModeSelectorProps {
  theme: ThemeConfig;
  mode: 'caged' | 'scale';
  onModeChange: (mode: 'caged' | 'scale') => void;
}
```

**Structure**:
```tsx
'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function ModeSelector({
  theme,
  mode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: theme.textSecondary }}
      >
        Find Chords In
      </label>

      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => {
          if (value) onModeChange(value as 'caged' | 'scale');
        }}
        className="justify-start"
      >
        <ToggleGroupItem
          value="caged"
          aria-label="CAGED Areas"
          style={{
            background: mode === 'caged' ? theme.buttonPrimary : theme.bgTertiary,
            color: mode === 'caged' ? '#ffffff' : theme.textPrimary,
          }}
        >
          CAGED Areas
        </ToggleGroupItem>
        <ToggleGroupItem
          value="scale"
          aria-label="Scale Notes"
          style={{
            background: mode === 'scale' ? theme.buttonPrimary : theme.bgTertiary,
            color: mode === 'scale' ? '#ffffff' : theme.textPrimary,
          }}
        >
          Scale Notes
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
```

**Behavior**:
- Single selection (radio button behavior)
- Clear selected chords when mode changes
- Visual feedback for active mode

---

### Component 4: CagedModeControls

**Location**: `components/overlapping-chords/CagedModeControls.tsx`

**Purpose**: Controls for CAGED mode (shape selection, positions, overlap type)

**Props**:
```typescript
interface CagedModeControlsProps {
  theme: ThemeConfig;
  selectedShapes: CAGEDShape[];
  positions: Record<CAGEDShape, number>;
  overlapType: OverlapType;
  onToggleShape: (shape: CAGEDShape) => void;
  onSetPosition: (shape: CAGEDShape, position: number) => void;
  onSetOverlapType: (type: OverlapType) => void;
}
```

**Structure**:
```tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const CAGED_SHAPES: CAGEDShape[] = ['C', 'A', 'G', 'E', 'D'];

export default function CagedModeControls({
  theme,
  selectedShapes,
  positions,
  overlapType,
  onToggleShape,
  onSetPosition,
  onSetOverlapType,
}: CagedModeControlsProps) {
  return (
    <div className="space-y-4">
      {/* Shape Selection */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          CAGED Shapes
        </label>
        <div className="flex flex-wrap gap-3">
          {CAGED_SHAPES.map((shape) => (
            <div key={shape} className="flex items-center space-x-2">
              <Checkbox
                id={`shape-${shape}`}
                checked={selectedShapes.includes(shape)}
                onCheckedChange={() => onToggleShape(shape)}
              />
              <Label
                htmlFor={`shape-${shape}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: theme.textPrimary }}
              >
                {shape}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Position Inputs for Selected Shapes */}
      {selectedShapes.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.textSecondary }}
          >
            Fret Positions
          </label>
          <div className="grid grid-cols-2 gap-3">
            {selectedShapes.map((shape) => (
              <div key={shape} className="flex items-center gap-2">
                <span
                  className="text-sm font-medium w-8"
                  style={{ color: theme.textPrimary }}
                >
                  {shape}:
                </span>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={positions[shape]}
                  onChange={(e) => onSetPosition(shape, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 rounded text-sm"
                  style={{
                    background: theme.bgTertiary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlap Type */}
      <OverlapTypeSelector
        theme={theme}
        overlapType={overlapType}
        onSetOverlapType={onSetOverlapType}
      />
    </div>
  );
}
```

**Behavior**:
- Multi-select checkboxes for CAGED shapes
- Show position input only for selected shapes
- Validate position input (0-12 range)
- Update available chords reactively

---

### Component 5: ScaleModeControls

**Location**: `components/overlapping-chords/ScaleModeControls.tsx`

**Purpose**: Controls for Scale mode (scale selection, positions, overlap type)

**Props**:
```typescript
interface ScaleModeControlsProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  selectedScale: { key: string; mode: string } | null;
  selectedPositions: number[];
  overlapType: OverlapType;
  onSetScale: (key: string, mode: string) => void;
  onTogglePosition: (position: number) => void;
  onSetOverlapType: (type: OverlapType) => void;
}
```

**Structure**:
```tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getDisplayScaleNames } from '@/lib/musicalCompatibility';

const SCALE_POSITIONS = [0, 2, 4, 7, 9]; // Typical 5 positions for most scales

export default function ScaleModeControls({
  theme,
  currentKey,
  currentScale,
  selectedScale,
  selectedPositions,
  overlapType,
  onSetScale,
  onTogglePosition,
  onSetOverlapType,
}: ScaleModeControlsProps) {
  // Auto-select current scale if none selected
  useEffect(() => {
    if (!selectedScale && currentKey && currentScale) {
      onSetScale(currentKey, currentScale);
    }
  }, [currentKey, currentScale, selectedScale, onSetScale]);

  return (
    <div className="space-y-4">
      {/* Scale Display (read-only, uses current key/scale) */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          Scale
        </label>
        <div
          className="px-3 py-2 rounded text-sm font-medium"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {selectedScale ? `${selectedScale.key} ${selectedScale.mode}` : 'No scale selected'}
        </div>
      </div>

      {/* Position Selection */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          Scale Positions
        </label>
        <div className="flex flex-wrap gap-3">
          {SCALE_POSITIONS.map((position, index) => (
            <div key={position} className="flex items-center space-x-2">
              <Checkbox
                id={`position-${position}`}
                checked={selectedPositions.includes(position)}
                onCheckedChange={() => onTogglePosition(position)}
              />
              <Label
                htmlFor={`position-${position}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: theme.textPrimary }}
              >
                Position {index + 1} (Fret {position})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Overlap Type */}
      <OverlapTypeSelector
        theme={theme}
        overlapType={overlapType}
        onSetOverlapType={onSetOverlapType}
      />
    </div>
  );
}
```

**Behavior**:
- Auto-populate with current key/scale from app state
- Multi-select checkboxes for scale positions
- Update available chords reactively

---

### Component 6: OverlapTypeSelector

**Location**: `components/overlapping-chords/OverlapTypeSelector.tsx`

**Purpose**: Radio buttons to select overlap type (Complete vs Partial)

**Props**:
```typescript
interface OverlapTypeSelectorProps {
  theme: ThemeConfig;
  overlapType: OverlapType;
  onSetOverlapType: (type: OverlapType) => void;
}
```

**Structure**:
```tsx
'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function OverlapTypeSelector({
  theme,
  overlapType,
  onSetOverlapType,
}: OverlapTypeSelectorProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: theme.textSecondary }}
      >
        Overlap Type
      </label>
      <RadioGroup
        value={overlapType}
        onValueChange={(value) => onSetOverlapType(value as OverlapType)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="complete" id="complete" />
          <Label
            htmlFor="complete"
            className="text-sm cursor-pointer"
            style={{ color: theme.textPrimary }}
          >
            Complete Overlap (all notes match)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="partial" id="partial" />
          <Label
            htmlFor="partial"
            className="text-sm cursor-pointer"
            style={{ color: theme.textPrimary }}
          >
            Partial Overlap (2+ notes match)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
```

**Behavior**:
- Single selection (radio button)
- Update available chords when changed

---

## Fretboard Integration

### Fretboard Display Logic

**Location**: Main fretboard component (e.g., `components/Fretboard.tsx` or `app/page.tsx`)

**Requirements**:
1. **Accept Overlapping Chords Data**: Receive selected chords from `OverlappingChordsContainer`
2. **Render Chord Notes**: Display notes from selected chords with assigned colors
3. **Render Background**: Show CAGED areas or scale notes (dimmed) as context
4. **Handle Shared Notes**: Use circle border for notes shared between multiple chords
5. **Save/Restore State**: Implement fretboard state save/restore for toggle functionality

**Data Structure for Fretboard**:
```typescript
interface FretboardDisplayData {
  type: 'overlapping-chords' | 'normal';
  chords?: OverlappingChord[];  // Selected chords to display
  mode?: 'caged' | 'scale';
  cagedShapes?: CAGEDShape[];  // For background display
  scalePositions?: number[];   // For background display
}
```

**Rendering Logic**:
```typescript
function renderFretboardNotes(data: FretboardDisplayData) {
  if (data.type === 'overlapping-chords' && data.chords) {
    // 1. Render background (CAGED areas or scale notes) - dimmed
    if (data.mode === 'caged') {
      renderCagedAreas(data.cagedShapes, { opacity: 0.3 });
    } else {
      renderScaleNotes(data.scalePositions, { opacity: 0.3 });
    }

    // 2. Collect all chord notes with colors
    const noteMap = new Map<string, { colors: string[], note: FretNote }>();
    for (const chord of data.chords) {
      for (const note of chord.notes) {
        const key = `${note.string}-${note.fret}`;
        if (!noteMap.has(key)) {
          noteMap.set(key, { colors: [], note });
        }
        noteMap.get(key)!.colors.push(chord.color!);
      }
    }

    // 3. Render notes
    for (const [key, { colors, note }] of noteMap) {
      const isShared = colors.length > 1;
      renderNote(note, {
        fillColor: colors[0],  // Use first chord's color
        borderStyle: isShared ? 'circle' : 'none',  // Circle border for shared notes
        borderColor: isShared ? '#ffffff' : undefined,
      });
    }
  } else {
    // Normal fretboard rendering
    renderNormalFretboard();
  }
}
```

**State Save/Restore**:
```typescript
function saveFretboardState(): FretboardState {
  return {
    displayedNotes: getCurrentDisplayedNotes(),
    highlightedAreas: getCurrentHighlightedAreas(),
    // Add other necessary state
  };
}

function restoreFretboardState(state: FretboardState) {
  setDisplayedNotes(state.displayedNotes);
  setHighlightedAreas(state.highlightedAreas);
  // Restore other state
}
```

---

## Implementation Phases

### Phase 1: Core Library & Types (Week 1)

**Files to Create**:
1. `lib/music-theory/overlapping-chords/types.ts`
   - Define all TypeScript interfaces
   - Export types for use across components

2. `lib/music-theory/overlapping-chords/caged-analyzer.ts`
   - `getCagedFretBoundaries()`
   - `isNoteInCagedArea()`
   - `getCagedAreaNotes()`

3. `lib/music-theory/overlapping-chords/scale-analyzer.ts`
   - `getScalePatternAtPosition()`
   - `isNoteInScale()`
   - `areEnharmonicEquivalents()`

4. `lib/music-theory/overlapping-chords/chord-finder.ts`
   - `findChordsInCagedArea()`
   - `findChordsInScale()`
   - `getChordSymbol()`

5. `lib/music-theory/overlapping-chords/color-manager.ts`
   - `assignChordColors()`

**Testing**:
- Unit tests for each algorithm
- Test with various CAGED shapes and positions
- Test with different scales and modes
- Verify enharmonic equivalence handling

---

### Phase 2: State Management (Week 2)

**Files to Create**:
1. `hooks/use-overlapping-chords.ts`
   - Implement custom hook with all state management
   - Integrate with localStorage
   - Memoize expensive calculations

**Testing**:
- Test state persistence across page reloads
- Test mode switching
- Test chord selection/deselection
- Verify localStorage data structure

---

### Phase 3: UI Components (Week 3-4)

**Files to Create** (in order):
1. `components/overlapping-chords/OverlappingChordsToggle.tsx`
2. `components/overlapping-chords/ModeSelector.tsx`
3. `components/overlapping-chords/OverlapTypeSelector.tsx`
4. `components/overlapping-chords/CagedModeControls.tsx`
5. `components/overlapping-chords/ScaleModeControls.tsx`
6. `components/overlapping-chords/ChordCard.tsx`
7. `components/overlapping-chords/ChordList.tsx`
8. `components/overlapping-chords/ChordCategoryTabs.tsx`
9. `components/overlapping-chords/ChordDisplaySection.tsx`
10. `components/overlapping-chords/OverlappingChordsContainer.tsx`

**Testing**:
- Visual regression testing
- Interaction testing (clicks, hovers)
- Responsive design testing
- Theme compatibility testing

---

### Phase 4: Fretboard Integration (Week 5)

**Files to Modify**:
1. Main fretboard component
   - Add support for overlapping chords display
   - Implement note coloring logic
   - Implement shared note indicators
   - Add state save/restore functionality

2. Main page component
   - Integrate `OverlappingChordsContainer`
   - Wire up callbacks
   - Handle fretboard data updates

**Testing**:
- End-to-end testing of full workflow
- Test fretboard state save/restore
- Test multi-chord display
- Test color assignments
- Test shared note indicators

---

### Phase 5: Polish & Optimization (Week 6)

**Tasks**:
1. Performance optimization
   - Memoize expensive calculations
   - Debounce user inputs
   - Optimize re-renders

2. UX improvements
   - Add loading states
   - Add empty states
   - Add tooltips and help text
   - Add keyboard shortcuts

3. Accessibility
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

4. Documentation
   - User guide
   - Developer documentation
   - Code comments

---

## Testing Requirements

### Unit Tests

**Chord Finding Algorithms**:
```typescript
describe('findChordsInCagedArea', () => {
  it('should find all chords with complete overlap in C shape at position 0', () => {
    const result = findChordsInCagedArea(['C'], { C: 0 }, 'complete', 6);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(chord => chord.overlapPercentage === 100)).toBe(true);
  });

  it('should find chords with partial overlap (2+ notes)', () => {
    const result = findChordsInCagedArea(['C'], { C: 0 }, 'partial', 6);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(chord => chord.overlapCount >= 2)).toBe(true);
  });

  it('should handle multiple CAGED shapes', () => {
    const result = findChordsInCagedArea(['C', 'A'], { C: 0, A: 5 }, 'complete', 6);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('findChordsInScale', () => {
  it('should find diatonic chords in C major scale', () => {
    const result = findChordsInScale('C', 'Major', [0], 'complete', 6);
    const expectedChords = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'];
    const foundSymbols = result.map(c => c.chordSymbol);
    expectedChords.forEach(symbol => {
      expect(foundSymbols).toContain(symbol);
    });
  });

  it('should find chromatic chords with partial overlap', () => {
    const result = findChordsInScale('C', 'Major', [0], 'partial', 6);
    expect(result.length).toBeGreaterThan(7); // More than just diatonic
  });
});
```

### Integration Tests

**State Management**:
```typescript
describe('useOverlappingChords', () => {
  it('should toggle enabled state', () => {
    const { result } = renderHook(() => useOverlappingChords('C', 'Major', 6));

    act(() => {
      result.current.actions.toggleEnabled();
    });

    expect(result.current.state.enabled).toBe(true);
  });

  it('should clear selections when switching modes', () => {
    const { result } = renderHook(() => useOverlappingChords('C', 'Major', 6));

    // Select a chord
    act(() => {
      result.current.actions.toggleChordSelection(mockChord);
    });

    expect(result.current.state.selectedChords.length).toBe(1);

    // Switch mode
    act(() => {
      result.current.actions.setMode('scale');
    });

    expect(result.current.state.selectedChords.length).toBe(0);
  });
});
```

### E2E Tests

**Full Workflow**:
```typescript
describe('Overlapping Chords Feature', () => {
  it('should complete full CAGED mode workflow', async () => {
    // 1. Enable feature
    await user.click(screen.getByLabelText('Toggle Overlapping Chords'));

    // 2. Select CAGED mode
    await user.click(screen.getByText('CAGED Areas'));

    // 3. Select C shape
    await user.click(screen.getByLabelText('C'));

    // 4. Set position to 0
    const positionInput = screen.getByLabelText('C:');
    await user.clear(positionInput);
    await user.type(positionInput, '0');

    // 5. Select complete overlap
    await user.click(screen.getByLabelText('Complete Overlap'));

    // 6. Verify chords are displayed
    expect(screen.getByText(/chords found/i)).toBeInTheDocument();

    // 7. Select a chord
    const chordCard = screen.getAllByRole('button', { name: /select chord/i })[0];
    await user.click(chordCard);

    // 8. Verify fretboard updated
    expect(screen.getByTestId('fretboard')).toHaveAttribute('data-display-type', 'overlapping-chords');
  });
});
```

---

## Performance Considerations

### Optimization Strategies

1. **Memoization**:
   - Use `useMemo` for expensive chord calculations
   - Cache chord voicings to avoid regeneration

2. **Debouncing**:
   - Debounce position input changes (300ms)
   - Debounce chord selection updates

3. **Lazy Loading**:
   - Load chord data on-demand
   - Paginate chord list if > 50 chords

4. **Virtual Scrolling**:
   - Use virtual scrolling for large chord lists
   - Render only visible chord cards

5. **Web Workers** (optional):
   - Offload chord calculations to web worker
   - Keep UI responsive during heavy computations

---

## Accessibility Requirements

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Enter/Space to toggle checkboxes and select chords
   - Arrow keys to navigate chord list

2. **Screen Reader Support**:
   - ARIA labels for all controls
   - Announce chord selection changes
   - Describe chord properties (quality, overlap count)

3. **Focus Management**:
   - Visible focus indicators
   - Logical tab order
   - Focus trap in modal-like sections

4. **Color Contrast**:
   - Ensure sufficient contrast for all text
   - Don't rely solely on color for information
   - Provide text labels for color-coded elements

---

## Error Handling

### Edge Cases to Handle

1. **No CAGED Shapes Selected**:
   - Show message: "Select at least one CAGED shape"
   - Disable chord display section

2. **No Scale Positions Selected**:
   - Show message: "Select at least one scale position"
   - Disable chord display section

3. **No Chords Found**:
   - Show empty state: "No chords found matching criteria"
   - Suggest relaxing overlap type or selecting more areas

4. **Invalid Position Input**:
   - Clamp to valid range (0-12)
   - Show validation error

5. **LocalStorage Quota Exceeded**:
   - Gracefully degrade to session storage
   - Show warning to user

---

## Future Enhancements

### Potential Features (Post-MVP)

1. **Extended Chords**:
   - Add 9th, 11th, 13th chords
   - Add sus2, sus4, add9 variations

2. **Chord Voicing Preferences**:
   - Filter by string count (3-string, 4-string, etc.)
   - Filter by difficulty level
   - Filter by hand position (open, barre, etc.)

3. **Chord Progression Builder**:
   - Select multiple chords in sequence
   - Save progressions
   - Export to Song Builder

4. **Audio Preview**:
   - Play chord sound on hover/click
   - Use Web Audio API or MIDI

5. **Chord Diagrams**:
   - Show mini chord diagrams in cards
   - Interactive chord diagram editor

6. **Smart Recommendations**:
   - Suggest chord progressions based on selected chords
   - Highlight common progressions (I-IV-V, etc.)

7. **Export/Share**:
   - Export chord list as PDF
   - Share via URL with encoded state

---

## Conclusion

This blueprint provides a complete specification for implementing the Overlapping Chords feature. Follow the implementation phases sequentially, ensuring thorough testing at each stage. The modular component structure allows for incremental development and easy maintenance.

**Key Success Metrics**:
- Feature toggle works reliably
- Chord calculations are accurate
- UI is responsive and intuitive
- Fretboard integration is seamless
- State persists across sessions
- Performance is acceptable (< 100ms for chord calculations)

**Next Steps**:
1. Review and approve blueprint
2. Set up project structure
3. Begin Phase 1 implementation
4. Conduct regular code reviews
5. Iterate based on user feedback

