# Overlapping Chords System - Updated Development Blueprint

## Executive Summary

This blueprint defines the complete redesign of the Overlapping Chords feature to integrate seamlessly with the Triads & CAGED system, providing a dual-fretboard experience where users can discover chords that overlap with selected CAGED areas or scale/mode positions.

---

## Table of Contents

1. [Overview & Requirements](#overview--requirements)
2. [User Experience Flow](#user-experience-flow)
3. [GUI/UX Design Specifications](#guiux-design-specifications)
4. [Technical Architecture](#technical-architecture)
5. [Component Specifications](#component-specifications)
6. [State Management](#state-management)
7. [Fretboard Integration](#fretboard-integration)
8. [Implementation Phases](#implementation-phases)
9. [Testing Strategy](#testing-strategy)

---

## Overview & Requirements

### Core Concept

The Overlapping Chords system allows users to discover playable chords that share notes with:
- **CAGED Areas**: One or more CAGED shape regions on the fretboard
- **Scale/Mode Positions**: Specific fretboard positions of a scale/mode in a given key

### Key Requirements

1. **Dependency on Triads & CAGED**: Feature requires Triads & CAGED mode to be enabled
2. **Dual Fretboard Display**: Uses both 1st and 2nd fretboards
   - 1st Fretboard: Displays selected overlapping chords with color coding
   - 2nd Fretboard: Shows CAGED areas or scale/mode positions (context)
3. **Two Display Modes**:
   - **CAGED Mode**: Find chords overlapping with selected CAGED shape areas
   - **Scale/Mode Mode**: Find chords overlapping with scale/mode positions
4. **Overlap Criteria**:
   - **ALL notes**: Chord must use only notes from the selected area/scale
   - **TWO OR MORE notes**: Chord must share at least 2 notes with the area/scale
5. **Right Sidebar**: Modern, sleek chord browser with hover/click selection
6. **Color Coding**: Each chord gets a unique color; shared notes show multiple color rings

---

## User Experience Flow

### Activation Flow

```
1. User opens Menu dropdown
2. User sees "Triads & CAGED" toggle (existing)
3. Below it: "Overlapping Chords" toggle (NEW)
4. User toggles "Overlapping Chords" ON
   → If "Triads & CAGED" is OFF, automatically turn it ON
   → Dual fretboard view appears
   → "Triad Settings" card transforms to tabbed interface
   → Right sidebar appears with chord browser
```

### Interaction Flow

```
1. User selects display mode (CAGED or Scale/Mode)
2. User selects overlap criteria (ALL or TWO OR MORE)
3. User selects areas/positions:
   - CAGED Mode: Check one or more CAGED shapes (C, A, G, E, D)
   - Scale/Mode Mode: Check one or more fretboard positions (I, II, III, IV, V)
4. Right sidebar populates with matching chords
5. User hovers over chord in sidebar
   → Chord highlights on 1st fretboard (preview)
6. User clicks chord in sidebar
   → Chord locks onto 1st fretboard
   → User can select multiple chords
7. Selected chords display on 1st fretboard with:
   - Unique color per chord
   - Multi-color rings for shared notes
8. 2nd fretboard shows context (CAGED areas or scale positions)
```

---

## GUI/UX Design Specifications

### 1. Menu Dropdown Integration

**Location**: Main navigation menu (existing dropdown)

**Structure**:
```
┌─────────────────────────────────┐
│ Menu                            │
├─────────────────────────────────┤
│ ... existing items ...          │
├─────────────────────────────────┤
│ ☐ Triads & CAGED               │  ← Existing toggle
│ ☐ Overlapping Chords           │  ← NEW toggle (below Triads)
├─────────────────────────────────┤
│ ... other items ...             │
└─────────────────────────────────┘
```

**Behavior**:
- When "Overlapping Chords" is toggled ON:
  - If "Triads & CAGED" is OFF → automatically turn it ON
  - Show notification: "Triads & CAGED enabled for Overlapping Chords"
- When "Triads & CAGED" is toggled OFF:
  - If "Overlapping Chords" is ON → automatically turn it OFF
  - Show notification: "Overlapping Chords disabled (requires Triads & CAGED)"

**Visual Design**:
- Toggle switches with theme colors
- Indentation to show dependency (Overlapping Chords slightly indented)
- Disabled state styling when dependencies not met

---

### 2. Tabbed Settings Card

**Location**: Where "Triad Settings" currently appears (left side of dual fretboard)

**Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  [Triad Settings] [Overlapping Chords]                 │  ← Tab Headers
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TAB CONTENT AREA                                       │
│  (Shows either Triad Settings or Overlapping Chords)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tab 1: Triad Settings** (Existing content)
- All current triad settings controls
- Inversion selection
- CAGED shape filters
- Position counts
- etc.

**Tab 2: Overlapping Chords** (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ Display Mode                                            │
│ ○ CAGED Areas    ○ Scale/Mode Positions                │
├─────────────────────────────────────────────────────────┤
│ Overlap Criteria                                        │
│ ○ ALL notes      ○ TWO OR MORE notes                   │
├─────────────────────────────────────────────────────────┤
│ [CAGED Mode Controls] OR [Scale/Mode Controls]          │
│                                                         │
│ CAGED Mode:                                             │
│ ☐ C Shape  ☐ A Shape  ☐ G Shape  ☐ E Shape  ☐ D Shape │
│                                                         │
│ Scale/Mode Mode:                                        │
│ Current: C Major (auto-detected from app state)         │
│ ☐ Position I (Fret 0)                                  │
│ ☐ Position II (Fret 2)                                 │
│ ☐ Position III (Fret 4)                                │
│ ☐ Position IV (Fret 7)                                 │
│ ☐ Position V (Fret 9)                                  │
└─────────────────────────────────────────────────────────┘
```

**Visual Design**:
- Modern tab interface with smooth transitions
- Active tab: highlighted with accent color, bottom border
- Inactive tab: muted colors, hover effect
- Tab content: padded, organized sections
- Radio buttons for mode/criteria selection
- Checkboxes for area/position selection
- Consistent spacing and alignment
- Theme-aware colors (dark/light/midnight)

**Behavior**:
- Tabs switch instantly (no loading)
- Settings persist when switching tabs
- Overlapping Chords tab only visible when feature is enabled
- Auto-collapse/expand based on feature state

---

### 3. Right Sidebar - Chord Browser

**Location**: Right side of screen, adjacent to dual fretboard display

**Dimensions**:
- Width: 320px (fixed)
- Height: Full viewport height (scrollable)
- Position: Fixed right sidebar

**Structure**:
```
┌─────────────────────────────────────┐
│ Overlapping Chords                  │  ← Header
│ 24 chords found                     │  ← Count
├─────────────────────────────────────┤
│ Filter: [All ▼]                     │  ← Filter dropdown
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Cmaj                            │ │  ← Chord Card
│ │ Major                           │ │
│ │ 3 notes • Frets 0-3             │ │
│ │ [●] Selected                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Am                              │ │
│ │ Minor                           │ │
│ │ 3 notes • Frets 0-2             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Fmaj                            │ │
│ │ Major                           │ │
│ │ 4 notes • Frets 1-3             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ... (scrollable list)               │
│                                     │
├─────────────────────────────────────┤
│ [Clear All] (3 selected)            │  ← Footer
└─────────────────────────────────────┘
```

**Chord Card Design**:
```
┌─────────────────────────────────────┐
│ Cmaj                        [●]     │  ← Symbol + Selection indicator
│ Major                               │  ← Quality
│ 3 notes • Frets 0-3                 │  ← Info
│ ┌─┬─┬─┐                             │  ← Color indicator bar
│ │█│ │ │  (shows chord color)        │
│ └─┴─┴─┘                             │
└─────────────────────────────────────┘
```

**States**:
- **Default**: White/theme background, subtle border
- **Hover**: Slight elevation, accent border, chord previews on fretboard
- **Selected**: Accent background, checkmark icon, chord locked on fretboard
- **Multi-select**: Multiple cards can be selected simultaneously

**Filter Options**:
- All Chords
- Major
- Minor
- Diminished
- Augmented
- 7th Chords
- 9th Chords
- Extended Chords

**Behavior**:
- **Hover**: Preview chord on 1st fretboard (temporary, faded)
- **Click**: Toggle selection (lock chord on 1st fretboard)
- **Multi-select**: Can select multiple chords
- **Color assignment**: Each selected chord gets unique color from palette
- **Scroll**: Smooth scrolling for long lists
- **Filter**: Instant filtering without re-calculation
- **Clear All**: Deselects all chords at once

**Visual Design**:
- Modern card-based layout
- Smooth animations (hover, select)
- Color-coded selection indicators
- Responsive to theme changes
- Premium feel with subtle shadows and borders
- Compact but readable typography

---

### 4. Fretboard Display System

**1st Fretboard** (Top - Triads Fretboard):
- **Purpose**: Display selected overlapping chords
- **Rendering**:
  - Each chord rendered with unique color
  - Notes that belong to multiple chords: multi-color ring borders
  - Clear, vibrant colors for easy distinction
  - Clickable chord voicings (existing functionality preserved)

**2nd Fretboard** (Bottom - Scale/Pentatonic Fretboard):
- **Purpose**: Show context (CAGED areas or scale positions)
- **Rendering**:
  - **CAGED Mode**: Highlight selected CAGED shape areas (dimmed overlay)
  - **Scale/Mode Mode**: Show scale notes at selected positions (dimmed)
  - Provides visual context for where chords are being found

**Color Coding System**:
- **12-Color Palette** (existing):
  ```javascript
  const CHORD_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#6366f1', // indigo
    '#d946ef', // fuchsia
  ];
  ```
- **Assignment**: Sequential assignment as chords are selected
- **Shared Notes**: Render with multiple concentric rings (one per chord color)

**Shared Note Rendering**:
```
Single Chord Note:     Shared by 2 Chords:    Shared by 3 Chords:
     ┌───┐                  ┌───┐                  ┌───┐
     │ ● │                  │ ◉ │                  │ ◎ │
     └───┘                  └───┘                  └───┘
   (solid fill)         (2 color rings)        (3 color rings)
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Application (page.tsx)              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   Menu Toggle   Tabbed Card   Right Sidebar
   Component     Component     Component
        │            │            │
        │            │            │
        └────────────┴────────────┘
                     │
                     ▼
          Overlapping Chords Hook
          (useOverlappingChords)
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   Chord Finder              Fretboard
   Algorithms               Integration
```

### Data Flow

```
1. User Input (Menu/Tabs/Sidebar)
   ↓
2. State Update (useOverlappingChords hook)
   ↓
3. Chord Calculation (findChords algorithms)
   ↓
4. Color Assignment (assignChordColors)
   ↓
5. Fretboard Update (1st & 2nd fretboards)
   ↓
6. Sidebar Update (chord list)
```

---

## Component Specifications

### Component Hierarchy

```
OverlappingChordsSystem/
├── MenuToggle (in existing menu dropdown)
├── TabbedSettingsCard/
│   ├── TabHeader
│   ├── TriadSettingsTab (existing content)
│   └── OverlappingChordsTab/
│       ├── DisplayModeSelector
│       ├── OverlapCriteriaSelector
│       ├── CAGEDModeControls
│       └── ScaleModeControls
└── ChordBrowserSidebar/
    ├── SidebarHeader
    ├── FilterDropdown
    ├── ChordList/
    │   └── ChordCard (multiple)
    └── SidebarFooter
```

### Component Details

#### 1. MenuToggle Component

**File**: Modify existing menu component

**Props**:
```typescript
interface MenuToggleProps {
  showTriadMode: boolean;
  onTriadModeChange: (enabled: boolean) => void;
  overlappingChordsEnabled: boolean;
  onOverlappingChordsChange: (enabled: boolean) => void;
}
```

**Behavior**:
- Render "Overlapping Chords" toggle below "Triads & CAGED"
- When Overlapping Chords toggled ON:
  - If Triads & CAGED is OFF → set it to ON
  - Show toast notification
- When Triads & CAGED toggled OFF:
  - If Overlapping Chords is ON → set it to OFF
  - Show toast notification

---

#### 2. TabbedSettingsCard Component

**File**: `components/overlapping-chords/TabbedSettingsCard.tsx`

**Props**:
```typescript
interface TabbedSettingsCardProps {
  theme: ThemeConfig;
  overlappingChordsEnabled: boolean;
  activeTab: 'triad-settings' | 'overlapping-chords';
  onTabChange: (tab: 'triad-settings' | 'overlapping-chords') => void;

  // Triad Settings props (pass through)
  triadSettingsProps: TriadSettingsProps;

  // Overlapping Chords props
  overlappingChordsProps: OverlappingChordsTabProps;
}
```

**Structure**:
```tsx
<div className="settings-card">
  {/* Tab Headers */}
  <div className="tab-headers">
    <TabButton
      active={activeTab === 'triad-settings'}
      onClick={() => onTabChange('triad-settings')}
    >
      Triad Settings
    </TabButton>

    {overlappingChordsEnabled && (
      <TabButton
        active={activeTab === 'overlapping-chords'}
        onClick={() => onTabChange('overlapping-chords')}
      >
        Overlapping Chords
      </TabButton>
    )}
  </div>

  {/* Tab Content */}
  <div className="tab-content">
    {activeTab === 'triad-settings' && (
      <TriadSettingsTab {...triadSettingsProps} />
    )}

    {activeTab === 'overlapping-chords' && (
      <OverlappingChordsTab {...overlappingChordsProps} />
    )}
  </div>
</div>
```

**Styling**:
- Modern tab interface with smooth transitions
- Active tab: accent color bottom border, bold text
- Inactive tab: muted text, hover effect
- Content area: padded, smooth fade-in animation
- Responsive to theme changes

---

#### 3. OverlappingChordsTab Component

**File**: `components/overlapping-chords/OverlappingChordsTab.tsx`

**Props**:
```typescript
interface OverlappingChordsTabProps {
  theme: ThemeConfig;
  displayMode: 'caged' | 'scale';
  onDisplayModeChange: (mode: 'caged' | 'scale') => void;
  overlapCriteria: 'all' | 'two-or-more';
  onOverlapCriteriaChange: (criteria: 'all' | 'two-or-more') => void;

  // CAGED Mode
  selectedCAGEDShapes: CAGEDShape[];
  onToggleCAGEDShape: (shape: CAGEDShape) => void;

  // Scale Mode
  currentKey: string;
  currentScale: string;
  selectedPositions: number[];
  onTogglePosition: (position: number) => void;
}
```

**Structure**:
```tsx
<div className="overlapping-chords-tab">
  {/* Display Mode Selector */}
  <section>
    <label>Display Mode</label>
    <RadioGroup value={displayMode} onChange={onDisplayModeChange}>
      <Radio value="caged">CAGED Areas</Radio>
      <Radio value="scale">Scale/Mode Positions</Radio>
    </RadioGroup>
  </section>

  {/* Overlap Criteria Selector */}
  <section>
    <label>Overlap Criteria</label>
    <RadioGroup value={overlapCriteria} onChange={onOverlapCriteriaChange}>
      <Radio value="all">ALL notes</Radio>
      <Radio value="two-or-more">TWO OR MORE notes</Radio>
    </RadioGroup>
  </section>

  {/* Mode-Specific Controls */}
  {displayMode === 'caged' ? (
    <CAGEDModeControls
      selectedShapes={selectedCAGEDShapes}
      onToggleShape={onToggleCAGEDShape}
    />
  ) : (
    <ScaleModeControls
      currentKey={currentKey}
      currentScale={currentScale}
      selectedPositions={selectedPositions}
      onTogglePosition={onTogglePosition}
    />
  )}
</div>
```

---

#### 4. CAGEDModeControls Component

**File**: `components/overlapping-chords/CAGEDModeControls.tsx`

**Props**:
```typescript
interface CAGEDModeControlsProps {
  theme: ThemeConfig;
  selectedShapes: CAGEDShape[];
  onToggleShape: (shape: CAGEDShape) => void;
}
```

**Structure**:
```tsx
<div className="caged-mode-controls">
  <label>Select CAGED Shapes</label>
  <div className="shape-checkboxes">
    {['C', 'A', 'G', 'E', 'D'].map(shape => (
      <Checkbox
        key={shape}
        checked={selectedShapes.includes(shape)}
        onChange={() => onToggleShape(shape)}
        label={`${shape} Shape`}
      />
    ))}
  </div>
</div>
```

---

#### 5. ScaleModeControls Component

**File**: `components/overlapping-chords/ScaleModeControls.tsx`

**Props**:
```typescript
interface ScaleModeControlsProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  selectedPositions: number[];
  onTogglePosition: (position: number) => void;
}
```

**Structure**:
```tsx
<div className="scale-mode-controls">
  {/* Current Scale Display */}
  <div className="current-scale">
    <label>Current Scale</label>
    <div className="scale-display">
      {currentKey} {currentScale}
    </div>
  </div>

  {/* Position Checkboxes */}
  <label>Select Fretboard Positions</label>
  <div className="position-checkboxes">
    {SCALE_POSITIONS.map((position, index) => (
      <Checkbox
        key={position}
        checked={selectedPositions.includes(position)}
        onChange={() => onTogglePosition(position)}
        label={`Position ${index + 1} (Fret ${position})`}
      />
    ))}
  </div>
</div>
```

**Constants**:
```typescript
const SCALE_POSITIONS = [0, 2, 4, 7, 9]; // Standard 5 positions
```

---

#### 6. ChordBrowserSidebar Component

**File**: `components/overlapping-chords/ChordBrowserSidebar.tsx`

**Props**:
```typescript
interface ChordBrowserSidebarProps {
  theme: ThemeConfig;
  availableChords: OverlappingChord[];
  selectedChords: OverlappingChord[];
  hoveredChord: OverlappingChord | null;
  onChordHover: (chord: OverlappingChord | null) => void;
  onChordClick: (chord: OverlappingChord) => void;
  onClearAll: () => void;
}
```

**Structure**:
```tsx
<div className="chord-browser-sidebar">
  {/* Header */}
  <div className="sidebar-header">
    <h3>Overlapping Chords</h3>
    <span className="chord-count">{availableChords.length} chords found</span>
  </div>

  {/* Filter */}
  <div className="sidebar-filter">
    <FilterDropdown
      options={FILTER_OPTIONS}
      value={currentFilter}
      onChange={setCurrentFilter}
    />
  </div>

  {/* Chord List */}
  <div className="chord-list">
    {filteredChords.map(chord => (
      <ChordCard
        key={chord.id}
        chord={chord}
        isSelected={isChordSelected(chord)}
        isHovered={hoveredChord?.id === chord.id}
        onHover={() => onChordHover(chord)}
        onHoverEnd={() => onChordHover(null)}
        onClick={() => onChordClick(chord)}
        theme={theme}
      />
    ))}
  </div>

  {/* Footer */}
  {selectedChords.length > 0 && (
    <div className="sidebar-footer">
      <button onClick={onClearAll}>
        Clear All ({selectedChords.length} selected)
      </button>
    </div>
  )}
</div>
```

---

#### 7. ChordCard Component (Updated)

**File**: `components/overlapping-chords/ChordCard.tsx`

**Props**:
```typescript
interface ChordCardProps {
  theme: ThemeConfig;
  chord: OverlappingChord;
  isSelected: boolean;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}
```

**Structure**:
```tsx
<div
  className={`chord-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
  onMouseEnter={onHover}
  onMouseLeave={onHoverEnd}
  onClick={onClick}
>
  {/* Header Row */}
  <div className="card-header">
    <span className="chord-symbol">{chord.chordSymbol}</span>
    {isSelected && <CheckIcon />}
  </div>

  {/* Quality */}
  <div className="chord-quality">{chord.quality}</div>

  {/* Info */}
  <div className="chord-info">
    {chord.notes.length} notes • Frets {chord.fretRange[0]}-{chord.fretRange[1]}
  </div>

  {/* Color Indicator */}
  {isSelected && chord.color && (
    <div className="color-indicator">
      <div className="color-bar" style={{ backgroundColor: chord.color }} />
    </div>
  )}
</div>
```

**States**:
- Default: subtle border, white/theme background
- Hover: elevated shadow, accent border, scale-up animation
- Selected: accent background, checkmark, color indicator bar

---

## State Management

### Hook: useOverlappingChords (Updated)

**File**: `hooks/use-overlapping-chords.ts`

**Interface**:
```typescript
interface OverlappingChordsState {
  enabled: boolean;
  displayMode: 'caged' | 'scale';
  overlapCriteria: 'all' | 'two-or-more';

  // CAGED Mode
  selectedCAGEDShapes: CAGEDShape[];

  // Scale Mode
  selectedPositions: number[];

  // Selected chords
  selectedChords: OverlappingChord[];
  hoveredChord: OverlappingChord | null;
}

interface UseOverlappingChordsReturn {
  state: OverlappingChordsState;
  availableChords: OverlappingChord[];
  actions: {
    setEnabled: (enabled: boolean) => void;
    setDisplayMode: (mode: 'caged' | 'scale') => void;
    setOverlapCriteria: (criteria: 'all' | 'two-or-more') => void;
    toggleCAGEDShape: (shape: CAGEDShape) => void;
    togglePosition: (position: number) => void;
    toggleChordSelection: (chord: OverlappingChord) => void;
    setHoveredChord: (chord: OverlappingChord | null) => void;
    clearAllSelections: () => void;
  };
}
```

**Implementation**:
```typescript
export function useOverlappingChords(
  currentKey: string,
  currentScale: string,
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): UseOverlappingChordsReturn {
  const [state, setState] = useLocalStorage<OverlappingChordsState>(
    'overlapping-chords-state-v2',
    INITIAL_STATE
  );

  // Calculate available chords based on current settings
  const availableChords = useMemo(() => {
    if (!state.enabled) return [];

    if (state.displayMode === 'caged') {
      return findChordsInCAGEDAreas(
        state.selectedCAGEDShapes,
        state.overlapCriteria,
        stringCount,
        tuning
      );
    } else {
      return findChordsInScalePositions(
        currentKey,
        currentScale,
        state.selectedPositions,
        state.overlapCriteria,
        stringCount,
        tuning
      );
    }
  }, [
    state.enabled,
    state.displayMode,
    state.selectedCAGEDShapes,
    state.selectedPositions,
    state.overlapCriteria,
    currentKey,
    currentScale,
    stringCount,
    tuning
  ]);

  // Assign colors to selected chords
  const selectedChordsWithColors = useMemo(() => {
    return assignChordColors(state.selectedChords);
  }, [state.selectedChords]);

  // Actions
  const actions = useMemo(() => ({
    setEnabled: (enabled: boolean) => {
      setState(prev => ({ ...prev, enabled }));
    },

    setDisplayMode: (mode: 'caged' | 'scale') => {
      setState(prev => ({ ...prev, displayMode: mode, selectedChords: [] }));
    },

    setOverlapCriteria: (criteria: 'all' | 'two-or-more') => {
      setState(prev => ({ ...prev, overlapCriteria: criteria, selectedChords: [] }));
    },

    toggleCAGEDShape: (shape: CAGEDShape) => {
      setState(prev => ({
        ...prev,
        selectedCAGEDShapes: prev.selectedCAGEDShapes.includes(shape)
          ? prev.selectedCAGEDShapes.filter(s => s !== shape)
          : [...prev.selectedCAGEDShapes, shape],
        selectedChords: [] // Clear selections when changing areas
      }));
    },

    togglePosition: (position: number) => {
      setState(prev => ({
        ...prev,
        selectedPositions: prev.selectedPositions.includes(position)
          ? prev.selectedPositions.filter(p => p !== position)
          : [...prev.selectedPositions, position],
        selectedChords: [] // Clear selections when changing positions
      }));
    },

    toggleChordSelection: (chord: OverlappingChord) => {
      setState(prev => {
        const isSelected = prev.selectedChords.some(
          c => c.rootNote === chord.rootNote && c.quality === chord.quality
        );

        return {
          ...prev,
          selectedChords: isSelected
            ? prev.selectedChords.filter(
                c => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
              )
            : [...prev.selectedChords, chord]
        };
      });
    },

    setHoveredChord: (chord: OverlappingChord | null) => {
      setState(prev => ({ ...prev, hoveredChord: chord }));
    },

    clearAllSelections: () => {
      setState(prev => ({ ...prev, selectedChords: [], hoveredChord: null }));
    }
  }), [setState]);

  return {
    state: { ...state, selectedChords: selectedChordsWithColors },
    availableChords,
    actions
  };
}
```

---

## Fretboard Integration

### 1st Fretboard (Triads Fretboard)

**Purpose**: Display selected overlapping chords

**Data Structure**:
```typescript
interface FretboardChordData {
  chords: OverlappingChord[];
  hoveredChord: OverlappingChord | null;
}
```

**Rendering Logic**:
```typescript
function renderOverlappingChords(data: FretboardChordData) {
  // Combine selected chords + hovered chord (if any)
  const chordsToRender = data.hoveredChord
    ? [...data.chords, { ...data.hoveredChord, isPreview: true }]
    : data.chords;

  // Build note map with colors
  const noteMap = new Map<string, {
    note: FretNote;
    colors: string[];
    isPreview: boolean;
  }>();

  chordsToRender.forEach(chord => {
    chord.notes.forEach(note => {
      const key = `${note.string}-${note.fret}`;

      if (!noteMap.has(key)) {
        noteMap.set(key, {
          note,
          colors: [],
          isPreview: chord.isPreview || false
        });
      }

      const entry = noteMap.get(key)!;
      if (chord.color && !entry.colors.includes(chord.color)) {
        entry.colors.push(chord.color);
      }
    });
  });

  // Render notes
  noteMap.forEach(({ note, colors, isPreview }) => {
    renderNote(note, {
      fillColor: colors[0],
      borderColors: colors.length > 1 ? colors : undefined,
      opacity: isPreview ? 0.5 : 1.0,
      multiColorRing: colors.length > 1
    });
  });
}
```

**Multi-Color Ring Rendering**:
```typescript
function renderMultiColorRing(
  x: number,
  y: number,
  radius: number,
  colors: string[]
) {
  const ringWidth = 3;
  const anglePerColor = (2 * Math.PI) / colors.length;

  colors.forEach((color, index) => {
    const startAngle = index * anglePerColor;
    const endAngle = (index + 1) * anglePerColor;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = ringWidth;
    ctx.stroke();
  });
}
```

### 2nd Fretboard (Scale/Pentatonic Fretboard)

**Purpose**: Show context (CAGED areas or scale positions)

**CAGED Mode Rendering**:
```typescript
function renderCAGEDContext(selectedShapes: CAGEDShape[]) {
  selectedShapes.forEach(shape => {
    const boundaries = getCAGEDShapeBoundaries(shape);

    // Render dimmed overlay for shape area
    renderShapeOverlay(boundaries, {
      fillColor: theme.accentPrimary,
      opacity: 0.15,
      borderColor: theme.accentPrimary,
      borderOpacity: 0.3
    });
  });
}
```

**Scale Mode Rendering**:
```typescript
function renderScaleContext(
  key: string,
  scale: string,
  positions: number[]
) {
  positions.forEach(position => {
    const scaleNotes = getScaleNotesAtPosition(key, scale, position);

    // Render scale notes dimmed
    scaleNotes.forEach(note => {
      renderNote(note, {
        fillColor: theme.textSecondary,
        opacity: 0.3,
        size: 'small'
      });
    });
  });
}
```

---

## Implementation Phases

### Phase 1: Menu Integration & State Setup
**Duration**: 1-2 hours

**Tasks**:
1. Add "Overlapping Chords" toggle to menu dropdown
2. Implement dependency logic (auto-enable Triads & CAGED)
3. Add toast notifications for state changes
4. Update state management in page.tsx
5. Test toggle interactions

**Files to Modify**:
- Menu component (add toggle)
- `app/page.tsx` (add state)

**Files to Create**:
- None (using existing components)

---

### Phase 2: Tabbed Settings Card
**Duration**: 2-3 hours

**Tasks**:
1. Create TabbedSettingsCard component
2. Create OverlappingChordsTab component
3. Create DisplayModeSelector component
4. Create OverlapCriteriaSelector component
5. Update CAGEDModeControls (simplified version)
6. Update ScaleModeControls (simplified version)
7. Integrate into existing Triad Settings area
8. Test tab switching and state persistence

**Files to Create**:
- `components/overlapping-chords/TabbedSettingsCard.tsx`
- `components/overlapping-chords/OverlappingChordsTab.tsx`
- `components/overlapping-chords/DisplayModeSelector.tsx`
- `components/overlapping-chords/OverlapCriteriaSelector.tsx`

**Files to Modify**:
- `components/overlapping-chords/CAGEDModeControls.tsx` (simplify)
- `components/overlapping-chords/ScaleModeControls.tsx` (simplify)
- `app/page.tsx` (integrate tabbed card)

---

### Phase 3: Chord Finding Algorithms (Updated)
**Duration**: 3-4 hours

**Tasks**:
1. Update `findChordsInCAGEDAreas` function
   - Support multiple CAGED shapes
   - Implement "all" vs "two-or-more" criteria
2. Create `findChordsInScalePositions` function
   - Find chords overlapping with scale positions
   - Implement "all" vs "two-or-more" criteria
3. Update chord voicing generation
4. Test with various inputs
5. Optimize performance

**Files to Modify**:
- `lib/music-theory/overlapping-chords/chord-finder.ts`
- `lib/music-theory/overlapping-chords/caged-analyzer.ts`
- `lib/music-theory/overlapping-chords/scale-analyzer.ts`

**Files to Create**:
- None (updating existing)

---

### Phase 4: Right Sidebar - Chord Browser
**Duration**: 3-4 hours

**Tasks**:
1. Create ChordBrowserSidebar component
2. Update ChordCard component (hover/click states)
3. Implement filter dropdown
4. Implement smooth scrolling
5. Add animations (hover, select)
6. Integrate with state management
7. Test interactions

**Files to Create**:
- `components/overlapping-chords/ChordBrowserSidebar.tsx`
- `components/overlapping-chords/FilterDropdown.tsx`

**Files to Modify**:
- `components/overlapping-chords/ChordCard.tsx` (add hover state)
- `app/page.tsx` (integrate sidebar)

---

### Phase 5: Fretboard Integration
**Duration**: 4-5 hours

**Tasks**:
1. Update 1st fretboard to render overlapping chords
2. Implement multi-color ring rendering for shared notes
3. Implement hover preview on 1st fretboard
4. Update 2nd fretboard to show context (CAGED/scale)
5. Test color assignments
6. Test shared note rendering
7. Test hover interactions
8. Optimize rendering performance

**Files to Modify**:
- `components/Fretboard.tsx` (add overlapping chords rendering)
- `app/page.tsx` (pass data to fretboards)

**Files to Create**:
- `lib/fretboard/multi-color-ring-renderer.ts` (helper)

---

### Phase 6: Polish & Testing
**Duration**: 2-3 hours

**Tasks**:
1. Add loading states
2. Add empty states (no chords found)
3. Add error handling
4. Optimize re-renders (memoization)
5. Add keyboard shortcuts (optional)
6. Test full user flow
7. Test edge cases
8. Performance profiling
9. Accessibility audit
10. Cross-browser testing

**Files to Modify**:
- All components (add polish)

---

## Testing Strategy

### Unit Tests

**Chord Finding Algorithms**:
```typescript
describe('findChordsInCAGEDAreas', () => {
  it('should find chords with ALL notes in C shape', () => {
    const chords = findChordsInCAGEDAreas(['C'], 'all', 6, STANDARD_TUNING);
    expect(chords.length).toBeGreaterThan(0);
    chords.forEach(chord => {
      expect(allNotesInCAGEDArea(chord.notes, 'C')).toBe(true);
    });
  });

  it('should find chords with TWO OR MORE notes in C shape', () => {
    const chords = findChordsInCAGEDAreas(['C'], 'two-or-more', 6, STANDARD_TUNING);
    expect(chords.length).toBeGreaterThan(0);
    chords.forEach(chord => {
      expect(countNotesInCAGEDArea(chord.notes, 'C')).toBeGreaterThanOrEqual(2);
    });
  });

  it('should find chords in multiple CAGED shapes', () => {
    const chords = findChordsInCAGEDAreas(['C', 'A', 'G'], 'all', 6, STANDARD_TUNING);
    expect(chords.length).toBeGreaterThan(0);
  });
});

describe('findChordsInScalePositions', () => {
  it('should find chords with ALL notes in C Major Position I', () => {
    const chords = findChordsInScalePositions('C', 'Major', [0], 'all', 6, STANDARD_TUNING);
    expect(chords.length).toBeGreaterThan(0);
    chords.forEach(chord => {
      expect(allNotesInScale(chord.notes, 'C', 'Major', 0)).toBe(true);
    });
  });

  it('should find chords with TWO OR MORE notes in scale', () => {
    const chords = findChordsInScalePositions('C', 'Major', [0], 'two-or-more', 6, STANDARD_TUNING);
    expect(chords.length).toBeGreaterThan(0);
    chords.forEach(chord => {
      expect(countNotesInScale(chord.notes, 'C', 'Major', 0)).toBeGreaterThanOrEqual(2);
    });
  });
});
```

**Color Assignment**:
```typescript
describe('assignChordColors', () => {
  it('should assign unique colors to chords', () => {
    const chords = [
      { rootNote: 'C', quality: 'major', notes: [] },
      { rootNote: 'Am', quality: 'minor', notes: [] },
      { rootNote: 'F', quality: 'major', notes: [] },
    ];

    const colored = assignChordColors(chords);
    const colors = colored.map(c => c.color);

    expect(new Set(colors).size).toBe(3); // All unique
  });

  it('should cycle through palette for many chords', () => {
    const chords = Array.from({ length: 15 }, (_, i) => ({
      rootNote: NOTES[i % 12],
      quality: 'major',
      notes: []
    }));

    const colored = assignChordColors(chords);
    expect(colored.every(c => c.color)).toBe(true);
  });
});
```

### Integration Tests

**Full User Flow**:
```typescript
describe('Overlapping Chords - Full Flow', () => {
  it('should complete CAGED mode workflow', async () => {
    const { user } = setup();

    // 1. Enable feature
    await user.click(screen.getByLabelText('Overlapping Chords'));
    expect(screen.getByText('Triads & CAGED enabled')).toBeInTheDocument();

    // 2. Switch to Overlapping Chords tab
    await user.click(screen.getByText('Overlapping Chords'));

    // 3. Select CAGED mode
    await user.click(screen.getByLabelText('CAGED Areas'));

    // 4. Select overlap criteria
    await user.click(screen.getByLabelText('ALL notes'));

    // 5. Select C shape
    await user.click(screen.getByLabelText('C Shape'));

    // 6. Verify chords appear in sidebar
    expect(screen.getByText(/chords found/)).toBeInTheDocument();

    // 7. Hover over chord
    const chordCard = screen.getAllByRole('button', { name: /chord/i })[0];
    await user.hover(chordCard);

    // 8. Verify preview on fretboard
    expect(screen.getByTestId('fretboard-1')).toHaveAttribute('data-preview', 'true');

    // 9. Click chord
    await user.click(chordCard);

    // 10. Verify chord selected
    expect(chordCard).toHaveClass('selected');

    // 11. Verify chord on fretboard
    expect(screen.getByTestId('fretboard-1')).toHaveAttribute('data-chords-count', '1');
  });

  it('should complete Scale mode workflow', async () => {
    // Similar test for Scale mode
  });
});
```

### Visual Regression Tests

**Fretboard Rendering**:
- Capture screenshots of fretboard with:
  - Single chord
  - Multiple chords
  - Shared notes (2 chords)
  - Shared notes (3+ chords)
  - Hover preview
- Compare against baseline images

**Sidebar Rendering**:
- Capture screenshots of sidebar with:
  - Empty state
  - Few chords (< 10)
  - Many chords (> 50)
  - Filtered view
  - Selected chords

---

## Performance Considerations

### Optimization Strategies

1. **Memoization**:
   - Memoize chord calculations
   - Memoize color assignments
   - Memoize filtered chord lists

2. **Debouncing**:
   - Debounce checkbox changes (100ms)
   - Debounce hover events (50ms)

3. **Virtual Scrolling**:
   - Use react-window for chord list if > 100 chords
   - Render only visible cards

4. **Lazy Loading**:
   - Load chord data on-demand
   - Defer non-critical calculations

5. **Canvas Optimization**:
   - Use requestAnimationFrame for fretboard updates
   - Batch canvas operations
   - Cache rendered elements

---

## Accessibility

### ARIA Labels

```tsx
<button
  aria-label={`Select ${chord.chordSymbol} chord`}
  aria-pressed={isSelected}
  role="button"
>
  {/* Chord card content */}
</button>

<div
  role="tablist"
  aria-label="Settings tabs"
>
  <button
    role="tab"
    aria-selected={activeTab === 'triad-settings'}
    aria-controls="triad-settings-panel"
  >
    Triad Settings
  </button>
</div>
```

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Space/Enter**: Toggle checkboxes, select chords
- **Arrow Keys**: Navigate chord list
- **Escape**: Clear hover state, close modals

### Screen Reader Support

- Announce chord count when list updates
- Announce selection state changes
- Provide descriptive labels for all controls

---

## Error Handling

### Error States

1. **No Chords Found**:
   ```tsx
   <div className="empty-state">
     <p>No chords found matching criteria</p>
     <p>Try selecting different shapes or positions</p>
   </div>
   ```

2. **Invalid Configuration**:
   ```tsx
   <div className="error-state">
     <p>Please select at least one CAGED shape or scale position</p>
   </div>
   ```

3. **Calculation Error**:
   ```tsx
   <div className="error-state">
     <p>Error calculating chords</p>
     <button onClick={retry}>Retry</button>
   </div>
   ```

### Error Boundaries

Wrap all major components in ErrorBoundary:
```tsx
<ErrorBoundary theme={theme}>
  <ChordBrowserSidebar {...props} />
</ErrorBoundary>
```

---

## Summary

This blueprint provides a complete specification for the updated Overlapping Chords system with:

✅ **Menu Integration**: Toggle in dropdown with dependency logic
✅ **Tabbed Settings**: Modern tabbed interface for settings
✅ **Two Display Modes**: CAGED Areas and Scale/Mode Positions
✅ **Overlap Criteria**: ALL notes or TWO OR MORE notes
✅ **Right Sidebar**: Premium chord browser with hover/click
✅ **Dual Fretboard**: Selected chords on 1st, context on 2nd
✅ **Color Coding**: Unique colors with multi-color rings for shared notes
✅ **State Management**: Comprehensive hook with localStorage
✅ **Performance**: Optimized rendering and calculations
✅ **Accessibility**: Full ARIA support and keyboard navigation
✅ **Testing**: Unit, integration, and visual regression tests

**Total Estimated Development Time**: 15-20 hours

**Files to Create**: ~10 new components
**Files to Modify**: ~5 existing files
**Lines of Code**: ~2000-2500 lines

---

## Next Steps

1. Review and approve blueprint
2. Begin Phase 1 implementation
3. Iterate through phases sequentially
4. Test after each phase
5. Deploy when all phases complete

---

*End of Blueprint*


