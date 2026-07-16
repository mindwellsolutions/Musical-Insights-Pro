# Triad & CAGED System Development Blueprint

## Overview
Comprehensive triad visualization and CAGED system for guitar fretboard with selectable chord tones, position-based color coding, and interactive learning features.

## Phase 1: Chord Tone Selection Enhancement

### Task 1.1: Update Chord Tones UI for Individual Selection
**File**: `components/SongProgressionChordTonesTabs.tsx`
- Add individual checkboxes for each chord tone (Root, 3rd, 5th, 7th)
- Track selected chord tones in state array
- Update visual display to show selected/deselected state
- Pass selected chord tones to fretboard component

### Task 1.2: Update Fretboard to Filter by Selected Chord Tones
**File**: `components/Fretboard.tsx`
- Accept `selectedChordToneTypes` prop (array of 'root' | 'third' | 'fifth' | 'seventh')
- Filter displayed chord tones based on selection
- Maintain glow effects only for selected tones

### Task 1.3: Update Parent Components
**Files**: `app/page.tsx`, `components/chord-progression/PlaySongPanel.tsx`
- Add state for selected chord tone types
- Pass selection state through component hierarchy
- Ensure persistence with localStorage

## Phase 2: Triad Database & Theory Engine

### Task 2.1: Create Triad Theory Library
**File**: `lib/triad-theory.ts`
- Define triad types: Major, Minor, Diminished, Augmented
- Calculate triad notes from root note
- Define interval patterns for each triad type
- Export triad quality determination functions

### Task 2.2: Create Triad Position Calculator
**File**: `lib/triad-positions.ts`
- Calculate all triad positions across fretboard
- Identify CAGED shapes (C, A, G, E, D forms)
- Group positions by CAGED shape
- Calculate inversions (root position, 1st inversion, 2nd inversion)
- Assign unique colors to each position grouping
- Calculate difficulty ratings for each position

### Task 2.3: Create Triad Database Generator
**File**: `scripts/generateTriadDatabase.ts`
- Generate comprehensive triad database for all 12 root notes
- Include all CAGED positions and inversions
- Calculate fret positions for standard tuning (extensible to other tunings)
- Output JSON database file

### Task 2.4: Generate Triad Database
**File**: `public/data/triads/triad-database.json`
- Run generator script
- Verify database completeness and accuracy
- Structure: root note → triad type → CAGED shape → positions

## Phase 3: Triad Visualization Components

### Task 3.1: Create Triad Selector Component
**File**: `components/TriadSelector.tsx`
- Root note selector (12 notes)
- Triad type selector (Major, Minor, Dim, Aug)
- CAGED shape filter (show all or specific shapes)
- Inversion filter (root, 1st, 2nd, all)
- Position range selector (frets 0-12, 0-24, etc.)
- Visual preview of selected triad

### Task 3.2: Create CAGED Shape Legend
**File**: `components/CAGEDLegend.tsx`
- Display CAGED shape names with colors
- Toggle visibility for each shape
- Show shape diagrams/patterns
- Educational tooltips explaining each shape

### Task 3.3: Create Triad Fretboard Display
**File**: `components/TriadFretboard.tsx`
- Extend existing Fretboard component
- Color-code notes by CAGED position
- Show position groupings with matching colors
- Highlight root notes distinctly
- Display inversion information
- Show finger positions (optional)

## Phase 4: CAGED System Integration

### Task 4.1: Create CAGED Pattern Library
**File**: `lib/caged-patterns.ts`
- Define CAGED shape patterns for triads
- Define CAGED shape patterns for full chords
- Map scale patterns to CAGED shapes
- Calculate connecting patterns between shapes
- Export pattern visualization data

### Task 4.2: Create CAGED Visualization Overlay
**File**: `components/CAGEDOverlay.tsx`
- Visual guides showing CAGED shape boundaries
- Connecting lines between adjacent shapes
- Shape name labels on fretboard
- Toggle for showing/hiding overlay
- Opacity control for overlay

### Task 4.3: CAGED Navigation System
**File**: `components/CAGEDNavigator.tsx`
- Navigate between CAGED shapes
- Show current shape context
- Highlight transition notes between shapes
- Practice mode for shape transitions

## Phase 5: Triad Tab Integration

### Task 5.1: Create Triad Tab Component
**File**: `components/TriadTab.tsx`
- Main container for triad functionality
- Integrate TriadSelector
- Integrate CAGEDLegend
- Integrate CAGED toggle controls
- State management for all triad settings

### Task 5.2: Update Tabbed Interface
**File**: `components/SongProgressionChordTonesTabs.tsx`
- Add "Triads" tab next to "Chord Tones" tab
- Implement tab switching logic
- Maintain separate state for each tab
- Ensure smooth transitions

