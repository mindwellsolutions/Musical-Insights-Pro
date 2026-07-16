# Triad System Complete Fix Blueprint

## Executive Summary

This blueprint outlines the complete implementation of a proper triad visualization system that displays triads on the fretboard with correct music theory, proper inversion handling, and chord-tone-based coloring.

## Current Issues Identified

1. **Triad mode toggle exists but doesn't display triads** - When "Triads & CAGED" is turned ON in the hamburger menu, the fretboard still shows regular scales/modes instead of triads
2. **Inversion UI not updated** - The TriadTab still shows all inversions simultaneously instead of allowing single position selection
3. **Data flow broken** - The triad data from TriadTab is not properly reaching the Fretboard component
4. **Missing integration** - The showTriadMode toggle doesn't properly switch between scale mode and triad mode

## Root Causes

1. **TriadTab is not visible when triad mode is ON** - The tab system doesn't show TriadTab when showTriadMode is true
2. **Data structure mismatch** - TriadTab sends data but Fretboard expects it in a different format
3. **Incomplete UI redesign** - The inversion selection UI was partially updated but not completed
4. **Missing state management** - No proper connection between showTriadMode state and what's displayed

## Architecture Overview

```
User toggles "Triads & CAGED" ON
    ↓
showTriadMode = true
    ↓
Settings Sidebar shows TriadTab (instead of ScaleSelector)
    ↓
User selects: Root Note, Triad Type, Position (Root/1st/2nd Inversion)
    ↓
TriadTab loads triad data from database
    ↓
TriadTab converts positions to NotePosition format with chordTone metadata
    ↓
Data flows to app/page.tsx via onTriadDataChange callback
    ↓
app/page.tsx passes triadNotes and triadPositions to Fretboard
    ↓
Fretboard renders with chord-tone-based coloring:
    - Root = Red (R)
    - 3rd = Blue (3)
    - 5th = Green (#5)
```

## Phase 1: Fix Settings Sidebar Tab Display

### Task 1.1: Update SettingsSidebar to show TriadTab when triad mode is ON
**File**: `components/SettingsSidebar.tsx`
**Changes**:
- Add `showTriadMode` prop
- When `showTriadMode === true`, show TriadTab instead of ScaleSelector
- Pass all necessary props to TriadTab

### Task 1.2: Add triad state management to SettingsSidebar
**File**: `components/SettingsSidebar.tsx`
**Changes**:
- Add state for: `selectedTriadRoot`, `selectedTriadType`, `selectedTriadInversion`
- Add state for: `selectedCAGEDShapes`, `showCAGEDGuide`
- Pass these to TriadTab component

## Phase 2: Complete TriadTab UI Redesign

### Task 2.1: Rename "Inversions" section to "Triad Positions"
**File**: `components/TriadTab.tsx`
**Status**: PARTIALLY DONE - Need to verify
**Changes**:
- Section header should say "Triad Positions"
- Display format: "Root Position", "1st Inversion", "2nd Inversion"

### Task 2.2: Implement radio button selection for positions
**File**: `components/TriadTab.tsx`
**Status**: PARTIALLY DONE - Need to verify
**Changes**:
- Replace checkboxes with radio buttons
- Only one position can be selected at a time
- Add left/right arrow navigation buttons
- Default selection: Root Position

### Task 2.3: Update help text
**File**: `components/TriadTab.tsx`
**Status**: DONE
**Changes**:
- Explain chord-tone coloring system
- Explain position selection

## Phase 3: Fix Data Conversion and Flow

### Task 3.1: Verify triad-converter.ts
**File**: `lib/triad-converter.ts`
**Status**: CREATED - Need to verify
**Function**: `convertTriadPositionsToNotePositions()`
**Requirements**:
- Filter positions by selected inversion
- Convert TriadPosition → NotePosition format
- Add chordTone metadata ('root' | 'third' | 'fifth')
- Convert string numbers from 1-based to 0-based

### Task 3.2: Update TriadTab data flow
**File**: `components/TriadTab.tsx`
**Status**: PARTIALLY DONE
**Changes**:
- Call convertTriadPositionsToNotePositions() with selectedInversion
- Pass converted data to parent via onTriadDataChange
- Data structure: `{ triadData, notePositions, triadNotes, selectedInversion }`

