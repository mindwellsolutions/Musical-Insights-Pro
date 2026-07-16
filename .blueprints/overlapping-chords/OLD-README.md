# Overlapping Chords Feature - Development Blueprint

## Overview
The Overlapping Chords feature allows users to discover all playable chords within specific CAGED shape areas or scale positions on the fretboard. This feature helps musicians find chords that fit within their current playing position or scale context.

## Feature Goals
1. Display all chords that can be played within selected CAGED areas
2. Display all chords that overlap with notes from a selected scale/mode
3. Provide two overlap modes:
   - **Complete Overlap**: All chord notes must be within the scale/CAGED area
   - **Partial Overlap**: 2 or more chord notes overlap with the scale/CAGED area
4. Allow multi-selection of chords for simultaneous display on fretboard
5. Preserve and restore fretboard state when toggling the feature on/off

## User Interface Design

### Main Toggle Section
- **Location**: Below the single fretboard (when Triads & CAGED is turned off)
- **Component**: Similar to "Recommended Scales" section
- **Title**: "Overlapping Chords"
- **Toggle**: On/Off switch to enable/disable the feature

### Mode Selection
Two primary modes:
1. **CAGED Mode**: Find chords within CAGED shape areas
2. **Scale Mode**: Find chords within scale note positions

### CAGED Mode UI
- **CAGED Shape Selector**: Multi-select checkboxes or toggle group
  - Options: C, A, G, E, D shapes
  - Allow selecting one or multiple shapes
  - Visual indicator for selected shapes
- **Position Selector**: Dropdown or slider to select fret position for each shape
- **Overlap Type**: Radio buttons
  - "Complete Overlap" (all chord notes within CAGED area)
  - "Partial Overlap" (2+ chord notes within CAGED area)

### Scale Mode UI
- **Scale Selector**: Dropdown linked to "Key & Scales" section at top of app
  - Auto-populate from current key/scale selection
  - Allow override selection
- **Position Selector**: Multi-select for scale positions/starting frets
  - Display available positions for selected scale
  - Allow selecting one or multiple positions
- **Overlap Type**: Radio buttons
  - "Complete Overlap" (all chord notes are scale notes)
  - "Partial Overlap" (2+ chord notes are scale notes)

### Chord Display Section
- **Layout**: Scrollable card list below the controls
- **Card Design**: Similar to song builder "Add Chord" modal
  - Chord symbol (e.g., "Cmaj", "Am", "G7")
  - Chord quality indicator (major, minor, diminished, augmented)
  - Number of overlapping notes badge
  - Fret position indicator
- **Left Sidebar Tabs**: Organize chords by category
  - "All Chords"
  - "Major"
  - "Minor"
  - "Diminished"
  - "Augmented"
  - "7th Chords" (if extended chords are included)
- **Interaction**:
  - Hover: Highlight chord on fretboard temporarily
  - Click: Select/deselect chord for persistent display
  - Multi-select: Allow selecting multiple chords simultaneously

### Fretboard Display Behavior
When Overlapping Chords is enabled:
1. **Save Current State**: Store current fretboard display to localStorage
2. **Display Mode**:
   - Show CAGED area(s) or scale notes on fretboard
   - When chord(s) selected: Overlay chord notes with distinct colors
3. **Color Coding**:
   - Each selected chord gets a unique color
   - Notes shared by multiple chords: Use circle border (existing pattern)
   - CAGED/Scale notes: Subtle background color or outline
4. **Restore State**: When feature is toggled off, restore original fretboard display

## Technical Architecture

### Data Structures

#### OverlappingChordsState
```typescript
interface OverlappingChordsState {
  enabled: boolean;
  mode: 'caged' | 'scale';
  overlapType: 'complete' | 'partial';
  
  // CAGED Mode
  selectedCagedShapes: CagedShape[];
  cagedPositions: Map<CagedShape, number>; // shape -> fret position
  
  // Scale Mode
  selectedScale: {
    key: string;
    mode: string;
  };
  selectedScalePositions: number[]; // starting fret positions
  
  // Selected chords for display
  selectedChords: OverlappingChord[];
  
  // Saved fretboard state
  savedFretboardState: FretboardState | null;
}
```

#### OverlappingChord
```typescript
interface OverlappingChord {
  id: string;
  rootNote: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  chordSymbol: string;
  fretPosition: number;
  notes: FretNote[];
  overlapCount: number; // number of notes that overlap
  color: string; // assigned color for display
}
```

#### CagedShape
```typescript
type CagedShape = 'C' | 'A' | 'G' | 'E' | 'D';
```

### Core Algorithms

