# Implementation Guide

## Executive Summary

This document provides a step-by-step implementation guide for integrating the Pentatonic Triad System into your existing Next.js webapp. It covers file structure, build order, integration points, and testing strategies.

---

## 1. Project Structure

### 1.1 Recommended File Organization

```
src/
├── lib/
│   └── music-theory/
│       ├── index.ts                 # Public API exports
│       ├── constants.ts             # All music constants
│       ├── types.ts                 # TypeScript types (from Part 6)
│       ├── core/
│       │   ├── notes.ts             # Note calculation utilities
│       │   ├── intervals.ts         # Interval calculations
│       │   └── fretboard.ts         # Fretboard position utilities
│       ├── triads/
│       │   ├── builder.ts           # Triad construction
│       │   ├── voicings.ts          # Voicing generation
│       │   └── fingering.ts         # Fingering algorithm
│       ├── scales/
│       │   ├── pentatonic.ts        # Pentatonic scale logic
│       │   ├── boxes.ts             # Box position calculations
│       │   └── diatonic.ts          # Diatonic chord generation
│       ├── analysis/
│       │   ├── voice-leading.ts     # Voice leading calculations
│       │   ├── neighborhood.ts      # Chord neighborhood logic
│       │   └── embellishments.ts    # Embellishment finder
│       └── zones/
│           └── zone-manager.ts      # Zone management
│
├── components/
│   └── triad-system/
│       ├── TriadSystemProvider.tsx  # Context provider
│       ├── ControlPanel/
│       │   ├── KeySelector.tsx
│       │   ├── StringSetFilter.tsx
│       │   ├── InversionFilter.tsx
│       │   ├── ViewToggles.tsx
│       │   └── TwoNoteMode.tsx
│       ├── InfoPanel/
│       │   ├── PositionDetails.tsx
│       │   ├── VoiceLeadingPanel.tsx
│       │   └── NeighborhoodPanel.tsx
│       ├── ZoneNavigator/
│       │   └── ZoneNavigator.tsx
│       ├── ProgressionBuilder/
│       │   ├── ProgressionBuilder.tsx
│       │   ├── ChordSlot.tsx
│       │   └── PresetSelector.tsx
│       └── FretboardOverlay/
│           ├── NoteLayer.tsx
│           ├── PentatonicLayer.tsx
│           ├── BarChordLayer.tsx
│           ├── EmbellishmentLayer.tsx
│           └── VoiceLeadingLayer.tsx
│
├── hooks/
│   └── triad-system/
│       ├── useTriadSystem.ts        # Main hook
│       ├── useVoicings.ts           # Voicing calculations
│       ├── usePentatonic.ts         # Pentatonic data
│       ├── useVoiceLeading.ts       # Voice leading
│       ├── useProgression.ts        # Progression builder
│       └── useZones.ts              # Zone management
│
├── store/
│   └── triad-system/
│       ├── store.ts                 # Zustand store (or Redux slice)
│       ├── selectors.ts             # Memoized selectors
│       └── actions.ts               # Action creators
│
└── styles/
    └── triad-system/
        ├── notes.css                # Note styling
        ├── overlays.css             # Overlay layers
        ├── controls.css             # Control panel
        └── animations.css           # Transitions
```

---

## 2. Implementation Phases

### Phase 1: Core Music Theory Engine (Week 1)

**Goal:** Build the foundational music theory calculations.

#### Step 1.1: Constants & Types
```typescript
// src/lib/music-theory/constants.ts

export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const STANDARD_TUNING = [4, 9, 2, 7, 11, 4] as const; // E A D G B E

export const TRIAD_FORMULAS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8]
} as const;

export const PENTATONIC_FORMULAS = {
  minor: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 7, 9]
} as const;

export const STRING_SETS = {
  '123': [3, 2, 1],
  '234': [4, 3, 2],
  '345': [5, 4, 3],
  '456': [6, 5, 4]
} as const;

export const ZONE_DEFINITIONS = [
  { zoneNumber: 1, startFret: 0, endFret: 3, centerFret: 2, cagedShape: 'E' },
  { zoneNumber: 2, startFret: 2, endFret: 6, centerFret: 4, cagedShape: 'D' },
  { zoneNumber: 3, startFret: 5, endFret: 9, centerFret: 7, cagedShape: 'C' },
  { zoneNumber: 4, startFret: 7, endFret: 11, centerFret: 9, cagedShape: 'A' },
  { zoneNumber: 5, startFret: 10, endFret: 14, centerFret: 12, cagedShape: 'G' },
  { zoneNumber: 6, startFret: 12, endFret: 15, centerFret: 14, cagedShape: 'E' }
] as const;
```

