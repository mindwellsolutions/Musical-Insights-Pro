# Song Builder - Triads & CAGED Integration Blueprint

## Executive Summary

This blueprint outlines the comprehensive development plan to integrate the Triads & CAGED fretboard system into the Song Builder's "Play Song" tab. The goal is to allow users to visualize their chord progressions and associated scales/modes from the timeline UI using the same dual-fretboard display (1st fretboard for triads, 2nd fretboard for scales) that currently exists in the main Triads & CAGED mode.

## Core Requirements

### 1. Dual Fretboard Display in Play Song Tab
- **Current State**: Play Song tab shows a single fretboard with chord tones and scale notes
- **Target State**: Display TWO fretboards (1st and 2nd) similar to Triads & CAGED mode
  - **1st Fretboard**: Shows song chord progression triads with nearby neighborhood groupings
  - **2nd Fretboard**: Shows associated scales filtered by CAGED regions from 1st fretboard

### 2. Song Chord Progression Display
- Replace "Nearby Diatonic Chords" section with "Song Chord Progression" when in Song Builder context
- Display chord progression from the active verse's timeline
- Show chords as colorful buttons with dropdown voicing selectors
- Update fretboards when user clicks different verse tabs

### 3. Real-Time Playback Integration
- When playback is active or user clicks chord blocks in timeline:
  - Highlight the current chord in the Song Chord Progression display
  - Update 1st fretboard to show triad positions for current chord
  - Update 2nd fretboard to show scale notes (if scale is assigned in timeline)
  - Filter scale notes by CAGED regions matching the selected triad position

### 4. Voicing Selection & Customization
- Each chord button in Song Chord Progression has a dropdown arrow
- Clicking dropdown opens voicing selector modal (reuse existing ChordVoicingSelector)
- User can select different voicings for each chord
- Selected voicings update the 1st fretboard display
- Right sidebar chord diagrams update to reflect custom voicings

### 5. Verse Tab Switching
- Each verse tab can have its own chord progression and scale assignments
- Clicking a verse tab updates:
  - Song Chord Progression display
  - 1st fretboard triad positions
  - 2nd fretboard scale notes
  - Nearby triad neighborhood groupings

## Architecture Overview

### Component Hierarchy
```
ChordProgressionBuilder
└── GeneratorPanel
    └── ChordProgressionGenerator
        └── PlaySongPanel (ENHANCED)
            ├── SongProgressionDisplay (NEW)
            │   ├── ChordProgressionButtons (NEW)
            │   └── ChordVoicingSelector (EXISTING - reused)
            ├── DualFretboardDisplay (NEW)
            │   ├── TriadFretboard (1st - NEW)
            │   │   ├── Fretboard (EXISTING)
            │   │   ├── CAGEDFretboardOverlay (EXISTING)
            │   │   └── TriadPositionMarkers (NEW)
            │   └── ScaleFretboard (2nd - NEW)
            │       ├── Fretboard (EXISTING)
            │       ├── CAGEDFretboardOverlay (EXISTING)
            │       └── ScaleNoteMarkers (NEW)
            └── ChordDiagramSidebar (EXISTING - enhanced)
```

### Data Flow
```
Timeline UI (ChordProgressionTrack + ScaleModeTrack)
    ↓
Active Verse State (chordProgression[], scaleModeAssignments[])
    ↓
PlaySongPanel (receives currentChords, currentScales, currentTime)
    ↓
SongProgressionDisplay (displays chord buttons)
    ↓
DualFretboardDisplay (calculates triad positions & scale notes)
    ↓
Fretboards (render with CAGED filtering)
```

## Detailed Component Specifications

### 1. PlaySongPanel (ENHANCED)

**File**: `components/chord-progression/PlaySongPanel.tsx`

**Current Responsibilities**:
- Display single fretboard with chord tones and scale notes
- Update based on playback time
- Show current chord display

**New Responsibilities**:
- Display dual fretboards (1st for triads, 2nd for scales)
- Show Song Chord Progression section
- Manage selected triad position state
- Manage custom voicing selections per chord
- Coordinate updates between chord progression, fretboards, and sidebar

**New State**:
```typescript
const [selectedTriadPosition, setSelectedTriadPosition] = useState<TriadPosition | null>(null);
const [customVoicings, setCustomVoicings] = useState<Map<string, ChordVoicing>>(new Map());
const [selectedChordIndex, setSelectedChordIndex] = useState<number>(0);
```

**New Props**:
```typescript
interface PlaySongPanelProps {
  // ... existing props
  activeVerse: Verse; // Full verse object with chord progression and scales
  onVoicingChange?: (chordId: string, voicing: ChordVoicing) => void;
}
```

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ Song Chord Progression                                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                │
│ │ C  │ │ Am │ │ F  │ │ G  │  (colorful buttons with ▼)    │
│ └────┘ └────┘ └────┘ └────┘                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 1st Fretboard - Triads & Nearby Neighborhood               │
│ [Fretboard with triad positions + CAGED overlay]           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 2nd Fretboard - Associated Scales (CAGED Filtered)         │
│ [Fretboard with scale notes filtered by CAGED regions]     │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. SongProgressionDisplay (NEW COMPONENT)

**File**: `components/chord-progression/SongProgressionDisplay.tsx`

**Purpose**: Display the chord progression from the timeline as interactive buttons

**Props**:
```typescript
interface SongProgressionDisplayProps {
  chords: ChordInstance[];
  selectedChordIndex: number;
  onChordSelect: (index: number) => void;
  onVoicingChange: (chordIndex: number, voicing: ChordVoicing) => void;
  customVoicings: Map<string, ChordVoicing>;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  currentTime?: number; // For highlighting during playback
  isPlaying?: boolean;
}
```

**Features**:
- Display chord buttons in horizontal row
- Color-code buttons using NOTE_COLORS based on root note
- Show dropdown arrow (▼) on each button
- Highlight currently selected chord
- Highlight currently playing chord during playback
- Open ChordVoicingSelector modal when dropdown clicked