### Task 5.3: Update Main Page Integration
**File**: `app/page.tsx`
- Add triad state management
- Connect triad tab to fretboard
- Implement mode switching (scales/chord tones/triads)
- Persist triad settings to localStorage

## Phase 6: Advanced Features

### Task 6.1: Triad-to-Chord Relationships
**File**: `lib/triad-chord-relationships.ts`
- Map triads to related full chords
- Show chord extensions from triad base
- Calculate voice leading between triads and chords
- Suggest chord progressions using triads

### Task 6.2: Practice Mode Features
**File**: `components/TriadPracticeMode.tsx`
- Random triad position generator
- Quiz mode for identifying positions
- Timed challenges
- Progress tracking
- Difficulty levels

### Task 6.3: CAGED Learning Path
**File**: `components/CAGEDLearningPath.tsx`
- Structured lessons for each CAGED shape
- Progressive difficulty
- Interactive exercises
- Visual feedback and scoring
- Achievement system

## Phase 7: Color Coding System

### Task 7.1: Define Triad Color Palette
**File**: `lib/triad-colors.ts`
- Define distinct colors for each CAGED position
- Ensure accessibility (colorblind-friendly)
- Define color intensity levels
- Export color constants and utilities

### Task 7.2: Implement Position-Based Coloring
**File**: `components/TriadFretboard.tsx`
- Apply colors based on CAGED position
- Group notes by position with matching colors
- Maintain root note distinction
- Support color customization

### Task 7.3: Color Legend and Controls
**File**: `components/TriadColorControls.tsx`
- Display color legend
- Toggle colors on/off
- Adjust color intensity
- Custom color picker for each position

## Phase 8: Educational Features

### Task 8.1: Triad Information Panel
**File**: `components/TriadInfoPanel.tsx`
- Display current triad theory
- Show interval structure
- Explain CAGED shape context
- Provide usage tips and musical context

### Task 8.2: Interactive Tooltips
**File**: `components/TriadTooltips.tsx`
- Hover tooltips on fretboard notes
- Show note name, interval, and position
- Display finger suggestions
- Link to related educational content

### Task 8.3: Video Tutorial Integration
**File**: `components/TriadTutorials.tsx`
- Embed tutorial videos
- Link to specific CAGED shapes
- Progressive learning path
- External resource links

## Phase 9: Performance Optimization

### Task 9.1: Optimize Triad Calculations
- Memoize triad position calculations
- Cache database queries
- Lazy load triad data
- Implement virtual scrolling for large datasets

### Task 9.2: Optimize Rendering
- Use React.memo for expensive components
- Implement shouldComponentUpdate where needed
- Optimize SVG rendering for fretboard
- Reduce re-renders with proper state management

## Phase 10: Testing & Polish

### Task 10.1: Unit Tests
- Test triad calculation functions
- Test CAGED pattern generation
- Test color assignment logic
- Test database queries

### Task 10.2: Integration Tests
- Test tab switching
- Test fretboard updates
- Test state persistence
- Test user interactions

### Task 10.3: User Experience Polish
- Smooth animations
- Loading states
- Error handling
- Responsive design
- Mobile optimization
- Accessibility improvements

## Data Structures

### Triad Database Schema
```typescript
interface TriadDatabase {
  version: string;
  lastUpdated: string;
  triads: {
    [rootNote: string]: {
      [triadType: string]: {
        notes: string[];
        cagedPositions: CAGEDPosition[];
      };
    };
  };
}

interface CAGEDPosition {
  shape: 'C' | 'A' | 'G' | 'E' | 'D';
  positions: TriadPosition[];
  color: string;
  difficulty: number;
}

interface TriadPosition {
  inversion: 'root' | 'first' | 'second';
  fretRange: [number, number];
  notes: FretNote[];
  fingerPositions?: number[];
}

interface FretNote {
  note: string;
  stringIndex: number;
  fret: number;
  interval: 'root' | 'third' | 'fifth';
  isRoot: boolean;
}
```

## Color Palette for CAGED Positions
- **C Shape**: `#FF6B6B` (Coral Red)
- **A Shape**: `#4ECDC4` (Turquoise)
- **G Shape**: `#FFE66D` (Sunny Yellow)
- **E Shape**: `#95E1D3` (Mint Green)
- **D Shape**: `#C7CEEA` (Lavender Blue)

## Implementation Order
1. Phase 1: Chord Tone Selection (Foundation)
2. Phase 2: Triad Database (Core Data)
3. Phase 7: Color System (Visual Foundation)
4. Phase 3: Triad Components (UI)
5. Phase 4: CAGED Integration (Advanced Features)
6. Phase 5: Tab Integration (User Access)
7. Phase 6: Advanced Features (Enhancement)
8. Phase 8: Educational Features (Learning)
9. Phase 9: Performance (Optimization)
10. Phase 10: Testing & Polish (Quality)

