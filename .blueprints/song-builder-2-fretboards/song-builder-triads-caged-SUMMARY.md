# Song Builder Triads & CAGED Integration - Executive Summary

## Overview

This document provides a high-level summary of the comprehensive blueprint for integrating the Triads & CAGED fretboard system into the Song Builder's "Play Song" tab.

## What's Being Built

### Current State
- Song Builder has a timeline UI with chord progression and scale tracks
- Play Song tab shows a single fretboard with chord tones and scale notes
- Triads & CAGED mode exists separately on the main page

### Target State
- Play Song tab displays TWO fretboards (like Triads & CAGED mode)
- **1st Fretboard**: Shows triad positions for song chords with nearby neighborhood groupings
- **2nd Fretboard**: Shows scale notes filtered by CAGED regions from selected triad position
- Song Chord Progression section displays timeline chords as interactive buttons
- Users can select custom voicings for each chord via dropdown
- Real-time playback synchronization updates fretboards as song plays

## Key Features

### 1. Song Chord Progression Display
- Colorful chord buttons showing timeline progression
- Each button has dropdown arrow for voicing selection
- Displays chord duration (beats)
- Highlights current chord during playback
- Shows nearby diatonic chords below (ghosted)

### 2. Dual Fretboard System
- **1st Fretboard (Triads)**:
  - All triad positions for selected chord
  - Nearby diatonic chord positions (faded)
  - CAGED overlay regions
  - Clickable positions to select
  - Color-coded by CAGED shape

- **2nd Fretboard (Scales)**:
  - Scale notes from timeline scale assignment
  - Filtered to only show notes in CAGED regions from 1st fretboard
  - Scale degree indicators
  - Matching CAGED overlay
  - Empty state when no scale assigned

### 3. Custom Voicing Selection
- Click dropdown on any chord button
- Opens comprehensive voicing selector modal
- Select from 100+ voicings per chord
- Updates 1st fretboard to show selected voicing
- Updates chord diagrams in sidebar

### 4. Verse Tab Integration
- Each verse has its own chord progression and scales
- Switching verses updates all displays
- Custom voicings can be saved per verse
- State resets appropriately on verse change

### 5. Real-Time Playback
- Fretboards update as song plays
- Current chord highlighted in progression
- Smooth transitions between chords
- 60fps performance during playback

## New Components

1. **SongProgressionDisplay** - Displays chord buttons with dropdowns
2. **DualFretboardDisplay** - Container coordinating both fretboards
3. **TriadFretboard** - 1st fretboard with triad positions
4. **ScaleFretboard** - 2nd fretboard with filtered scale notes

## Enhanced Components

1. **PlaySongPanel** - Main container with new state management
2. **ChordDiagramSidebar** - Accepts custom voicings

## Reused Components

1. **Fretboard** - Core fretboard rendering
2. **CAGEDFretboardOverlay** - CAGED region overlays
3. **ChordVoicingSelector** - Voicing selection modal
4. **ChordDiagram** - Individual chord diagrams

## Technical Architecture

### State Management
```typescript
PlaySongPanel State:
- selectedChordIndex: number
- selectedTriadPosition: TriadPosition | null
- customVoicings: Map<string, ChordVoicing>
- showCAGEDGuide: boolean
- selectedCAGEDShapes: CAGEDShapeName[]
```

### Data Flow
```
Timeline → PlaySongPanel → SongProgressionDisplay → Chord Buttons
                         → DualFretboardDisplay → TriadFretboard → 1st Fretboard
                                                → ScaleFretboard → 2nd Fretboard
                         → ChordDiagramSidebar → Chord Diagrams
```

### Key Functions
- `getTriadPositionsForChord()` - Calculate triad positions
- `filterScaleNotesByCAGEDRegions()` - Filter scale notes
- `getNearbyChordsSongProgression()` - Get nearby chords
- `convertVoicingToTriadPosition()` - Convert custom voicing
- `getCurrentChordAndScale()` - Get current playback state

## Implementation Timeline

### Phase 1: Core Infrastructure (Week 1)
- Create component structure
- Set up data flow
- Basic rendering