**UI Behavior**:
- Click on chord button body → Select chord and update fretboards
- Click on dropdown arrow → Open voicing selector for that chord
- During playback → Auto-highlight current chord based on currentTime

**Styling**:
- Use gradient backgrounds matching NOTE_COLORS
- Active chord: larger scale, brighter glow
- Playing chord: pulsing animation
- Hover: slight scale increase

---

### 3. DualFretboardDisplay (NEW COMPONENT)

**File**: `components/chord-progression/DualFretboardDisplay.tsx`

**Purpose**: Container for the two fretboards with coordinated state

**Props**:
```typescript
interface DualFretboardDisplayProps {
  selectedChord: ChordInstance | null;
  selectedScale: ScaleModeInstance | null;
  selectedTriadPosition: TriadPosition | null;
  onTriadPositionSelect: (position: TriadPosition) => void;
  customVoicing?: ChordVoicing;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  showCAGEDGuide: boolean;
  selectedCAGEDShapes: CAGEDShapeName[];
}
```

**Responsibilities**:
1. Calculate triad positions for selected chord
2. Calculate nearby neighborhood chords (diatonic chords in same key)
3. Filter scale notes by CAGED regions from selected triad position
4. Render both fretboards with proper overlays
5. Handle triad position selection on 1st fretboard
6. Update 2nd fretboard when triad position changes

**State Management**:
```typescript
const [triadPositions, setTriadPositions] = useState<TriadPosition[]>([]);
const [nearbyChords, setNearbyChords] = useState<NearbyChord[]>([]);
const [scaleNotePositions, setScaleNotePositions] = useState<NotePosition[]>([]);
const [cagedRegions, setCAGEDRegions] = useState<ShapeRegion[]>([]);
```

**Data Calculation Flow**:
```
1. selectedChord changes
   ↓
2. Calculate all triad positions for chord (using calculateTriadPositions)
   ↓
3. Find nearby diatonic chords (using findAllDiatonicChordsWithNearestVoicings)
   ↓
4. If selectedTriadPosition exists:
   - Get CAGED shape for that position
   - Calculate CAGED regions (using useCAGED hook)
   ↓
5. If selectedScale exists:
   - Get all scale notes (using getScaleNotes)
   - Filter by CAGED regions
   - Convert to NotePosition[]
   ↓
6. Render both fretboards
```

---

### 4. TriadFretboard (NEW COMPONENT)

**File**: `components/chord-progression/TriadFretboard.tsx`

**Purpose**: First fretboard showing triad positions and nearby neighborhood

**Features**:
- Display all triad positions for selected chord
- Show nearby diatonic chord positions (faded/ghosted)
- Highlight selected triad position
- Show CAGED overlay regions
- Clickable triad positions to select
- Color-code by CAGED shape when CAGED Guide enabled

**Rendering Logic**:
```typescript
// 1. Get triad positions for main chord
const mainTriadPositions = calculateTriadPositions(
  selectedChord.rootNote,
  selectedChord.quality === 'major' ? 'major' : 'minor',
  24
);

// 2. Get nearby chord positions (ghosted)
const nearbyPositions = nearbyChords.flatMap(chord =>
  calculateTriadPositions(chord.rootNote, chord.quality, 24)
);

// 3. Convert to NotePosition[] for Fretboard component
const notePositions = [
  ...convertTriadPositionsToNotePositions(mainTriadPositions, 'full'),
  ...convertTriadPositionsToNotePositions(nearbyPositions, 'ghost')
];

// 4. Calculate CAGED regions if selectedTriadPosition exists
const cagedRegions = selectedTriadPosition
  ? getCAGEDRegionsForVoicing(selectedTriadPosition)
  : [];
```

**Click Handling**:
```typescript
const handleTriadVoicingClick = (position: TriadPosition) => {
  onTriadPositionSelect(position);
  // This will trigger update to 2nd fretboard via parent state
};
```

---

### 5. ScaleFretboard (NEW COMPONENT)

**File**: `components/chord-progression/ScaleFretboard.tsx`

**Purpose**: Second fretboard showing scale notes filtered by CAGED regions

**Features**:
- Display scale notes from selected scale in timeline
- Filter notes to only show those within CAGED regions from 1st fretboard
- Show CAGED overlay regions (matching 1st fretboard)
- Color-code scale notes
- Highlight root note of scale

**Filtering Logic**:
```typescript
// 1. Get all scale notes
const allScaleNotes = getScaleNotes(
  selectedScale.rootNote,
  selectedScale.scaleName
);

// 2. Get CAGED regions from selected triad position
const cagedRegions = selectedTriadPosition
  ? getCAGEDRegionsForVoicing(selectedTriadPosition)
  : [];

// 3. Filter scale notes to only those within CAGED regions
const filteredNotePositions = allScaleNotes.flatMap(note => {
  const positions = getAllPositionsForNote(note, tuning, 24);
  return positions.filter(pos =>
    isPositionInCAGEDRegions(pos, cagedRegions)
  );
});
```

**Helper Function**:
```typescript
function isPositionInCAGEDRegions(
  position: { stringIndex: number; fretNumber: number },
  regions: ShapeRegion[]
): boolean {
  return regions.some(region =>
    position.fretNumber >= region.startFret &&
    position.fretNumber <= region.endFret
  );
}
```

---

### 6. ChordDiagramSidebar (ENHANCED)

**File**: `components/chord-neighborhood/ChordDiagramSidebar.tsx`

**Current State**: Shows chord diagrams for nearby diatonic chords

**Enhancements Needed**:
- Accept custom voicings from Song Chord Progression
- Display custom voicings when user has selected them via dropdown
- Update diagrams when voicing changes
- Show indicator when voicing is custom vs. default

**New Props**:
```typescript
interface ChordDiagramSidebarProps {
  // ... existing props
  customVoicings?: Map<string, ChordVoicing>; // Map of chordId -> custom voicing
  showCustomIndicator?: boolean;
}
```