#### Step 1.2: Core Note Utilities
```typescript
// src/lib/music-theory/core/notes.ts

import { STANDARD_TUNING, NOTES_SHARP, NOTES_FLAT } from '../constants';

export function getPitchClass(string: number, fret: number): number {
  return (STANDARD_TUNING[string - 1] + fret) % 12;
}

export function getNoteName(pitchClass: number, preferFlats = false): string {
  return preferFlats ? NOTES_FLAT[pitchClass] : NOTES_SHARP[pitchClass];
}

export function getRelativeMinor(majorRoot: number): number {
  return (majorRoot - 3 + 12) % 12;
}

export function getRelativeMajor(minorRoot: number): number {
  return (minorRoot + 3) % 12;
}

export function findAllPositions(
  pitchClass: number,
  minFret = 0,
  maxFret = 15
): Array<{ string: number; fret: number }> {
  const positions: Array<{ string: number; fret: number }> = [];
  
  for (let string = 1; string <= 6; string++) {
    for (let fret = minFret; fret <= maxFret; fret++) {
      if (getPitchClass(string, fret) === pitchClass) {
        positions.push({ string, fret });
      }
    }
  }
  
  return positions;
}
```

#### Step 1.3: Triad Builder
```typescript
// src/lib/music-theory/triads/builder.ts

import { TRIAD_FORMULAS } from '../constants';
import { getNoteName } from '../core/notes';
import type { Triad, TriadQuality } from '../types';

export function buildTriad(root: number, quality: TriadQuality): Triad {
  const formula = TRIAD_FORMULAS[quality];
  
  const notes = formula.map(interval => ({
    pitchClass: (root + interval) % 12,
    name: getNoteName((root + interval) % 12)
  }));
  
  return {
    root: { pitchClass: root, name: getNoteName(root) },
    quality,
    notes: notes as [typeof notes[0], typeof notes[0], typeof notes[0]],
    intervals: formula as [0, number, number],
    displayName: `${getNoteName(root)}${quality === 'minor' ? 'm' : quality === 'diminished' ? 'dim' : quality === 'augmented' ? 'aug' : ''}`
  };
}
```

#### Step 1.4: Unit Tests for Phase 1
```typescript
// src/lib/music-theory/__tests__/core.test.ts

import { getPitchClass, getNoteName, getRelativeMinor, findAllPositions } from '../core/notes';
import { buildTriad } from '../triads/builder';

describe('Core Music Theory', () => {
  describe('getPitchClass', () => {
    it('returns correct pitch class for open strings', () => {
      expect(getPitchClass(1, 0)).toBe(4);  // High E
      expect(getPitchClass(2, 0)).toBe(11); // B
      expect(getPitchClass(6, 0)).toBe(4);  // Low E
    });
    
    it('returns correct pitch class for fretted notes', () => {
      expect(getPitchClass(6, 5)).toBe(9);  // A on low E string
      expect(getPitchClass(5, 3)).toBe(0);  // C on A string
    });
  });
  
  describe('getRelativeMinor', () => {
    it('returns relative minor correctly', () => {
      expect(getRelativeMinor(0)).toBe(9);  // C major -> A minor
      expect(getRelativeMinor(7)).toBe(4);  // G major -> E minor
    });
  });
  
  describe('buildTriad', () => {
    it('builds major triad correctly', () => {
      const cMajor = buildTriad(0, 'major');
      expect(cMajor.notes[0].pitchClass).toBe(0);  // C
      expect(cMajor.notes[1].pitchClass).toBe(4);  // E
      expect(cMajor.notes[2].pitchClass).toBe(7);  // G
    });
    
    it('builds minor triad correctly', () => {
      const aMinor = buildTriad(9, 'minor');
      expect(aMinor.notes[0].pitchClass).toBe(9);  // A
      expect(aMinor.notes[1].pitchClass).toBe(0);  // C
      expect(aMinor.notes[2].pitchClass).toBe(4);  // E
    });
  });
});
```

