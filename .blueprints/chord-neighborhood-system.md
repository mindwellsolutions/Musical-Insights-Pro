# Chord Neighborhood System Blueprint

## Overview
The Chord Neighborhood system helps users discover which diatonic chords have playable voicings near any triad voicing they select on the fretboard. This feature enables smooth voice leading and chord progression discovery.

## System Architecture

### Core Concepts

1. **Anchor Voicing**: A specific triad voicing selected by the user that serves as the reference point
2. **Neighborhood Distance**: Measured in frets (2-6 fret range from anchor)
3. **Diatonic Chords**: All seven chords in the current key (I, ii, iii, IV, V, vi, vii°)
4. **Common Tones**: Notes shared between the anchor voicing and nearby chord voicings

### User Interaction Flow

```
1. User hovers over a triad voicing on Fretboard 1
   → System highlights all 3 notes of that voicing as a group
   → Tooltip shows: chord name, inversion, string set, fret range

2. User clicks the voicing to set as "anchor"
   → Chord Neighborhood panel appears/updates
   → Panel shows diatonic chords sorted by distance

3. User clicks a nearby chord button
   → System overlays that chord's nearest voicing on fretboard
   → Uses distinct visual style (outlined vs solid)

4. User can click another chord to replace overlay
   → Or click same chord again to remove it
   → Or click different anchor to recalculate
```

## Data Structures

### Anchor Voicing
```typescript
interface AnchorVoicing {
  voicingId: string;
  chordName: string;        // e.g., "C Major"
  inversion: Inversion;     // 'root' | 'first' | 'second'
  stringSet: StringSet;     // '123' | '234' | '345' | '456'
  positions: [FretboardNote, FretboardNote, FretboardNote];
  fretRange: {
    min: number;
    max: number;
  };
  centerFret: number;
}
```

### Nearby Chord
```typescript
interface NearbyChord {
  chordName: string;
  scaleDegree: string;      // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  quality: TriadQuality;
  distance: number;         // Frets from anchor
  commonTones: number;      // 0-3
  voicing: TriadVoicing;    // Nearest voicing to anchor
  function: string;         // 'Tonic', 'Dominant', etc.
}
```

### Chord Neighborhood State
```typescript
interface ChordNeighborhoodState {
  anchorVoicing: AnchorVoicing | null;
  nearbyChords: NearbyChord[];
  selectedOverlay: NearbyChord | null;
  isOpen: boolean;
}
```

## Algorithm: Find Nearby Chords

```typescript
function findNearbyChords(
  anchor: AnchorVoicing,
  key: PitchClass,
  mode: ScaleMode,
  minDistance: number = 2,
  maxDistance: number = 6
): NearbyChord[] {
  // 1. Get all diatonic chords for the key
  const diatonicChords = getDiatonicChords(key, mode);
  
  // 2. For each diatonic chord, find all voicings
  const nearbyChords: NearbyChord[] = [];
  
  for (const { triad, numeral, function: chordFunction } of diatonicChords) {
    // Find all voicings for this chord
    const allVoicings = findAllVoicings(triad);
    
    // Filter voicings within distance range
    const nearbyVoicings = allVoicings.filter(voicing => {
      const distance = calculateDistance(anchor, voicing);
      return distance >= minDistance && distance <= maxDistance;
    });
    
    if (nearbyVoicings.length > 0) {
      // Find the closest voicing
      const closestVoicing = findClosestVoicing(anchor, nearbyVoicings);
      const distance = calculateDistance(anchor, closestVoicing);
      const commonTones = countCommonTones(anchor, closestVoicing);
      
      nearbyChords.push({
        chordName: `${triad.root.name} ${triad.quality}`,
        scaleDegree: numeral,
        quality: triad.quality,
        distance,
        commonTones,
        voicing: closestVoicing,
        function: chordFunction
      });
    }
  }
  
  // 3. Sort by distance, then by common tones
  return nearbyChords.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return b.commonTones - a.commonTones;
  });
}
```