**Rendering Logic**:
```typescript
const getVoicingForChord = (chord: NearbyChord): ChordVoicing => {
  // Priority 1: Custom voicing from user selection
  if (customVoicings?.has(chord.chordSymbol)) {
    return customVoicings.get(chord.chordSymbol)!;
  }

  // Priority 2: Selected voicing from chord object
  if (chord.selectedVoicing) {
    return chord.selectedVoicing;
  }

  // Priority 3: Nearest voicing
  return chord.nearestVoicing;
};
```

---

## State Management & Data Flow

### Global State (in PlaySongPanel)

```typescript
interface PlaySongState {
  // Chord progression from timeline
  chords: ChordInstance[];
  scales: ScaleModeInstance[];

  // Selection state
  selectedChordIndex: number;
  selectedTriadPosition: TriadPosition | null;

  // Custom voicings per chord
  customVoicings: Map<string, ChordVoicing>;

  // CAGED settings
  showCAGEDGuide: boolean;
  selectedCAGEDShapes: CAGEDShapeName[];

  // Playback state
  isPlaying: boolean;
  currentTime: number;
}
```

### State Update Triggers

1. **Verse Tab Change**:
   ```typescript
   useEffect(() => {
     // Reset state when verse changes
     setSelectedChordIndex(0);
     setSelectedTriadPosition(null);
     setCustomVoicings(new Map());
   }, [activeVerse.id]);
   ```

2. **Chord Selection**:
   ```typescript
   const handleChordSelect = (index: number) => {
     setSelectedChordIndex(index);
     // Auto-select first triad position for new chord
     const chord = chords[index];
     const positions = calculateTriadPositions(chord.rootNote, chord.quality, 24);
     if (positions.length > 0) {
       setSelectedTriadPosition(positions[0]);
     }
   };
   ```

3. **Playback Update**:
   ```typescript
   useEffect(() => {
     if (isPlaying) {
       const currentChord = getCurrentChord(chords, currentTime);
       if (currentChord) {
         const index = chords.findIndex(c => c.id === currentChord.id);
         if (index !== -1 && index !== selectedChordIndex) {
           handleChordSelect(index);
         }
       }
     }
   }, [currentTime, isPlaying]);
   ```

4. **Voicing Change**:
   ```typescript
   const handleVoicingChange = (chordIndex: number, voicing: ChordVoicing) => {
     const chord = chords[chordIndex];
     setCustomVoicings(prev => {
       const updated = new Map(prev);
       updated.set(chord.id, voicing);
       return updated;
     });

     // Update triad position to match new voicing
     const triadPosition = convertVoicingToTriadPosition(voicing);
     setSelectedTriadPosition(triadPosition);
   };
   ```

---

## Integration with Existing Systems

### 1. Triads & CAGED System Integration

**Reuse Existing Components**:
- `Fretboard.tsx` - Core fretboard rendering
- `CAGEDFretboardOverlay.tsx` - CAGED region overlays
- `useCAGED.ts` - CAGED calculation hook
- `calculateTriadPositions()` - Triad position calculation
- `ChordVoicingSelector.tsx` - Voicing selection modal

**Reuse Existing Functions**:
```typescript
// From lib/triad-positions.ts
import { calculateTriadPositions, TriadPosition } from '@/lib/triad-positions';

// From lib/caged/useCAGED.ts
import { useCAGED, ShapeRegion } from '@/lib/caged/useCAGED';

// From lib/music-theory/neighborhood
import {
  findAllDiatonicChordsWithNearestVoicings,
  NearbyChord
} from '@/lib/music-theory/neighborhood';

// From lib/musicTheory.ts
import { getScaleNotes } from '@/lib/musicTheory';
```

### 2. Timeline Integration

**Data Source**: Active verse from ChordProgressionBuilder
```typescript
// In ChordProgressionBuilder.tsx
const activeVerse = verses.find(v => v.id === activeVerseId);

// Pass to GeneratorPanel
<GeneratorPanel
  activeVerse={activeVerse}
  // ... other props
/>
```

**Timeline Click Handling**:
```typescript
// In TimelineVisualization.tsx
const handleChordClick = (chord: ChordInstance) => {
  // Notify PlaySongPanel of chord selection
  onChordClick?.(chord);
};
```

**Playback Synchronization**:
```typescript
// In PlaySongPanel.tsx
useEffect(() => {
  if (isPlaying) {
    // Get current chord based on playback time
    const currentChord = getCurrentChord(currentChords, currentTime);

    // Get current scale based on playback time
    const currentScale = getCurrentScale(currentScales, currentTime);

    // Update displays
    updateFretboardsForChordAndScale(currentChord, currentScale);
  }
}, [currentTime, isPlaying, currentChords, currentScales]);
```

### 3. Chord Neighborhood System Integration

**Calculate Nearby Chords**:
```typescript
const calculateNearbyChords = (
  selectedChord: ChordInstance,
  selectedPosition: TriadPosition,
  key: string
): NearbyChord[] => {
  // Convert triad position to anchor voicing
  const anchorVoicing = convertTriadPositionToAnchorVoicing(selectedPosition);

  // Get key mode from chord quality
  const keyMode = selectedChord.quality === 'minor' ? 'minor' : 'major';

  // Find all diatonic chords with nearest voicings
  return findAllDiatonicChordsWithNearestVoicings(
    anchorVoicing,
    key,
    keyMode
  );
};
```

**Display in Song Chord Progression**:
- Show nearby chords as faded/ghosted buttons below main progression
- Allow user to add nearby chords to progression via drag-and-drop
- Highlight common tones between chords

---

## UI/UX Design Specifications