---

### Phase 2: Voicing Generation (Week 2)

**Goal:** Generate all triad voicings across string sets and inversions.

#### Step 2.1: Voicing Generator
```typescript
// src/lib/music-theory/triads/voicings.ts

import { STRING_SETS } from '../constants';
import { getPitchClass, findAllPositions } from '../core/notes';
import { calculateFingering } from './fingering';
import type { Triad, TriadVoicing, StringSet, Inversion } from '../types';

function getInversionNotes(triad: Triad, inversion: Inversion) {
  const [root, third, fifth] = triad.notes;
  switch (inversion) {
    case 'root': return [root, third, fifth];
    case 'first': return [third, fifth, root];
    case 'second': return [fifth, root, third];
  }
}

export function findVoicingsOnStringSet(
  triad: Triad,
  stringSet: StringSet,
  inversion: Inversion,
  fretRange: [number, number] = [0, 15]
): TriadVoicing[] {
  const voicings: TriadVoicing[] = [];
  const strings = STRING_SETS[stringSet];
  const notes = getInversionNotes(triad, inversion);
  
  // Find all bass note positions on the bass string of the set
  const bassPositions = findAllPositions(notes[0].pitchClass, fretRange[0], fretRange[1])
    .filter(p => p.string === strings[0]);
  
  for (const bassPos of bassPositions) {
    // Find middle and treble positions
    const middlePositions = findAllPositions(notes[1].pitchClass, 0, 24)
      .filter(p => p.string === strings[1]);
    const treblePositions = findAllPositions(notes[2].pitchClass, 0, 24)
      .filter(p => p.string === strings[2]);
    
    for (const middlePos of middlePositions) {
      for (const treblePos of treblePositions) {
        const frets = [bassPos.fret, middlePos.fret, treblePos.fret];
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);
        
        // Check playability (within 4 fret span)
        if (maxFret - minFret <= 4 && minFret >= fretRange[0] && maxFret <= fretRange[1]) {
          const positions = [
            { ...bassPos, note: notes[0], isTriadNote: true },
            { ...middlePos, note: notes[1], isTriadNote: true },
            { ...treblePos, note: notes[2], isTriadNote: true }
          ];
          
          voicings.push({
            ...triad,
            inversion,
            stringSet,
            positions: positions as any,
            lowestFret: minFret,
            highestFret: maxFret,
            centerFret: Math.round((minFret + maxFret) / 2),
            fingering: calculateFingering(positions as any),
            voicingId: `${triad.root.name}${triad.quality}_${stringSet}_${inversion}_${minFret}`
          });
        }
      }
    }
  }
  
  return voicings;
}

export function getAllVoicings(
  triad: Triad,
  fretRange: [number, number] = [0, 15]
): TriadVoicing[] {
  const allVoicings: TriadVoicing[] = [];
  const stringSets: StringSet[] = ['123', '234', '345', '456'];
  const inversions: Inversion[] = ['root', 'first', 'second'];
  
  for (const stringSet of stringSets) {
    for (const inversion of inversions) {
      allVoicings.push(...findVoicingsOnStringSet(triad, stringSet, inversion, fretRange));
    }
  }
  
  return allVoicings;
}
```