### Phase 2: Triad Fretboard (Week 2)
- Implement 1st fretboard
- Triad position calculation
- Nearby chord display
- Position selection

### Phase 3: Scale Fretboard (Week 3)
- Implement 2nd fretboard
- CAGED region filtering
- Scale degree indicators
- Empty state handling

### Phase 4: Voicing Selection (Week 4)
- Dropdown arrows
- Modal integration
- Custom voicing updates
- Chord diagram updates

### Phase 5: Playback Integration (Week 5)
- Real-time synchronization
- Visual indicators
- Performance optimization

### Phase 6: Polish & Refinement (Week 6)
- Keyboard shortcuts
- Drag-and-drop
- Tooltips and help
- Edge case handling
- Accessibility

## Success Metrics

### Functional
- ✅ Dual fretboards display correctly
- ✅ Song progression shows timeline chords
- ✅ Voicing selection works
- ✅ Playback synchronization accurate
- ✅ Verse switching updates displays

### Performance
- ✅ Initial render < 500ms
- ✅ Chord selection < 100ms
- ✅ Playback at 60fps
- ✅ Memory usage < 100MB increase

### UX
- ✅ Intuitive interactions
- ✅ Clear visual feedback
- ✅ Smooth animations
- ✅ Keyboard shortcuts work
- ✅ Accessible (WCAG 2.1 AA)

## Files to Create/Modify

### New Files (5)
1. `components/chord-progression/SongProgressionDisplay.tsx`
2. `components/chord-progression/DualFretboardDisplay.tsx`
3. `components/chord-progression/TriadFretboard.tsx`
4. `components/chord-progression/ScaleFretboard.tsx`
5. `lib/chord-progression/song-progression-utils.ts`

### Modified Files (3)
1. `components/chord-progression/PlaySongPanel.tsx` (ENHANCED)
2. `components/chord-neighborhood/ChordDiagramSidebar.tsx` (ENHANCED)
3. `components/chord-progression/ChordProgressionGenerator.tsx` (minor updates)

## Dependencies

### Existing Systems
- Triads & CAGED system (`lib/triad-positions.ts`, `lib/caged/`)
- Chord Neighborhood system (`lib/music-theory/neighborhood/`)
- Timeline system (`components/chord-progression/Timeline*.tsx`)
- Voicing database (`lib/chord-voicings.ts`)

### External Libraries
- React 18+ (already installed)
- Tone.js (already installed)
- Lucide React icons (already installed)

## Risk Mitigation

### Performance Risks
- **Risk**: Slow triad position calculation
- **Mitigation**: Memoization, caching, Web Workers (optional)

### UX Risks
- **Risk**: Complex interface overwhelming users
- **Mitigation**: Progressive disclosure, tooltips, tutorial

### Technical Risks
- **Risk**: State management complexity
- **Mitigation**: Clear data flow, comprehensive testing

## Next Steps

1. **Review & Approve** - Stakeholder review of blueprint
2. **Environment Setup** - Ensure dev environment ready
3. **Phase 1 Start** - Begin core infrastructure implementation
4. **Weekly Reviews** - Progress check-ins each week
5. **User Testing** - Beta testing after Phase 3
6. **Iteration** - Refine based on feedback

## Questions & Answers

**Q: Will this work with existing saved projects?**
A: Yes, it reads from the existing timeline data structure.

**Q: Can users still use the old single fretboard?**
A: No, it will be replaced. But the functionality is enhanced, not removed.

**Q: Will this slow down the Song Builder?**
A: No, with proper optimization it should maintain 60fps performance.

**Q: Is this compatible with all chord types?**
A: Yes, it works with all chord types in the database.

**Q: Can users disable the CAGED filtering?**
A: Yes, there's a toggle to show all scale notes vs. CAGED-filtered.

## Full Documentation

For complete technical details, see:
- **Main Blueprint**: `.blueprints/song-builder-triads-caged-integration.md`
- **Component Diagrams**: Rendered Mermaid diagrams in blueprint
- **Related Docs**: Referenced blueprints in appendix