### Task 3.3: Update app/page.tsx to receive triad data
**File**: `app/page.tsx`
**Status**: PARTIALLY DONE
**Changes**:
- Ensure handleTriadDataChange stores data correctly
- Pass `triadData?.notePositions` to Fretboard as `triadPositions`
- Pass `triadData?.triadNotes` to Fretboard as `triadNotes`

## Phase 4: Implement Fretboard Triad Rendering

### Task 4.1: Update Fretboard to use chord-tone coloring
**File**: `components/Fretboard.tsx`
**Status**: PARTIALLY DONE
**Changes**:
- Check for `notePos.chordTone` property
- Apply colors: Root=#E53935, Third=#3b82f6, Fifth=#5DB572
- Display labels: R, 3, #5 (not note names)
- Add tooltips showing note name + chord tone

### Task 4.2: Fix triad mode display logic
**File**: `components/Fretboard.tsx`
**Changes**:
- When `showTriadMode === true`, use `triadPositions` instead of `notePositions`
- Only display notes that are in `triadNotes` array
- Use chord-tone-based coloring (not position-based or CAGED-based)

## Phase 5: Integration and Testing

### Task 5.1: Connect all components
**Files**: Multiple
**Changes**:
- Ensure showTriadMode prop flows from app/page.tsx → Header → HamburgerMenu
- Ensure showTriadMode prop flows from app/page.tsx → SettingsSidebar → TriadTab
- Ensure triad data flows from TriadTab → app/page.tsx → Fretboard

### Task 5.2: Test all triad types
**Manual Testing**:
- Test Major triads for all 12 root notes
- Test Minor triads for all 12 root notes
- Test Diminished triads for all 12 root notes
- Test Augmented triads for all 12 root notes

### Task 5.3: Test all inversions
**Manual Testing**:
- Verify Root Position displays correctly
- Verify 1st Inversion displays correctly
- Verify 2nd Inversion displays correctly
- Verify arrow navigation works
- Verify radio button selection works

### Task 5.4: Test CAGED filtering
**Manual Testing**:
- Enable CAGED Guide
- Toggle CAGED shapes on/off
- Verify positions are filtered correctly

## Data Structures

### NotePosition Interface
```typescript
interface NotePosition {
  stringIndex: number;        // 0-based
  fretNumber: number;
  note: string;
  isRoot: boolean;
  isHarmonyNote?: boolean;
  chordTone?: 'root' | 'third' | 'fifth';  // NEW
}
```

### TriadPosition Interface
```typescript
interface TriadPosition {
  rootNote: string;
  triadType: TriadType;
  inversion: TriadInversion;
  cagedShape: CAGEDShape | null;
  fretPosition: number;
  stringSet: number;
  stringPositions: StringPosition[];  // 3 notes
  positionIndex: number;
}
```

### StringPosition Interface
```typescript
interface StringPosition {
  stringIndex: number;  // 0-based (0 = low E, 5 = high E)
  fret: number;
  note: string;
  chordTone: 'root' | 'third' | 'fifth';
}
```

## Color Coding System

- **Root Note**: Red (#E53935) - Label: "R"
- **Third Note**: Blue (#3b82f6) - Label: "3"
- **Fifth Note**: Green (#5DB572) - Label: "5"

## Success Criteria

1. ✅ When "Triads & CAGED" is ON, SettingsSidebar shows TriadTab
2. ✅ User can select Root Note, Triad Type, and Position
3. ✅ Only one position can be selected at a time (radio buttons)
4. ✅ Fretboard displays only the selected inversion
5. ✅ Notes are color-coded by chord tone (Red/Blue/Green)
6. ✅ Labels show R/3/#5 instead of note names
7. ✅ All 4 triad types work correctly
8. ✅ All 3 inversions work correctly
9. ✅ CAGED filtering works when enabled
10. ✅ Switching between scale mode and triad mode works seamlessly

## Implementation Order

Execute phases in this exact order:
1. Phase 1: Fix Settings Sidebar (CRITICAL - Nothing works without this)
2. Phase 2: Complete TriadTab UI
3. Phase 3: Fix Data Flow
4. Phase 4: Fix Fretboard Rendering
5. Phase 5: Integration Testing

## Notes

- The triad calculation logic in `lib/triad-theory.ts` is CORRECT - do not modify
- The position calculation logic in `lib/triad-positions.ts` is CORRECT - do not modify
- The triad database in `/public/data/triads/triad-database.json` is CORRECT - do not modify
- Focus on UI, data flow, and rendering - not music theory calculations