#### Step 2.2: Fingering Algorithm
```typescript
// src/lib/music-theory/triads/fingering.ts

import type { FretboardNote, TriadFingering, FingerNumber } from '../types';

export function calculateFingering(
  positions: [FretboardNote, FretboardNote, FretboardNote]
): TriadFingering {
  const frets = positions.map(p => p.fret).filter(f => f > 0);
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const span = maxFret - minFret;
  
  // Check for barre (same fret on multiple strings)
  const fretCounts = new Map<number, number>();
  positions.forEach(p => {
    if (p.fret > 0) {
      fretCounts.set(p.fret, (fretCounts.get(p.fret) || 0) + 1);
    }
  });
  const usesBarre = Array.from(fretCounts.values()).some(count => count >= 2);
  
  // Assign fingers
  const fingers: FingerNumber[] = positions.map(pos => {
    if (pos.fret === 0) return 1; // Open string (placeholder)
    
    const relativeFret = pos.fret - minFret;
    
    if (usesBarre && fretCounts.get(pos.fret)! >= 2) {
      return 1; // Barre with index
    }
    
    // Simple mapping based on relative position
    if (relativeFret === 0) return 1;
    if (relativeFret === 1) return 2;
    if (relativeFret === 2) return 3;
    return 4;
  }) as [FingerNumber, FingerNumber, FingerNumber];
  
  // Calculate difficulty
  let difficulty: 1 | 2 | 3 | 4 | 5 = 1;
  if (span >= 4) difficulty = 5;
  else if (span >= 3) difficulty = 4;
  else if (usesBarre) difficulty = 3;
  else if (span >= 2) difficulty = 2;
  
  return {
    fingers,
    usesBarre,
    span,
    difficulty
  };
}
```

---

### Phase 3: Pentatonic Integration (Week 3)

**Goal:** Build pentatonic scale logic and box positions.

#### Step 3.1: Pentatonic Scale Builder
```typescript
// src/lib/music-theory/scales/pentatonic.ts

import { PENTATONIC_FORMULAS } from '../constants';
import { getNoteName, getRelativeMinor, getRelativeMajor, findAllPositions } from '../core/notes';
import type { PentatonicScale, PentatonicMode, PentatonicBox, BoxPosition, FretboardNote } from '../types';

export function buildPentatonic(root: number, mode: PentatonicMode): PentatonicScale {
  const formula = PENTATONIC_FORMULAS[mode];
  
  const notes = formula.map(interval => ({
    pitchClass: (root + interval) % 12,
    name: getNoteName((root + interval) % 12)
  }));
  
  const relative = mode === 'minor' 
    ? { pitchClass: getRelativeMajor(root), name: getNoteName(getRelativeMajor(root)) }
    : { pitchClass: getRelativeMinor(root), name: getNoteName(getRelativeMinor(root)) };
  
  return {
    root: { pitchClass: root, name: getNoteName(root) },
    mode,
    notes: notes as any,
    intervals: formula as any,
    relative
  };
}

export function isInPentatonic(pitchClass: number, scale: PentatonicScale): boolean {
  return scale.notes.some(note => note.pitchClass === pitchClass);
}

export function getPentatonicInRange(
  scale: PentatonicScale,
  fretRange: [number, number],
  strings?: number[]
): FretboardNote[] {
  const notes: FretboardNote[] = [];
  const targetStrings = strings || [1, 2, 3, 4, 5, 6];
  
  for (const scaleNote of scale.notes) {
    const positions = findAllPositions(scaleNote.pitchClass, fretRange[0], fretRange[1]);
    
    for (const pos of positions) {
      if (targetStrings.includes(pos.string)) {
        notes.push({
          ...pos,
          note: scaleNote,
          isPentatonic: true,
          isRoot: scaleNote.pitchClass === scale.root.pitchClass
        });
      }
    }
  }
  
  return notes;
}
```

#### Step 3.2: Box Position Calculator
```typescript
// src/lib/music-theory/scales/boxes.ts

import { findAllPositions } from '../core/notes';
import { getPentatonicInRange } from './pentatonic';
import type { PentatonicScale, PentatonicBox, BoxPosition } from '../types';

// Box starting intervals from root (in semitones)
const BOX_ROOT_OFFSETS = {
  1: 0,   // Root position
  2: 3,   // b3 position
  3: 5,   // 4 position
  4: 7,   // 5 position
  5: 10   // b7 position
} as const;

export function getPentatonicBox(
  scale: PentatonicScale,
  position: BoxPosition
): PentatonicBox {
  // Find the starting fret based on the box position
  const startingPitchClass = (scale.root.pitchClass + BOX_ROOT_OFFSETS[position]) % 12;
  
  // Find positions of this note on the low E string (string 6)
  const anchorPositions = findAllPositions(startingPitchClass, 0, 12)
    .filter(p => p.string === 6);
  
  if (anchorPositions.length === 0) {
    throw new Error(`Could not find anchor for box ${position}`);
  }
  
  const anchorFret = anchorPositions[0].fret;
  const startFret = Math.max(0, anchorFret - 1);
  const endFret = anchorFret + 3;
  
  const notes = getPentatonicInRange(scale, [startFret, endFret]);
  const rootPositions = notes
    .filter(n => n.isRoot)
    .map(n => ({ string: n.string, fret: n.fret }));
  
  return {
    position,
    scale,
    startFret,
    endFret,
    notes,
    rootPositions
  };
}

export function findBestBoxForRange(
  scale: PentatonicScale,
  centerFret: number
): PentatonicBox {
  let bestBox: PentatonicBox | null = null;
  let bestDistance = Infinity;
  
  for (let pos = 1; pos <= 5; pos++) {
    const box = getPentatonicBox(scale, pos as BoxPosition);
    const boxCenter = (box.startFret + box.endFret) / 2;
    const distance = Math.abs(boxCenter - centerFret);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestBox = box;
    }
  }
  
  return bestBox!;
}
```