### 1. Song Chord Progression Section

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│ Song Chord Progression                                      │
│                                                             │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                    │
│ │  C   │  │  Am  │  │  F   │  │  G   │                    │
│ │  ▼   │  │  ▼   │  │  ▼   │  │  ▼   │                    │
│ └──────┘  └──────┘  └──────┘  └──────┘                    │
│   4 beats  4 beats   4 beats   4 beats                     │
│                                                             │
│ Nearby Diatonic Chords (click to add)                      │
│ ┌──────┐  ┌──────┐  ┌──────┐                              │
│ │  Dm  │  │  Em  │  │ Bdim │  (ghosted/faded)             │
│ └──────┘  └──────┘  └──────┘                              │
└─────────────────────────────────────────────────────────────┘
```

**Chord Button Styling**:
- Background: Gradient using NOTE_COLORS[rootNote]
- Border: 2px solid with brighter shade
- Shadow: Glow effect matching root note color
- Font: Bold, white text for chord symbol
- Size: 80px width x 60px height
- Hover: Scale 1.05, increase glow
- Active: Scale 1.1, brighter glow, border highlight
- Playing: Pulsing animation (scale 1.0 → 1.05 → 1.0)

**Duration Display**:
- Small text below button showing beat count
- Gray color (#888)
- Font size: 10px

**Dropdown Arrow**:
- Position: Bottom-right corner of button
- Size: 12px x 12px
- Color: White with 80% opacity
- Hover: 100% opacity, slight scale increase
- Click: Opens ChordVoicingSelector modal

### 2. Dual Fretboard Layout

**Spacing & Sizing**:
```
Song Chord Progression: 120px height
Gap: 20px
1st Fretboard: 300px height
Gap: 20px
2nd Fretboard: 300px height
Total: ~760px height
```

**Fretboard Headers**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🎸 Triads & Nearby Neighborhood                            │
│ Position: C Major - CAGED Shape: C                         │
└─────────────────────────────────────────────────────────────┘
```

**CAGED Overlay**:
- Same styling as main Triads & CAGED mode
- Regions highlighted with shape colors
- Opacity: 20% for background, 60% for borders
- Labels: Shape name (C, A, G, E, D) in top-left of region

### 3. Triad Position Selection

**Visual Feedback**:
- Unselected positions: Normal triad note markers
- Hovered position: All 3 notes scale 1.2, glow effect
- Selected position: All 3 notes with bright border ring, larger scale (1.3)
- Cursor: Pointer on hover

**Selection Indicator**:
- Draw connecting lines between the 3 notes of selected position
- Line color: White with 60% opacity
- Line width: 2px
- Animation: Fade in over 200ms

### 4. Scale Note Filtering

**Visual States**:
- Notes in CAGED region: Full opacity (100%)
- Notes outside CAGED region: Hidden (not rendered)
- Root note: Larger size, distinct color ring
- Scale degree indicators: Small numbers inside note markers

**Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│ No scale assigned to current chord                         │
│                                                             │
│ Add a scale in the timeline to see scale notes here        │
│                                                             │
│ [+ Add Scale] button                                       │
└─────────────────────────────────────────────────────────────┘
```

### 5. Responsive Behavior

**Minimum Width**: 800px
**Scroll Behavior**:
- Song Chord Progression: Horizontal scroll if too many chords
- Fretboards: Vertical scroll if needed
- Sidebar: Fixed position, always visible

**Collapse States**:
- Option to collapse 2nd fretboard if no scale assigned
- Option to collapse Song Chord Progression to compact mode
- Keyboard shortcut: `T` to toggle fretboards

---

## Performance Optimization

### 1. Memoization Strategy

```typescript
// Memoize triad position calculations
const triadPositions = useMemo(() => {
  if (!selectedChord) return [];
  return calculateTriadPositions(
    selectedChord.rootNote,
    selectedChord.quality === 'minor' ? 'minor' : 'major',
    24
  );
}, [selectedChord?.rootNote, selectedChord?.quality]);

// Memoize nearby chord calculations
const nearbyChords = useMemo(() => {
  if (!selectedTriadPosition || !selectedChord) return [];
  return calculateNearbyChords(selectedChord, selectedTriadPosition, currentKey);
}, [selectedTriadPosition, selectedChord, currentKey]);

// Memoize scale note filtering
const filteredScaleNotes = useMemo(() => {
  if (!selectedScale || !cagedRegions.length) return [];
  return filterScaleNotesByCAGEDRegions(selectedScale, cagedRegions);
}, [selectedScale, cagedRegions]);
```

### 2. Lazy Loading

```typescript
// Lazy load ChordVoicingSelector modal
const ChordVoicingSelector = lazy(() =>
  import('@/components/chord-neighborhood/ChordVoicingSelector')
);

// Lazy load chord diagram sidebar
const ChordDiagramSidebar = lazy(() =>
  import('@/components/chord-neighborhood/ChordDiagramSidebar')
);
```

### 3. Debouncing

```typescript
// Debounce playback updates to avoid excessive re-renders
const debouncedCurrentTime = useDebounce(currentTime, 50);

useEffect(() => {
  updateFretboardsForPlayback(debouncedCurrentTime);
}, [debouncedCurrentTime]);
```

### 4. Virtual Scrolling

```typescript
// For long chord progressions, use virtual scrolling
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={120}
  itemCount={chords.length}
  itemSize={100}
  width="100%"
  layout="horizontal"
>
  {({ index, style }) => (
    <ChordButton
      key={chords[index].id}
      chord={chords[index]}
      style={style}
    />
  )}
</FixedSizeList>
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

**Goal**: Set up component structure and data flow

**Tasks**:
1. Create `SongProgressionDisplay.tsx` component
   - Render chord buttons from timeline data
   - Implement basic click handling
   - Add styling with NOTE_COLORS

2. Create `DualFretboardDisplay.tsx` container
   - Set up state management for dual fretboards
   - Implement data flow between components
   - Add basic layout structure

3. Enhance `PlaySongPanel.tsx`
   - Add new state variables (selectedTriadPosition, customVoicings)
   - Integrate SongProgressionDisplay
   - Integrate DualFretboardDisplay
   - Remove old single fretboard

4. Update `GeneratorPanel.tsx` and `ChordProgressionGenerator.tsx`
   - Pass activeVerse data to PlaySongPanel
   - Add necessary props

**Deliverables**:
- Basic component structure in place
- Data flowing from timeline to PlaySongPanel
- Chord buttons rendering correctly
- Two fretboards rendering (even if empty)

