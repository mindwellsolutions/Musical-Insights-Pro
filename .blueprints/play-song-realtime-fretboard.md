# Play Song - Real-time Fretboard Integration Blueprint

## Overview
Integrate the fretboard visualization system from the homepage into the Chord Progression Builder with real-time chord tone and scale updates synchronized to timeline playback.

## Architecture

### 1. Component Structure
```
ChordProgressionBuilder
├── Timeline (existing)
├── GeneratorPanel (existing)
└── PlaySongPanel (NEW)
    ├── PlaySongTabs
    │   ├── FretboardTab
    │   │   ├── CurrentChordDiagram (left side)
    │   │   ├── Fretboard (center)
    │   │   └── ChordTonesPanel (right side)
    │   └── (Future tabs)
    └── PlaybackControls (shared with timeline)
```

### 2. Data Flow
```
Timeline Playback
    ↓
PlaybackContext (currentTime, isPlaying)
    ↓
getCurrentChord(currentTime) → Active Chord
getCurrentScale(currentTime) → Active Scale
    ↓
ChordTonesDatabase.getChordTones(chordSymbol)
    ↓
Fretboard Updates (chord tones + scale notes)
ChordDiagram Updates (voicing display)
```

## Database Schema

### Chord Tones Database
**File**: `public/data/chord-tones/chord-tones-database.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-24",
  "chords": {
    "C": {
      "rootNote": "C",
      "quality": "major",
      "notes": ["C", "E", "G"],
      "intervals": [0, 4, 7],
      "chordTones": {
        "root": "C",
        "third": "E",
        "fifth": "G"
      }
    },
    "Cm": {
      "rootNote": "C",
      "quality": "minor",
      "notes": ["C", "D#", "G"],
      "intervals": [0, 3, 7],
      "chordTones": {
        "root": "C",
        "third": "D#",
        "fifth": "G"
      }
    }
    // ... all chord types
  }
}
```

## Implementation Tasks

### Phase 1: Database Generation ✅ COMPLETE
- [x] Create script to generate chord tones database
- [x] Extract all chord types from Add Chord modal
- [x] Generate chord tones for all 12 root notes × all qualities
- [x] Validate database completeness

### Phase 2: Playback Context ✅ COMPLETE
- [x] Create PlaybackContext for timeline state
- [x] Implement getCurrentChord(time) utility
- [x] Implement getCurrentScale(time) utility
- [x] Add real-time update hooks

### Phase 3: Play Song Panel ✅ COMPLETE
- [x] Create PlaySongPanel component
- [x] Add tabbed interface (Play Song tab)
- [x] Integrate with ChordProgressionBuilder layout
- [x] Position left of Chord Progressions panel

### Phase 4: Fretboard Integration ✅ COMPLETE
- [x] Port Fretboard component from homepage
- [x] Adapt for chord progression context
- [x] Connect to PlaybackContext
- [x] Implement real-time chord tone updates
- [x] Implement real-time scale updates

### Phase 5: Chord Diagram Display
- [ ] Create CurrentChordDiagram component
- [ ] Position left of fretboard
- [ ] Connect to current chord state
- [ ] Display chord voicing in real-time
- [ ] Add chord name/symbol display

### Phase 6: Chord Tones Panel ✅ COMPLETE
- [x] Port ChordTones controls from homepage
- [x] Adapt for real-time chord context
- [x] Update to show current chord's tones
- [x] Maintain user preferences (colors, glow, etc.)

### Phase 7: Integration & Testing
- [ ] Connect playback controls
- [ ] Test chord transitions
- [ ] Test scale transitions
- [ ] Test edge cases (no chord, overlapping)
- [ ] Performance optimization

## File Structure

```
public/data/chord-tones/
  └── chord-tones-database.json

scripts/
  └── generateChordTonesDatabase.ts

lib/
  ├── chord-tones-database.ts (loader/utilities)
  └── playback-context.ts (NEW)

components/chord-progression/
  ├── PlaySongPanel.tsx (NEW)
  ├── PlaySongTabs.tsx (NEW)
  ├── CurrentChordDiagram.tsx (NEW)
  └── PlaySongFretboard.tsx (NEW - adapted from homepage)

hooks/
  └── usePlaybackState.ts (NEW)
```