---

### Phase 4: State Management (Week 4)

**Goal:** Build the application state layer.

#### Step 4.1: Zustand Store
```typescript
// src/store/triad-system/store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppState, PitchClass, ScaleMode, StringSet, Inversion, ZoneNumber, TriadVoicing, TwoNoteMode } from '@/lib/music-theory/types';

interface TriadSystemStore extends AppState {
  // Actions
  setKey: (key: PitchClass, mode: ScaleMode) => void;
  setStringSetFilter: (stringSet: StringSet | null) => void;
  setInversionFilter: (inversion: Inversion | null) => void;
  selectVoicing: (voicing: TriadVoicing | null) => void;
  setZone: (zone: ZoneNumber) => void;
  toggleOverlay: (overlay: keyof AppState['viewSettings'], value: boolean) => void;
  setTwoNoteMode: (enabled: boolean, mode?: TwoNoteMode) => void;
  recalculateDerivedState: () => void;
}

const initialState: AppState = {
  selections: {
    key: 0, // C
    mode: 'major',
    stringSetFilter: null,
    inversionFilter: null,
    selectedVoicing: null,
    currentZone: 1,
    progressionIndex: null
  },
  viewSettings: {
    showPentatonicOverlay: true,
    showBarChordReference: false,
    showEmbellishments: false,
    showVoiceLeading: false,
    showNeighborhood: false,
    twoNoteMode: false,
    twoNoteModeType: 'outside',
    showFingering: true,
    fingeringStyle: 'numbers',
    noteLabelContent: 'note',
    pentatonicBox: null
  },
  derivedState: {
    diatonicChords: [],
    relativePentatonic: null as any,
    availableVoicings: [],
    currentVoicing: null,
    chordNeighborhood: null,
    embellishmentSet: null,
    zoneData: []
  },
  progression: {
    currentProgression: null,
    voiceLeadingPath: null,
    playback: {
      isPlaying: false,
      currentBeat: 0,
      currentChordIndex: 0,
      tempo: 120
    }
  },
  ui: {
    activePanel: 'position',
    isLoading: false,
    error: null
  }
};

export const useTriadSystemStore = create<TriadSystemStore>()(
  immer((set, get) => ({
    ...initialState,
    
    setKey: (key, mode) => set(state => {
      state.selections.key = key;
      state.selections.mode = mode;
      state.selections.selectedVoicing = null;
    }),
    
    setStringSetFilter: (stringSet) => set(state => {
      state.selections.stringSetFilter = stringSet;
    }),
    
    setInversionFilter: (inversion) => set(state => {
      state.selections.inversionFilter = inversion;
    }),
    
    selectVoicing: (voicing) => set(state => {
      state.selections.selectedVoicing = voicing;
    }),
    
    setZone: (zone) => set(state => {
      state.selections.currentZone = zone;
    }),
    
    toggleOverlay: (overlay, value) => set(state => {
      (state.viewSettings as any)[overlay] = value;
    }),
    
    setTwoNoteMode: (enabled, mode) => set(state => {
      state.viewSettings.twoNoteMode = enabled;
      if (mode) state.viewSettings.twoNoteModeType = mode;
    }),
    
    recalculateDerivedState: () => {
      // This would call the music theory engine to recalculate
      // Implementation depends on your specific needs
    }
  }))
);
```