**Testing**:
- Verify chord progression displays from timeline
- Verify verse tab switching updates chord progression
- Verify component hierarchy is correct

---

### Phase 2: Triad Fretboard Implementation (Week 2)

**Goal**: Implement 1st fretboard with triad positions

**Tasks**:
1. Create `TriadFretboard.tsx` component
   - Calculate triad positions for selected chord
   - Convert to NotePosition[] for Fretboard component
   - Implement click handling for position selection
   - Add CAGED overlay integration

2. Implement triad position calculation
   - Reuse `calculateTriadPositions()` from lib/triad-positions.ts
   - Filter by CAGED shapes if enabled
   - Handle custom voicings

3. Add nearby neighborhood display
   - Calculate nearby diatonic chords
   - Render as ghosted positions on fretboard
   - Color-code by chord function (I, IV, V, etc.)

4. Implement position selection
   - Visual feedback on hover
   - Selection state management
   - Update parent state on selection

**Deliverables**:
- 1st fretboard showing triad positions
- Clickable triad positions
- CAGED overlay working
- Nearby chords displayed

**Testing**:
- Verify triad positions are accurate
- Verify CAGED filtering works
- Verify position selection updates state
- Verify nearby chords are correct for key

---

### Phase 3: Scale Fretboard Implementation (Week 3)

**Goal**: Implement 2nd fretboard with CAGED-filtered scales

**Tasks**:
1. Create `ScaleFretboard.tsx` component
   - Get scale notes from timeline scale assignment
   - Filter by CAGED regions from selected triad position
   - Render filtered notes on fretboard
   - Add CAGED overlay (matching 1st fretboard)

2. Implement CAGED region filtering
   - Get CAGED regions from selected triad position
   - Filter scale notes to only those in regions
   - Handle case when no triad position selected (show all notes)

3. Add scale degree indicators
   - Calculate scale degrees for each note
   - Display as small numbers inside note markers
   - Color-code by scale degree function

4. Handle empty states
   - Show message when no scale assigned
   - Provide "Add Scale" button
   - Handle case when no CAGED regions (show all notes)

**Deliverables**:
- 2nd fretboard showing filtered scale notes
- CAGED filtering working correctly
- Scale degree indicators
- Empty state handling

**Testing**:
- Verify scale notes are correct
- Verify CAGED filtering is accurate
- Verify scale degrees are correct
- Verify empty states display properly

---

### Phase 4: Voicing Selection Integration (Week 4)

**Goal**: Implement custom voicing selection and display

**Tasks**:
1. Add dropdown arrows to chord buttons
   - Position in bottom-right corner
   - Click handling to open modal
   - Prevent chord selection when clicking arrow

2. Integrate ChordVoicingSelector modal
   - Pass current chord data
   - Handle voicing selection
   - Update customVoicings state
   - Update triad position to match voicing

3. Update ChordDiagramSidebar
   - Accept customVoicings prop
   - Display custom voicings when available
   - Add custom indicator badge
   - Update diagrams on voicing change

4. Implement voicing persistence
   - Store custom voicings in verse state
   - Save/load with project
   - Reset on verse change (optional)

**Deliverables**:
- Dropdown arrows on chord buttons
- ChordVoicingSelector modal working
- Custom voicings updating fretboards
- Chord diagrams showing custom voicings

**Testing**:
- Verify voicing selector opens correctly
- Verify voicing selection updates fretboards
- Verify chord diagrams update
- Verify voicings persist across selections

---

### Phase 5: Playback Integration (Week 5)

**Goal**: Synchronize with timeline playback

**Tasks**:
1. Implement playback synchronization
   - Listen to currentTime updates
   - Calculate current chord from timeline
   - Calculate current scale from timeline
   - Update fretboards in real-time

2. Add visual playback indicators
   - Highlight current chord in Song Chord Progression
   - Pulsing animation on playing chord
   - Progress indicator showing position in chord

3. Handle playback state changes
   - Auto-select chord when playback starts
   - Update triad position when chord changes
   - Smooth transitions between chords

4. Optimize performance
   - Debounce currentTime updates
   - Memoize calculations
   - Prevent unnecessary re-renders

**Deliverables**:
- Real-time playback synchronization
- Visual playback indicators
- Smooth chord transitions
- Optimized performance

**Testing**:
- Verify playback updates fretboards correctly
- Verify visual indicators work
- Verify performance is smooth (60fps)
- Verify no memory leaks during playback

---

### Phase 6: Polish & Refinement (Week 6)

**Goal**: Final polish, edge cases, and user experience

**Tasks**:
1. Add keyboard shortcuts
   - Arrow keys to navigate chords
   - Space to play/pause
   - T to toggle fretboards
   - V to open voicing selector

2. Implement drag-and-drop
   - Drag nearby chords to add to progression
   - Reorder chords in progression
   - Visual feedback during drag

3. Add tooltips and help
   - Tooltip on chord buttons showing info
   - Help icon explaining features
   - Tutorial overlay for first-time users

4. Handle edge cases
   - Empty chord progression
   - No scales assigned
   - Invalid chord symbols
   - Very long progressions (100+ chords)

5. Accessibility improvements
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

**Deliverables**:
- Keyboard shortcuts working
- Drag-and-drop functional
- Tooltips and help system
- Edge cases handled
- Accessibility features

**Testing**:
- Verify keyboard shortcuts work
- Verify drag-and-drop works
- Verify tooltips display correctly
- Verify edge cases don't crash
- Verify accessibility with screen reader

---

## Testing Strategy

### Unit Tests

**Components to Test**:
1. `SongProgressionDisplay`
   - Renders correct number of chord buttons
   - Highlights selected chord
   - Opens voicing selector on dropdown click
   - Updates on chord selection

2. `DualFretboardDisplay`
   - Calculates triad positions correctly
   - Filters scale notes by CAGED regions
   - Updates on state changes
   - Handles empty states

3. `TriadFretboard`
   - Renders triad positions accurately
   - Handles position selection
   - Shows nearby chords
   - CAGED overlay displays correctly