## API Specifications

### PlaybackContext
```typescript
interface PlaybackContextValue {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  currentChord: ChordInstance | null;
  currentScale: ScaleModeInstance | null;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}
```

### Chord Tones Database API
```typescript
interface ChordTonesEntry {
  rootNote: string;
  quality: string;
  notes: string[];
  intervals: number[];
  chordTones: {
    root: string;
    third?: string;
    fifth?: string;
    seventh?: string;
    ninth?: string;
    eleventh?: string;
    thirteenth?: string;
  };
}

function getChordTones(chordSymbol: string): ChordTonesEntry | null;
function getAllChordTypes(): string[];
```

## Component Specifications

### PlaySongPanel
**Purpose**: Container for Play Song functionality
**Location**: Left of Chord Progressions panel in ChordProgressionBuilder

**Props**:
```typescript
interface PlaySongPanelProps {
  currentChords: ChordInstance[];
  currentScales: ScaleModeInstance[];
  currentKey: string;
  isPlaying: boolean;
  currentTime: number;
  tuning: string[];
  stringCount: number;
  theme: ThemeConfig;
}
```

### CurrentChordDiagram
**Purpose**: Display current chord voicing during playback

**Features**:
- Shows chord diagram for active chord
- Displays chord symbol/name
- Updates in real-time during playback
- Shows "No Chord" state when between chords
- Positioned left of fretboard

### PlaySongFretboard
**Purpose**: Fretboard with real-time chord tone and scale highlighting

**Features**:
- Highlights current chord tones
- Shows current scale notes
- Updates during playback
- Maintains user preferences (colors, glow, etc.)
- Supports "Only Chord Tones" mode

## Utilities

### getCurrentChord
```typescript
function getCurrentChord(
  chords: ChordInstance[],
  currentTime: number
): ChordInstance | null {
  return chords.find(chord =>
    currentTime >= chord.startTime &&
    currentTime < chord.startTime + chord.duration
  ) || null;
}
```

### getCurrentScale
```typescript
function getCurrentScale(
  scales: ScaleModeInstance[],
  currentTime: number
): ScaleModeInstance | null {
  return scales.find(scale =>
    currentTime >= scale.startTime &&
    currentTime < scale.startTime + scale.duration
  ) || null;
}
```

## Chord Types to Include

Based on Add Chord modal, generate database for:
- Major, Minor, Diminished, Augmented
- Major 7th, Minor 7th, Dominant 7th, Diminished 7th, Half-Diminished 7th
- Major 9th, Minor 9th, Dominant 9th
- Major 11th, Minor 11th, Dominant 11th
- Major 13th, Minor 13th, Dominant 13th
- Sus2, Sus4
- 6th, Minor 6th
- Add9, Minor Add9

For all 12 root notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B

Total: ~20 qualities × 12 notes = ~240 chord entries

## Layout Design

```
┌─────────────────────────────────────────────────────────────┐
│ Chord Progression Builder                                   │
├─────────────────────────────────────────────────────────────┤
│ Timeline (Chords + Scales)                                  │
├──────────────────────┬──────────────────────────────────────┤
│ Play Song            │ Chord Progressions                   │
│ ┌──────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ [Chord Diagram]  │ │ │ AI-Based | Genre-Based           │ │
│ │                  │ │ └──────────────────────────────────┘ │
│ │     Cmaj7        │ │                                      │
│ │                  │ │                                      │
│ └──────────────────┘ │                                      │
│                      │                                      │
│ [Fretboard Display]  │                                      │
│                      │                                      │
│ [Chord Tones Panel]  │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

## Success Criteria

1. ✅ Chord tones database generated with all chord types
2. ✅ Fretboard updates in real-time during playback
3. ✅ Chord diagram shows current chord voicing
4. ✅ Scale highlighting updates with scale track
5. ✅ Smooth transitions between chords
6. ✅ No performance issues during playback
7. ✅ User preferences persist (colors, glow, etc.)
8. ✅ Works with all chord types in Add Chord modal