#### Step 4.2: Memoized Selectors
```typescript
// src/store/triad-system/selectors.ts

import { useMemo } from 'react';
import { useTriadSystemStore } from './store';
import { buildTriad, getAllVoicings } from '@/lib/music-theory/triads';
import { buildPentatonic, getRelativeMinor } from '@/lib/music-theory/scales';
import { getDiatonicChords } from '@/lib/music-theory/scales/diatonic';

export function useFilteredVoicings() {
  const { selections, derivedState } = useTriadSystemStore();
  
  return useMemo(() => {
    let voicings = derivedState.availableVoicings;
    
    if (selections.stringSetFilter) {
      voicings = voicings.filter(v => v.stringSet === selections.stringSetFilter);
    }
    
    if (selections.inversionFilter) {
      voicings = voicings.filter(v => v.inversion === selections.inversionFilter);
    }
    
    return voicings;
  }, [derivedState.availableVoicings, selections.stringSetFilter, selections.inversionFilter]);
}

export function useRelativePentatonic() {
  const { selections } = useTriadSystemStore();
  
  return useMemo(() => {
    const pentatonicRoot = selections.mode === 'major' 
      ? getRelativeMinor(selections.key)
      : selections.key;
    
    return buildPentatonic(pentatonicRoot, 'minor');
  }, [selections.key, selections.mode]);
}

export function useDiatonicChords() {
  const { selections } = useTriadSystemStore();
  
  return useMemo(() => {
    return getDiatonicChords(selections.key, selections.mode);
  }, [selections.key, selections.mode]);
}
```

---

### Phase 5: UI Components (Weeks 5-6)

**Goal:** Build the React component layer.

#### Step 5.1: Main Provider
```typescript
// src/components/triad-system/TriadSystemProvider.tsx

'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useTriadSystemStore } from '@/store/triad-system/store';

interface TriadSystemContextValue {
  isReady: boolean;
}

const TriadSystemContext = createContext<TriadSystemContextValue>({ isReady: false });

export function TriadSystemProvider({ children }: { children: ReactNode }) {
  const recalculateDerivedState = useTriadSystemStore(s => s.recalculateDerivedState);
  const key = useTriadSystemStore(s => s.selections.key);
  const mode = useTriadSystemStore(s => s.selections.mode);
  
  // Recalculate when key/mode changes
  useEffect(() => {
    recalculateDerivedState();
  }, [key, mode, recalculateDerivedState]);
  
  return (
    <TriadSystemContext.Provider value={{ isReady: true }}>
      {children}
    </TriadSystemContext.Provider>
  );
}

export function useTriadSystemContext() {
  return useContext(TriadSystemContext);
}
```