4. `ScaleFretboard`
   - Filters scale notes correctly
   - Shows scale degrees
   - Handles empty scale state
   - CAGED overlay matches 1st fretboard

**Test Files**:
```
components/chord-progression/__tests__/
├── SongProgressionDisplay.test.tsx
├── DualFretboardDisplay.test.tsx
├── TriadFretboard.test.tsx
└── ScaleFretboard.test.tsx
```

### Integration Tests

**Scenarios to Test**:
1. Verse tab switching
   - Changes chord progression
   - Resets triad position
   - Updates fretboards

2. Chord selection
   - Updates 1st fretboard
   - Calculates nearby chords
   - Updates 2nd fretboard if scale exists

3. Voicing selection
   - Opens modal
   - Updates custom voicing
   - Updates fretboards
   - Updates chord diagrams

4. Playback synchronization
   - Updates current chord
   - Highlights playing chord
   - Updates fretboards in real-time

5. CAGED filtering
   - Filters scale notes correctly
   - Updates when triad position changes
   - Handles no CAGED regions

**Test File**:
```
components/chord-progression/__tests__/PlaySongPanel.integration.test.tsx
```

### End-to-End Tests

**User Flows to Test**:
1. Create chord progression → Switch to Play Song tab → Select chord → Select triad position → View filtered scales
2. Create chord progression → Add scales → Play song → Verify real-time updates
3. Select chord → Open voicing selector → Choose voicing → Verify fretboard updates
4. Switch between verse tabs → Verify progression updates
5. Long progression (50+ chords) → Verify performance

**Test File**:
```
e2e/song-builder-triads-caged.spec.ts
```

### Performance Tests

**Metrics to Measure**:
- Initial render time: < 500ms
- Chord selection response: < 100ms
- Playback update rate: 60fps
- Memory usage: < 100MB increase
- Voicing selector open time: < 200ms

**Test File**:
```
performance/song-builder-performance.test.ts
```

---

## Data Structures & Type Definitions

### New Types

```typescript
// Song Chord Progression Display
interface SongChordButton {
  chord: ChordInstance;
  index: number;
  isSelected: boolean;
  isPlaying: boolean;
  customVoicing?: ChordVoicing;
  color: string; // From NOTE_COLORS
}

// Triad Position with CAGED info
interface EnhancedTriadPosition extends TriadPosition {
  cagedRegions: ShapeRegion[];
  nearbyChords: NearbyChord[];
  isSelected: boolean;
}

// Filtered Scale Notes
interface FilteredScaleNote extends NotePosition {
  scaleDegree: number;
  isInCAGEDRegion: boolean;
  cagedShape?: CAGEDShapeName;
}

// Custom Voicing Storage
interface CustomVoicingMap {
  [chordId: string]: {
    voicing: ChordVoicing;
    timestamp: number;
    source: 'user' | 'auto';
  };
}
```

### State Interfaces

```typescript
interface PlaySongPanelState {
  // Selection
  selectedChordIndex: number;
  selectedTriadPosition: TriadPosition | null;

  // Custom voicings
  customVoicings: Map<string, ChordVoicing>;

  // UI state
  voicingSelectorOpen: boolean;
  voicingSelectorChordIndex: number | null;

  // CAGED settings
  showCAGEDGuide: boolean;
  selectedCAGEDShapes: CAGEDShapeName[];

  // Display options
  showNearbyChords: boolean;
  showScaleDegrees: boolean;
  fretboardLayout: 'stacked' | 'side-by-side';
}
```

---

## API & Function Specifications

### Core Calculation Functions

#### 1. Calculate Triad Positions for Chord
```typescript
/**
 * Get all triad positions for a chord from the timeline
 * @param chord - ChordInstance from timeline
 * @param maxFret - Maximum fret to calculate (default 24)
 * @param filterByCAGED - Optional CAGED shapes to filter by
 * @returns Array of triad positions
 */
function getTriadPositionsForChord(
  chord: ChordInstance,
  maxFret: number = 24,
  filterByCAGED?: CAGEDShapeName[]
): TriadPosition[] {
  const quality = chord.quality === 'minor' ? 'minor' : 'major';
  const positions = calculateTriadPositions(chord.rootNote, quality, maxFret);

  if (filterByCAGED && filterByCAGED.length > 0) {
    return positions.filter(pos =>
      pos.cagedShape && filterByCAGED.includes(pos.cagedShape)
    );
  }

  return positions;
}
```

#### 2. Filter Scale Notes by CAGED Regions
```typescript
/**
 * Filter scale notes to only those within CAGED regions
 * @param scale - ScaleModeInstance from timeline
 * @param cagedRegions - CAGED regions from selected triad position
 * @param tuning - Guitar tuning
 * @returns Filtered note positions
 */
function filterScaleNotesByCAGEDRegions(
  scale: ScaleModeInstance,
  cagedRegions: ShapeRegion[],
  tuning: string[]
): FilteredScaleNote[] {
  // Get all scale notes
  const scaleNotes = getScaleNotes(scale.rootNote, scale.scaleName);

  // Get all positions for each note
  const allPositions: FilteredScaleNote[] = [];

  scaleNotes.forEach((note, index) => {
    const positions = getAllPositionsForNote(note, tuning, 24);

    positions.forEach(pos => {
      const isInRegion = cagedRegions.some(region =>
        pos.fretNumber >= region.startFret &&
        pos.fretNumber <= region.endFret
      );

      if (isInRegion || cagedRegions.length === 0) {
        allPositions.push({
          ...pos,
          scaleDegree: index + 1,
          isInCAGEDRegion: isInRegion,
          cagedShape: cagedRegions.find(r =>
            pos.fretNumber >= r.startFret && pos.fretNumber <= r.endFret
          )?.shapeName
        });
      }
    });
  });

  return allPositions;
}
```