## Algorithm: Calculate Distance

```typescript
function calculateDistance(
  anchor: AnchorVoicing,
  voicing: TriadVoicing
): number {
  // Calculate the maximum fret movement required
  const anchorFrets = anchor.positions.map(p => p.fret);
  const voicingFrets = voicing.positions.map(p => p.fret);
  
  const maxMovement = Math.max(
    Math.abs(voicingFrets[0] - anchorFrets[0]),
    Math.abs(voicingFrets[1] - anchorFrets[1]),
    Math.abs(voicingFrets[2] - anchorFrets[2])
  );
  
  return maxMovement;
}
```

## Algorithm: Count Common Tones

```typescript
function countCommonTones(
  anchor: AnchorVoicing,
  voicing: TriadVoicing
): number {
  const anchorNotes = new Set(anchor.positions.map(p => p.note.name));
  const voicingNotes = voicing.positions.map(p => p.note.name);
  
  return voicingNotes.filter(note => anchorNotes.has(note)).length;
}
```

## UI Components

### 1. Chord Neighborhood Panel

Located below Fretboard 1 (Triad Display), appears when an anchor is selected.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ CHORD NEIGHBORHOOD                                    [?] [Close]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Anchor: C Major (Root Position) @ Frets 8-9, Strings 1-2-3      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Nearby Chords:                                                   │
│                                                                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │ Am  │ │ Em  │ │  G  │ │  F  │ │ Dm  │ │Bdim │               │
│ │ vi  │ │iii  │ │  V  │ │ IV  │ │ ii  │ │vii° │               │
│ │●●●●○│ │●●●○○│ │●●●○○│ │●●○○○│ │●○○○○│ │○○○○○│               │
│ │1fret│ │2fret│ │2fret│ │3fret│ │5fret│ │7fret│               │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘               │
│                                                                   │
│ ● = Common tones with anchor                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```typescript
interface ChordNeighborhoodPanelProps {
  theme: ThemeConfig;
  anchorVoicing: AnchorVoicing | null;
  nearbyChords: NearbyChord[];
  selectedOverlay: NearbyChord | null;
  onChordSelect: (chord: NearbyChord) => void;
  onClose: () => void;
}
```

### 2. Voicing Hover Tooltip

Appears when hovering over a triad voicing on Fretboard 1.

**Content:**
- Chord name (e.g., "C Major")
- Inversion (Root Position, 1st Inversion, 2nd Inversion)
- String set (Strings 1-2-3, 2-3-4, etc.)
- Fret range (Frets 8-9)
- "Click to set as anchor"

### 3. Nearby Chord Button

Each button in the Chord Neighborhood panel.

**Visual Design:**
- Rounded button with border
- Chord name at top
- Scale degree (Roman numeral) below
- Common tone indicators (filled/empty circles)
- Distance in frets at bottom
- Hover: slight scale and glow
- Selected: distinct border color and background

**States:**
- Default: Gray background
- Hover: Lighter background, scale 1.05
- Selected: Accent color background
- Disabled: Reduced opacity (if no voicing found)

## Visual Styling

### Fretboard Overlays

**Anchor Voicing (when selected):**
- Solid fill with note color
- Thick white border (3px)
- Pulsing glow effect
- Higher z-index

**Overlay Voicing (from nearby chord):**
- Outlined style (transparent fill)
- Thick colored border (3px) using chord's color
- Dashed border to distinguish from anchor
- Medium z-index
- Note names shown inside outline

### Color Scheme

**Common Tone Indicators:**
- Filled circle (●): Common tone with anchor
- Empty circle (○): Not a common tone
- Use theme accent color for filled circles