#### Step 5.2: Key Selector Component
```typescript
// src/components/triad-system/ControlPanel/KeySelector.tsx

'use client';

import { useTriadSystemStore } from '@/store/triad-system/store';
import { NOTES_SHARP } from '@/lib/music-theory/constants';

export function KeySelector() {
  const { key, mode } = useTriadSystemStore(s => s.selections);
  const setKey = useTriadSystemStore(s => s.setKey);
  
  return (
    <div className="key-selector">
      <label className="block text-sm font-medium mb-2">Key</label>
      
      <div className="flex gap-2">
        <select 
          value={key}
          onChange={(e) => setKey(Number(e.target.value), mode)}
          className="flex-1 px-3 py-2 border rounded-md"
        >
          {NOTES_SHARP.map((note, index) => (
            <option key={note} value={index}>{note}</option>
          ))}
        </select>
        
        <div className="flex rounded-md border overflow-hidden">
          <button
            className={`px-4 py-2 ${mode === 'major' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setKey(key, 'major')}
          >
            Major
          </button>
          <button
            className={`px-4 py-2 ${mode === 'minor' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setKey(key, 'minor')}
          >
            Minor
          </button>
        </div>
      </div>
      
      {mode === 'major' && (
        <p className="text-sm text-gray-500 mt-1">
          Relative minor: {NOTES_SHARP[(key - 3 + 12) % 12]}m pentatonic
        </p>
      )}
    </div>
  );
}
```

#### Step 5.3: Zone Navigator Component
```typescript
// src/components/triad-system/ZoneNavigator/ZoneNavigator.tsx

'use client';

import { useTriadSystemStore } from '@/store/triad-system/store';
import { ZONE_DEFINITIONS } from '@/lib/music-theory/constants';
import type { ZoneNumber } from '@/lib/music-theory/types';

export function ZoneNavigator() {
  const currentZone = useTriadSystemStore(s => s.selections.currentZone);
  const setZone = useTriadSystemStore(s => s.setZone);
  
  return (
    <div className="zone-navigator fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2">
      <div className="flex justify-center gap-1">
        {ZONE_DEFINITIONS.map((zone) => (
          <button
            key={zone.zoneNumber}
            onClick={() => setZone(zone.zoneNumber as ZoneNumber)}
            className={`
              px-4 py-2 rounded-md transition-colors
              ${currentZone === zone.zoneNumber 
                ? 'bg-blue-500' 
                : 'bg-gray-700 hover:bg-gray-600'}
            `}
          >
            <div className="text-sm font-bold">Zone {zone.zoneNumber}</div>
            <div className="text-xs opacity-75">
              Frets {zone.startFret}-{zone.endFret}
            </div>
            <div className="text-xs opacity-50">{zone.cagedShape} shape</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 6: Fretboard Integration (Week 7)

**Goal:** Connect to your existing fretboard UI.

#### Step 6.1: Fretboard Adapter
```typescript
// src/components/triad-system/FretboardOverlay/adapter.ts

import type { FretboardRenderData, FretboardNote, FretPosition } from '@/lib/music-theory/types';

/**
 * Adapter interface for your existing fretboard component
 * Implement these methods based on your current fretboard API
 */
export interface FretboardAdapter {
  clearAllOverlays(): void;
  renderNotes(notes: FretboardNote[], layerClass: string): void;
  renderConnection(from: FretPosition, to: FretPosition, options?: ConnectionOptions): void;
  highlightZone(startFret: number, endFret: number): void;
  clearZoneHighlight(): void;
  onNoteClick(callback: (position: FretPosition) => void): () => void;
  onNoteHover(callback: (position: FretPosition | null) => void): () => void;
}

interface ConnectionOptions {
  color?: string;
  style?: 'solid' | 'dashed';
  animated?: boolean;
}

/**
 * Example implementation - adapt to your specific fretboard
 */
export function createFretboardAdapter(fretboardRef: React.RefObject<HTMLElement>): FretboardAdapter {
  return {
    clearAllOverlays() {
      const overlays = fretboardRef.current?.querySelectorAll('.triad-overlay');
      overlays?.forEach(el => el.remove());
    },
    
    renderNotes(notes, layerClass) {
      notes.forEach(note => {
        // Create note element at position
        // Position calculation depends on your fretboard layout
        const noteEl = document.createElement('div');
        noteEl.className = `triad-overlay ${layerClass} ${note.styleClass || ''}`;
        noteEl.style.position = 'absolute';
        // ... position based on note.string and note.fret
        fretboardRef.current?.appendChild(noteEl);
      });
    },
    
    renderConnection(from, to, options) {
      // Create SVG line or canvas path
      // Implementation depends on your layout
    },
    
    highlightZone(startFret, endFret) {
      // Add zone highlight background
    },
    
    clearZoneHighlight() {
      const highlight = fretboardRef.current?.querySelector('.zone-highlight');
      highlight?.remove();
    },
    
    onNoteClick(callback) {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        const string = Number(target.dataset.string);
        const fret = Number(target.dataset.fret);
        if (!isNaN(string) && !isNaN(fret)) {
          callback({ string, fret });
        }
      };
      fretboardRef.current?.addEventListener('click', handler);
      return () => fretboardRef.current?.removeEventListener('click', handler);
    },
    
    onNoteHover(callback) {
      // Similar implementation
      return () => {};
    }
  };
}
```

#### Step 6.2: Rendering Hook
```typescript
// src/hooks/triad-system/useFretboardRender.ts

import { useEffect, useRef } from 'react';
import { useTriadSystemStore } from '@/store/triad-system/store';
import { useFilteredVoicings, useRelativePentatonic } from '@/store/triad-system/selectors';
import { getPentatonicInRange } from '@/lib/music-theory/scales/pentatonic';
import type { FretboardAdapter } from '@/components/triad-system/FretboardOverlay/adapter';