#### 3. Get Nearby Chords for Song Progression
```typescript
/**
 * Calculate nearby diatonic chords for song progression display
 * @param selectedChord - Currently selected chord
 * @param selectedPosition - Selected triad position
 * @param key - Song key
 * @param keyMode - Major or minor
 * @returns Array of nearby chords
 */
function getNearbyChordsSongProgression(
  selectedChord: ChordInstance,
  selectedPosition: TriadPosition,
  key: string,
  keyMode: 'major' | 'minor'
): NearbyChord[] {
  // Convert triad position to anchor voicing
  const anchorVoicing: AnchorVoicing = {
    rootNote: selectedPosition.rootNote,
    quality: selectedPosition.triadType,
    stringSet: [
      selectedPosition.stringPositions[0].stringIndex + 1,
      selectedPosition.stringPositions[1].stringIndex + 1,
      selectedPosition.stringPositions[2].stringIndex + 1
    ],
    inversion: selectedPosition.inversion,
    fretPosition: selectedPosition.fretPosition,
    frets: selectedPosition.stringPositions.map(sp => sp.fret),
    notes: selectedPosition.stringPositions.map(sp => sp.note)
  };

  // Get all diatonic chords with nearest voicings
  return findAllDiatonicChordsWithNearestVoicings(
    anchorVoicing,
    key,
    keyMode
  );
}
```

#### 4. Convert Custom Voicing to Triad Position
```typescript
/**
 * Convert a custom chord voicing to a triad position
 * @param voicing - ChordVoicing from voicing selector
 * @param chord - Original chord instance
 * @returns TriadPosition or null if not convertible
 */
function convertVoicingToTriadPosition(
  voicing: ChordVoicing,
  chord: ChordInstance
): TriadPosition | null {
  // Extract first 3 notes from voicing
  if (voicing.positions.length < 3) return null;

  const stringPositions: StringPosition[] = voicing.positions
    .slice(0, 3)
    .map(pos => ({
      stringIndex: pos.string - 1, // Convert to 0-based
      fret: pos.fret,
      note: pos.note,
      chordTone: determineChordTone(pos.note, chord.notes)
    }));

  // Determine inversion
  const inversion = determineInversion(stringPositions, chord.rootNote);

  // Determine CAGED shape
  const cagedShape = determineCCAGEDShape(
    voicing.startFret,
    stringPositions[0].stringIndex
  );

  return {
    rootNote: chord.rootNote,
    triadType: chord.quality === 'minor' ? 'minor' : 'major',
    inversion,
    cagedShape,
    fretPosition: voicing.startFret,
    stringSet: Math.floor(stringPositions[0].stringIndex / 3) + 1,
    stringPositions,
    positionIndex: 0 // Will be recalculated
  };
}
```

#### 5. Get Current Chord and Scale from Playback
```typescript
/**
 * Get the current chord and scale based on playback time
 * @param chords - All chords in progression
 * @param scales - All scales in progression
 * @param currentTime - Current playback time in beats
 * @returns Object with current chord and scale
 */
function getCurrentChordAndScale(
  chords: ChordInstance[],
  scales: ScaleModeInstance[],
  currentTime: number
): {
  chord: ChordInstance | null;
  scale: ScaleModeInstance | null;
} {
  const currentChord = getCurrentChord(chords, currentTime);
  const currentScale = getCurrentScale(scales, currentTime);

  return {
    chord: currentChord,
    scale: currentScale
  };
}
```

---

## Technical Considerations

### 1. Performance Optimization

**Critical Performance Areas**:
1. **Triad Position Calculation**: Can generate 100+ positions per chord
   - Solution: Memoize calculations, cache results
   - Use Web Workers for heavy calculations (optional)

2. **CAGED Region Filtering**: Iterates through all scale notes and positions
   - Solution: Pre-calculate position-to-region mapping
   - Use spatial indexing for fast lookups

3. **Real-time Playback Updates**: Updates every 50-100ms during playback
   - Solution: Debounce updates, batch state changes
   - Use requestAnimationFrame for smooth animations

4. **Fretboard Rendering**: Two fretboards with 100+ note markers each
   - Solution: Use React.memo for note markers
   - Virtualize off-screen frets (optional)

**Optimization Techniques**:
```typescript
// 1. Memoize expensive calculations
const triadPositions = useMemo(() =>
  getTriadPositionsForChord(selectedChord, 24, selectedCAGEDShapes),
  [selectedChord, selectedCAGEDShapes]
);

// 2. Debounce playback updates
const debouncedTime = useDebounce(currentTime, 50);

// 3. Batch state updates
const updateFretboards = useCallback((chord, scale, position) => {
  startTransition(() => {
    setSelectedChord(chord);
    setSelectedScale(scale);
    setSelectedTriadPosition(position);
  });
}, []);

// 4. Lazy load heavy components
const ChordVoicingSelector = lazy(() =>
  import('./ChordVoicingSelector')
);
```

### 2. Memory Management

**Potential Memory Issues**:
1. Large chord progressions (100+ chords)
2. Custom voicings map growing unbounded
3. Cached calculations not being cleared

**Solutions**:
```typescript
// 1. Limit custom voicings storage
const MAX_CUSTOM_VOICINGS = 50;

const addCustomVoicing = (chordId: string, voicing: ChordVoicing) => {
  setCustomVoicings(prev => {
    const updated = new Map(prev);

    // Remove oldest if at limit
    if (updated.size >= MAX_CUSTOM_VOICINGS) {
      const firstKey = updated.keys().next().value;
      updated.delete(firstKey);
    }

    updated.set(chordId, voicing);
    return updated;
  });
};

// 2. Clear cache on verse change
useEffect(() => {
  // Clear cached calculations
  triadPositionCache.clear();
  nearbyChordCache.clear();

  // Reset custom voicings (optional)
  setCustomVoicings(new Map());
}, [activeVerse.id]);

// 3. Use WeakMap for temporary data
const tempDataCache = new WeakMap<ChordInstance, TriadPosition[]>();
```

### 3. Browser Compatibility

**Target Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills Needed**:
- None (all features supported in target browsers)

**Fallbacks**:
- CSS Grid → Flexbox for older browsers
- CSS Custom Properties → Inline styles
- Intersection Observer → Scroll event listener

### 4. Accessibility