#### 1. Find Chords in CAGED Area
```typescript
function findChordsInCagedArea(
  shapes: CagedShape[],
  positions: Map<CagedShape, number>,
  overlapType: 'complete' | 'partial'
): OverlappingChord[]
```
**Logic**:
- Get fret boundaries for each selected CAGED shape at specified position
- Generate all possible chord voicings (triads, 7ths, etc.)
- For each voicing, check if notes fall within CAGED boundaries
- Filter based on overlap type (complete vs partial)
- Return sorted by overlap count (descending)

#### 2. Find Chords in Scale
```typescript
function findChordsInScale(
  key: string,
  mode: string,
  positions: number[],
  overlapType: 'complete' | 'partial'
): OverlappingChord[]
```
**Logic**:
- Get scale notes for the selected key/mode
- Get fret positions where scale notes appear (for selected positions)
- Generate all possible chord voicings
- For each voicing, count how many notes are in the scale
- Filter based on overlap type
- Return sorted by overlap count (descending)

#### 3. Chord Overlap Detection
```typescript
function calculateChordOverlap(
  chordNotes: FretNote[],
  targetNotes: FretNote[] | FretBoundary
): number
```
**Logic**:
- Compare chord notes against target (scale notes or CAGED area)
- Return count of matching notes
- Handle enharmonic equivalents (e.g., C# = Db)

### State Management

#### LocalStorage Keys
- `overlapping-chords-state`: Main feature state
- `overlapping-chords-saved-fretboard`: Saved fretboard state
- `overlapping-chords-selected-chords`: Selected chord IDs

#### State Persistence
- Save state on every user interaction
- Restore state on page load
- Clear saved fretboard state when feature is disabled

### Component Structure

```
components/
  overlapping-chords/
    OverlappingChordsContainer.tsx       # Main container component
    OverlappingChordsToggle.tsx          # Toggle switch component
    ModeSelector.tsx                      # CAGED vs Scale mode selector
    CagedModeControls.tsx                 # CAGED shape/position selectors
    ScaleModeControls.tsx                 # Scale/position selectors
    OverlapTypeSelector.tsx               # Complete vs Partial selector
    ChordList.tsx                         # Scrollable chord card list
    ChordCard.tsx                         # Individual chord card
    ChordCategoryTabs.tsx                 # Left sidebar tabs

lib/
  music-theory/
    overlapping-chords/
      chord-finder.ts                     # Core chord finding algorithms
      caged-analyzer.ts                   # CAGED area analysis
      scale-analyzer.ts                   # Scale overlap analysis
      types.ts                            # TypeScript type definitions
```

## Implementation Details

### Phase 1: Core Library Functions

#### File: `lib/music-theory/overlapping-chords/types.ts`
Define all TypeScript interfaces and types:
- `OverlappingChordsState`
- `OverlappingChord`
- `CagedShape`
- `FretBoundary`
- `ChordQuality`
- `OverlapType`

#### File: `lib/music-theory/overlapping-chords/caged-analyzer.ts`
Implement CAGED-specific logic:
- `getCagedFretBoundaries(shape: CagedShape, position: number): FretBoundary`
  - Returns min/max fret and string boundaries for a CAGED shape
  - Use existing CAGED shape data from the app
- `isNoteInCagedArea(note: FretNote, boundaries: FretBoundary[]): boolean`
  - Check if a fret note falls within any CAGED boundary
- `getCagedAreaNotes(shapes: CagedShape[], positions: Map<CagedShape, number>): FretNote[]`
  - Get all fret positions within selected CAGED areas

#### File: `lib/music-theory/overlapping-chords/scale-analyzer.ts`
Implement scale-specific logic:
- `getScaleNotesOnFretboard(key: string, mode: string, positions: number[]): FretNote[]`
  - Get all fret positions where scale notes appear
  - Use existing scale generation from the app
- `isNoteInScale(note: string, scaleNotes: string[]): boolean`
  - Check if a note (accounting for enharmonics) is in the scale
- `getScalePositionBoundaries(key: string, mode: string, position: number): FretBoundary`
  - Get fret range for a scale position pattern

#### File: `lib/music-theory/overlapping-chords/chord-finder.ts`
Implement main chord finding algorithms:
- `findChordsInCagedArea()` - as specified above
- `findChordsInScale()` - as specified above
- `calculateChordOverlap()` - as specified above
- `generateAllChordVoicings(fretRange: [number, number]): ChordVoicing[]`
  - Generate all possible chord voicings within a fret range
  - Include triads (major, minor, diminished, augmented)
  - Optionally include 7th chords
  - Use existing voicing generation from `lib/music-theory/neighborhood/voicing-generator.ts`
- `filterChordsByOverlap(chords: ChordVoicing[], targetNotes: FretNote[], overlapType: OverlapType): OverlappingChord[]`
  - Filter chords based on complete or partial overlap
  - Complete: All chord notes must be in target
  - Partial: At least 2 chord notes must be in target

### Phase 2: State Management

#### File: `hooks/use-overlapping-chords.ts`
Custom React hook for state management:
```typescript
export function useOverlappingChords() {
  const [state, setState] = useState<OverlappingChordsState>(loadFromLocalStorage());

  // Actions
  const toggleEnabled = () => { /* ... */ };
  const setMode = (mode: 'caged' | 'scale') => { /* ... */ };
  const setOverlapType = (type: 'complete' | 'partial') => { /* ... */ };
  const toggleCagedShape = (shape: CagedShape) => { /* ... */ };
  const setCagedPosition = (shape: CagedShape, position: number) => { /* ... */ };
  const setScale = (key: string, mode: string) => { /* ... */ };
  const toggleScalePosition = (position: number) => { /* ... */ };
  const selectChord = (chord: OverlappingChord) => { /* ... */ };
  const deselectChord = (chordId: string) => { /* ... */ };
  const clearSelectedChords = () => { /* ... */ };

  // Computed values
  const availableChords = useMemo(() => {
    if (state.mode === 'caged') {
      return findChordsInCagedArea(/* ... */);
    } else {
      return findChordsInScale(/* ... */);
    }
  }, [state]);

  // Persist to localStorage
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  return { state, actions: { /* ... */ }, availableChords };
}
```

#### File: `hooks/use-fretboard-state.ts`
Hook for saving/restoring fretboard state:
```typescript
export function useFretboardState() {
  const saveFretboardState = (state: FretboardState) => {
    localStorage.setItem('overlapping-chords-saved-fretboard', JSON.stringify(state));
  };

  const restoreFretboardState = (): FretboardState | null => {
    const saved = localStorage.getItem('overlapping-chords-saved-fretboard');
    return saved ? JSON.parse(saved) : null;
  };

  const clearSavedState = () => {
    localStorage.removeItem('overlapping-chords-saved-fretboard');
  };

  return { saveFretboardState, restoreFretboardState, clearSavedState };
}
```

### Phase 3: UI Components

#### File: `components/overlapping-chords/OverlappingChordsContainer.tsx`
Main container component:
- Use `'use client'` directive
- Import `useOverlappingChords` hook
- Render toggle, mode selector, controls, and chord list
- Handle fretboard state save/restore on toggle
- Manage color assignment for selected chords

#### File: `components/overlapping-chords/OverlappingChordsToggle.tsx`
Toggle switch component:
- Use `Card` component from `@/components/ui/card`
- Use `Toggle` component from `@/components/ui/toggle`
- Display "Overlapping Chords" title
- Call `toggleEnabled` action on click
- Save current fretboard state when enabling
- Restore fretboard state when disabling

#### File: `components/overlapping-chords/ModeSelector.tsx`
Mode selection component:
- Use `ToggleGroup` from `@/components/ui/toggle-group`
- Two options: "CAGED Areas" and "Scale Notes"
- Call `setMode` action on change
- Clear selected chords when mode changes

#### File: `components/overlapping-chords/CagedModeControls.tsx`
CAGED mode controls:
- Use `Checkbox` from `@/components/ui/checkbox` for shape selection
- Display all 5 CAGED shapes (C, A, G, E, D)
- For each selected shape, show position slider/input
- Use `Slider` or `Input` from shadcn/ui
- Call `toggleCagedShape` and `setCagedPosition` actions

#### File: `components/overlapping-chords/ScaleModeControls.tsx`
Scale mode controls:
- Use `Select` from `@/components/ui/select` for scale selection
- Populate from current key/scale in app state
- Use `Checkbox` for position selection
- Display available positions (typically 5 positions for most scales)
- Call `setScale` and `toggleScalePosition` actions

#### File: `components/overlapping-chords/OverlapTypeSelector.tsx`
Overlap type selector:
- Use `RadioGroup` from `@/components/ui/radio-group`
- Two options: "Complete Overlap" and "Partial Overlap (2+ notes)"
- Call `setOverlapType` action on change

#### File: `components/overlapping-chords/ChordCategoryTabs.tsx`
Left sidebar tabs:
- Use `Tabs` component from `@/components/ui/tabs`
- Tabs: "All", "Major", "Minor", "Diminished", "Augmented"
- Filter `availableChords` based on selected tab
- Pass filtered chords to `ChordList`

#### File: `components/overlapping-chords/ChordList.tsx`
Scrollable chord list:
- Use `ScrollArea` from `@/components/ui/scroll-area`
- Map over filtered chords and render `ChordCard` for each
- Handle empty state with message "No chords found"
- Max height with scroll

#### File: `components/overlapping-chords/ChordCard.tsx`
Individual chord card:
- Use `Card` component from `@/components/ui/card`
- Display chord symbol (e.g., "Cmaj", "Am")
- Display quality badge using `Badge` from `@/components/ui/badge`
- Display overlap count badge
- Display fret position
- Handle hover: Temporarily show chord on fretboard
- Handle click: Toggle selection (call `selectChord` or `deselectChord`)
- Visual indicator for selected state (border, background color)
- Assign unique color to each selected chord

### Phase 4: Fretboard Integration

#### Fretboard Display Logic
When Overlapping Chords is enabled:

1. **Save Current State**:
   - Before showing overlapping chords, save current fretboard display
   - Store in localStorage via `useFretboardState` hook

2. **Display CAGED/Scale Notes**:
   - Show selected CAGED area(s) with subtle background color
   - OR show scale notes with subtle markers
   - Use existing fretboard rendering components

3. **Overlay Selected Chords**:
   - For each selected chord, render notes with assigned color
   - Use existing note rendering with color prop
   - For shared notes (multiple chords), use circle border pattern
   - Layer chord notes on top of CAGED/scale notes

4. **Hover Behavior**:
   - On chord card hover, temporarily overlay chord notes
   - Remove overlay when hover ends
   - Don't modify selected chords state

5. **Restore State**:
   - When feature is toggled off, restore original fretboard display
   - Clear saved state from localStorage

#### Color Assignment
- Define color palette for chord display:
  ```typescript
  const CHORD_COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];
  ```
- Assign colors sequentially as chords are selected
- Reuse colors if more than 8 chords selected

### Phase 5: Testing & Refinement

#### Test Cases
1. **CAGED Mode - Complete Overlap**:
   - Select C shape at position 0
   - Verify only chords fully within C shape area are shown
   - Select a chord, verify it displays correctly on fretboard

2. **CAGED Mode - Partial Overlap**:
   - Select C shape at position 0
   - Verify chords with 2+ notes in C shape area are shown
   - Verify overlap count is accurate

3. **Scale Mode - Complete Overlap**:
   - Select C major scale, position 1
   - Verify only diatonic chords (all notes in scale) are shown
   - Should show: C, Dm, Em, F, G, Am, Bdim

4. **Scale Mode - Partial Overlap**:
   - Select C major scale, position 1
   - Verify chords with 2+ notes in scale are shown
   - Should include chromatic chords with partial overlap

5. **Multi-Selection**:
   - Select 3 different chords
   - Verify each has unique color
   - Verify shared notes have circle border
   - Verify all chords display simultaneously

6. **State Persistence**:
   - Enable feature, select chords
   - Refresh page
   - Verify state is restored

7. **Fretboard State Save/Restore**:
   - Set up specific fretboard display
   - Enable Overlapping Chords
   - Disable Overlapping Chords
   - Verify original fretboard display is restored

## UI/UX Considerations

### Responsive Design
- Mobile: Stack controls vertically, use drawer for chord list
- Tablet: Side-by-side layout with collapsible chord list
- Desktop: Full side-by-side layout

### Performance
- Debounce chord finding when changing positions/shapes
- Virtualize chord list if more than 50 chords
- Memoize expensive calculations

### Accessibility
- Keyboard navigation for all controls
- ARIA labels for screen readers
- Focus management when toggling feature
- Color contrast for chord colors (WCAG AA)

### User Feedback
- Loading indicator when calculating chords
- Toast notification when no chords found
- Tooltip on hover showing chord notes
- Visual feedback for selected chords

## Integration Points

### Existing App Features
1. **Key & Scales Section**: Link scale selector to existing key/scale state
2. **CAGED System**: Use existing CAGED shape data and rendering
3. **Fretboard Component**: Integrate with existing fretboard rendering
4. **Song Builder Modal**: Reuse chord card design and interaction patterns
5. **Recommended Scales**: Follow similar UI/UX patterns

### Data Dependencies
- CAGED shape definitions and positions
- Scale generation algorithms
- Chord voicing generation
- Fretboard note rendering
- Color coding system for shared notes

## Future Enhancements
1. **Extended Chords**: Include 7th, 9th, 11th, 13th chords
2. **Chord Inversions**: Show different inversions of the same chord
3. **Voicing Preferences**: Filter by voicing type (open, closed, drop-2, etc.)
4. **Export**: Save selected chords to song builder or export as PDF
5. **Smart Suggestions**: AI-powered chord progression suggestions based on selected chords
6. **Audio Playback**: Play selected chords to hear how they sound
7. **Chord Diagrams**: Show chord diagrams in addition to fretboard display

## Completion Checklist
- [ ] Phase 1: Core library functions implemented and tested
- [ ] Phase 2: State management hooks created
- [ ] Phase 3: All UI components built
- [ ] Phase 4: Fretboard integration complete
- [ ] Phase 5: All test cases passing
- [ ] UI/UX polish and responsive design
- [ ] Accessibility audit complete
- [ ] Performance optimization
- [ ] Documentation updated
- [ ] User testing and feedback incorporated