export function useFretboardRender(adapter: FretboardAdapter) {
  const viewSettings = useTriadSystemStore(s => s.viewSettings);
  const selectedVoicing = useTriadSystemStore(s => s.selections.selectedVoicing);
  const currentZone = useTriadSystemStore(s => s.selections.currentZone);
  const pentatonic = useRelativePentatonic();
  
  // Clear and re-render when relevant state changes
  useEffect(() => {
    adapter.clearAllOverlays();
    
    // Layer 1: Zone highlight
    const zone = ZONE_DEFINITIONS.find(z => z.zoneNumber === currentZone);
    if (zone) {
      adapter.highlightZone(zone.startFret, zone.endFret);
    }
    
    // Layer 2: Pentatonic ghost notes
    if (viewSettings.showPentatonicOverlay) {
      const pentatonicNotes = getPentatonicInRange(pentatonic, [0, 15]);
      adapter.renderNotes(
        pentatonicNotes.map(n => ({ ...n, styleClass: 'note-pentatonic-ghost' })),
        'pentatonic-layer'
      );
    }
    
    // Layer 3: Selected triad voicing
    if (selectedVoicing) {
      adapter.renderNotes(
        selectedVoicing.positions.map(pos => ({
          ...pos,
          styleClass: pos.isRoot ? 'note-root' : 'note-triad'
        })),
        'triad-layer'
      );
    }
    
  }, [adapter, viewSettings, selectedVoicing, currentZone, pentatonic]);
}
```

---

## 3. Integration Checklist

### Before Starting
- [ ] Document your existing fretboard component's API
- [ ] Identify CSS class naming conventions
- [ ] Plan state management integration (new store vs. extending existing)
- [ ] Set up TypeScript strict mode

### Phase 1 Checklist
- [ ] All constants defined
- [ ] Note calculation functions working
- [ ] Unit tests passing for core utilities

### Phase 2 Checklist
- [ ] Triad builder generates correct notes
- [ ] Voicing generator finds all positions
- [ ] Fingering algorithm assigns fingers correctly
- [ ] All 4 string sets × 3 inversions generating voicings

### Phase 3 Checklist
- [ ] Pentatonic scales building correctly
- [ ] Box positions calculating properly
- [ ] Relative minor/major relationship working

### Phase 4 Checklist
- [ ] Store actions working
- [ ] Selectors memoizing properly
- [ ] State updates triggering re-renders

### Phase 5 Checklist
- [ ] Control panel components rendering
- [ ] Zone navigator functional
- [ ] View toggles affecting display

### Phase 6 Checklist
- [ ] Adapter connecting to existing fretboard
- [ ] Notes rendering at correct positions
- [ ] Click/hover events working
- [ ] All overlay layers rendering in correct order

---

## 4. Testing Strategy

### Unit Tests
- Core music theory functions
- Triad building and voicing generation
- Pentatonic scale calculations
- Voice leading algorithm

### Integration Tests
- State management flows
- Selector computations
- Multi-component interactions

### Visual Regression Tests
- Fretboard rendering accuracy
- Color coding consistency
- Responsive layout behavior

### Manual Testing Scenarios
1. Change key from C major to G major - verify all voicings update
2. Select a triad voicing - verify pentatonic overlay shows correct relationship
3. Enable two-note mode - verify correct notes are hidden
4. Navigate through zones - verify voicings update per zone
5. Build a I-IV-V-I progression - verify voice leading optimization

---

## 5. Performance Considerations

### Memoization Points
- Voicing calculations (expensive, cache by key/mode)
- Pentatonic note positions (cache by root/mode)
- Voice leading calculations (cache by chord pair)

### Render Optimization
- Use React.memo for note components
- Virtualize large voicing lists
- Debounce fretboard interactions

### Pre-computation
- Generate all voicings for all keys on app initialization
- Store in IndexedDB for instant access
- Lazy-load progression presets

---

*This implementation guide provides a complete roadmap for building the Pentatonic Triad System. Follow the phases in order, testing thoroughly at each stage before proceeding.*