**WCAG 2.1 AA Compliance**:

1. **Keyboard Navigation**:
   ```typescript
   // Arrow keys to navigate chords
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'ArrowLeft') {
         selectPreviousChord();
       } else if (e.key === 'ArrowRight') {
         selectNextChord();
       } else if (e.key === 'Enter') {
         openVoicingSelector();
       }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [selectedChordIndex]);
   ```

2. **ARIA Labels**:
   ```tsx
   <button
     aria-label={`Chord ${chord.chordSymbol}, ${chord.duration} beats`}
     aria-pressed={isSelected}
     role="button"
     tabIndex={0}
   >
     {chord.chordSymbol}
   </button>
   ```

3. **Screen Reader Support**:
   ```tsx
   <div role="region" aria-label="Song Chord Progression">
     <div aria-live="polite" aria-atomic="true">
       {isPlaying && `Now playing: ${currentChord?.chordSymbol}`}
     </div>
   </div>
   ```

4. **Focus Management**:
   ```typescript
   // Return focus to chord button after closing modal
   const handleVoicingSelectorClose = () => {
     setVoicingSelectorOpen(false);
     chordButtonRefs.current[selectedChordIndex]?.focus();
   };
   ```

### 5. Error Handling

**Error Scenarios**:
1. Invalid chord symbols in timeline
2. Missing scale data
3. CAGED calculation failures
4. Voicing selector errors

**Error Handling Strategy**:
```typescript
// 1. Graceful degradation
const triadPositions = useMemo(() => {
  try {
    return getTriadPositionsForChord(selectedChord, 24);
  } catch (error) {
    console.error('Failed to calculate triad positions:', error);
    return []; // Return empty array, show message to user
  }
}, [selectedChord]);

// 2. Error boundaries
class FretboardErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load fretboard. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// 3. User-friendly error messages
{error && (
  <div className="error-message">
    <AlertCircle className="w-5 h-5" />
    <p>Unable to display chord positions. Try selecting a different chord.</p>
  </div>
)}
```

---

## File Structure

```
components/chord-progression/
├── PlaySongPanel.tsx (ENHANCED)
├── SongProgressionDisplay.tsx (NEW)
├── DualFretboardDisplay.tsx (NEW)
├── TriadFretboard.tsx (NEW)
├── ScaleFretboard.tsx (NEW)
└── __tests__/
    ├── PlaySongPanel.test.tsx
    ├── SongProgressionDisplay.test.tsx
    ├── DualFretboardDisplay.test.tsx
    ├── TriadFretboard.test.tsx
    └── ScaleFretboard.test.tsx

lib/chord-progression/
├── song-progression-utils.ts (NEW)
│   ├── getTriadPositionsForChord()
│   ├── filterScaleNotesByCAGEDRegions()
│   ├── getNearbyChordsSongProgression()
│   ├── convertVoicingToTriadPosition()
│   └── getCurrentChordAndScale()
└── __tests__/
    └── song-progression-utils.test.ts

hooks/chord-progression/
├── useSongProgression.ts (NEW)
├── useTriadPositionSelection.ts (NEW)
└── useCAGEDFiltering.ts (NEW)
```

---

## Success Criteria

### Functional Requirements
- ✅ Dual fretboards display in Play Song tab
- ✅ Song Chord Progression shows timeline chords
- ✅ Triad positions display on 1st fretboard
- ✅ Scale notes filtered by CAGED regions on 2nd fretboard
- ✅ Voicing selector opens from chord button dropdown
- ✅ Custom voicings update fretboards and diagrams
- ✅ Verse tab switching updates all displays
- ✅ Playback synchronization works in real-time
- ✅ Nearby diatonic chords display correctly

### Performance Requirements
- ✅ Initial render < 500ms
- ✅ Chord selection response < 100ms
- ✅ Playback updates at 60fps
- ✅ Memory usage increase < 100MB
- ✅ No memory leaks during extended use

### UX Requirements
- ✅ Intuitive chord button interactions
- ✅ Clear visual feedback for selections
- ✅ Smooth animations and transitions
- ✅ Responsive layout (min 800px width)
- ✅ Keyboard shortcuts functional
- ✅ Tooltips and help available

### Accessibility Requirements
- ✅ WCAG 2.1 AA compliant
- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels on all interactive elements
- ✅ Focus management working

---

## Conclusion

This blueprint provides a comprehensive development plan for integrating the Triads & CAGED system into the Song Builder's Play Song tab. The implementation is broken down into 6 phases over 6 weeks, with clear deliverables and testing criteria for each phase.

**Key Features**:
1. Dual fretboard display (triads + scales)
2. Song chord progression visualization
3. CAGED-filtered scale display
4. Custom voicing selection
5. Real-time playback synchronization
6. Nearby chord neighborhood display

**Technical Highlights**:
- Reuses existing components and functions
- Optimized for performance
- Accessible and keyboard-friendly
- Comprehensive error handling
- Well-tested with unit, integration, and E2E tests

**Next Steps**:
1. Review and approve blueprint
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on user feedback

---

## Appendix: Reference Documentation

### Related Blueprints
- `.blueprints/triad-caged-system.md` - Original Triads & CAGED system
- `.blueprints/chord-progression-builder-comprehensive-blueprint.md` - Song Builder architecture
- `.blueprints/chord-neighborhood-system.md` - Nearby chords system
- `.blueprints/play-song-realtime-fretboard.md` - Original Play Song panel

### Key Files to Reference
- `components/Fretboard.tsx` - Core fretboard component
- `components/CAGEDFretboardOverlay.tsx` - CAGED overlay rendering
- `lib/triad-positions.ts` - Triad calculation functions
- `lib/caged/useCAGED.ts` - CAGED system hook
- `lib/music-theory/neighborhood/` - Nearby chords logic
- `components/chord-neighborhood/ChordVoicingSelector.tsx` - Voicing selector modal

### External Resources
- [CAGED System Theory](https://en.wikipedia.org/wiki/CAGED_system)
- [Music Theory for Guitar](https://www.musictheory.net/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)