**Distance Indicators:**
- 1-2 frets: Green (#10b981)
- 3-4 frets: Yellow (#f59e0b)
- 5-6 frets: Orange (#f97316)
- 7+ frets: Red (#ef4444)

## Implementation Phases

### Phase 1: Core Data Layer
**Files to Create:**
- `lib/music-theory/neighborhood/types.ts` - Type definitions
- `lib/music-theory/neighborhood/discovery.ts` - Nearby chord algorithms
- `lib/music-theory/neighborhood/distance.ts` - Distance calculations
- `lib/music-theory/neighborhood/diatonic.ts` - Diatonic chord generation

**Tasks:**
1. Define TypeScript interfaces
2. Implement `getDiatonicChords()` function
3. Implement `findNearbyChords()` algorithm
4. Implement `calculateDistance()` function
5. Implement `countCommonTones()` function
6. Add unit tests

### Phase 2: State Management
**Files to Modify:**
- `components/triad-system/TriadSystemContext.tsx` - Add neighborhood state
- `lib/music-theory/types.ts` - Export neighborhood types

**Tasks:**
1. Add `chordNeighborhoodState` to TriadSystemState
2. Add actions: `setAnchorVoicing`, `setSelectedOverlay`, `clearNeighborhood`
3. Add computed values for nearby chords
4. Persist anchor selection in localStorage

### Phase 3: Fretboard Interaction
**Files to Modify:**
- `components/Fretboard.tsx` - Add hover/click handlers for voicings

**Tasks:**
1. Add voicing grouping logic (group 3 notes by voicingId)
2. Add hover state for voicing groups
3. Add click handler to set anchor
4. Add tooltip component for voicing info
5. Add visual highlighting for hovered voicing
6. Add visual styling for anchor voicing
7. Add overlay rendering for selected nearby chord

### Phase 4: UI Components
**Files to Create:**
- `components/chord-neighborhood/ChordNeighborhoodPanel.tsx` - Main panel
- `components/chord-neighborhood/NearbyChordButton.tsx` - Chord button
- `components/chord-neighborhood/AnchorInfo.tsx` - Anchor display
- `components/chord-neighborhood/CommonToneIndicator.tsx` - Tone dots

**Tasks:**
1. Create ChordNeighborhoodPanel component
2. Create NearbyChordButton component
3. Create AnchorInfo component
4. Create CommonToneIndicator component
5. Add responsive layout
6. Add animations and transitions
7. Add help/info tooltip

### Phase 5: Integration
**Files to Modify:**
- `app/page.tsx` - Add panel to layout
- `components/triad-system/TriadSystemMain.tsx` - Wire up state

**Tasks:**
1. Add ChordNeighborhoodPanel to page layout
2. Connect state to components
3. Add toggle in ViewToggles component
4. Add keyboard shortcuts (Escape to close, etc.)
5. Add localStorage persistence
6. Test with different keys and modes

### Phase 6: Polish & Testing
**Tasks:**
1. Add loading states
2. Add empty states (no nearby chords found)
3. Add error handling
4. Optimize performance (memoization)
5. Add accessibility (ARIA labels, keyboard nav)
6. Cross-browser testing
7. Mobile responsive design
8. User testing and feedback

## Technical Considerations

### Performance Optimization
- Memoize voicing calculations
- Debounce hover events (100ms)
- Lazy load neighborhood panel
- Cache diatonic chord calculations per key

### Accessibility
- Keyboard navigation for chord buttons
- ARIA labels for all interactive elements
- Focus management when panel opens/closes
- Screen reader announcements for state changes

### Edge Cases
- No nearby chords found (show message)
- Anchor at edge of fretboard (adjust distance range)
- Multiple voicings at same distance (show all or closest)
- Key change while panel open (recalculate or close)

## Future Enhancements

1. **Voice Leading Lines**: Draw lines showing finger movement from anchor to overlay
2. **Progression Builder**: Chain multiple chords to build progressions
3. **Audio Preview**: Play anchor and nearby chord together
4. **Smart Suggestions**: Highlight common progressions (I-IV-V, etc.)
5. **Custom Distance Range**: User-adjustable min/max distance
6. **String Set Filtering**: Only show chords on same string set
7. **Inversion Matching**: Prefer same inversion as anchor

