# Song Builder Triads & CAGED - Quick Reference Guide

## Component Quick Reference

### SongProgressionDisplay
**Purpose**: Display chord progression as interactive buttons  
**Location**: `components/chord-progression/SongProgressionDisplay.tsx`  
**Key Props**: `chords`, `selectedChordIndex`, `onChordSelect`, `onVoicingChange`  
**Key Features**: Colorful buttons, dropdown arrows, playback highlighting

### DualFretboardDisplay
**Purpose**: Container coordinating both fretboards  
**Location**: `components/chord-progression/DualFretboardDisplay.tsx`  
**Key Props**: `selectedChord`, `selectedScale`, `selectedTriadPosition`  
**Key Features**: State coordination, CAGED calculation, data flow

### TriadFretboard
**Purpose**: 1st fretboard showing triad positions  
**Location**: `components/chord-progression/TriadFretboard.tsx`  
**Key Props**: `selectedChord`, `onTriadPositionSelect`, `showCAGEDGuide`  
**Key Features**: Triad positions, nearby chords, CAGED overlay, clickable

### ScaleFretboard
**Purpose**: 2nd fretboard showing filtered scale notes  
**Location**: `components/chord-progression/ScaleFretboard.tsx`  
**Key Props**: `selectedScale`, `cagedRegions`, `showScaleDegrees`  
**Key Features**: CAGED filtering, scale degrees, empty state

## Function Quick Reference

### getTriadPositionsForChord()
```typescript
getTriadPositionsForChord(
  chord: ChordInstance,
  maxFret: number = 24,
  filterByCAGED?: CAGEDShapeName[]
): TriadPosition[]
```
**Purpose**: Calculate all triad positions for a chord  
**Returns**: Array of triad positions  
**Location**: `lib/chord-progression/song-progression-utils.ts`

### filterScaleNotesByCAGEDRegions()
```typescript
filterScaleNotesByCAGEDRegions(
  scale: ScaleModeInstance,
  cagedRegions: ShapeRegion[],
  tuning: string[]
): FilteredScaleNote[]
```
**Purpose**: Filter scale notes to CAGED regions  
**Returns**: Filtered note positions with scale degrees  
**Location**: `lib/chord-progression/song-progression-utils.ts`

### getNearbyChordsSongProgression()
```typescript
getNearbyChordsSongProgression(
  selectedChord: ChordInstance,
  selectedPosition: TriadPosition,
  key: string,
  keyMode: 'major' | 'minor'
): NearbyChord[]
```
**Purpose**: Get nearby diatonic chords  
**Returns**: Array of nearby chords with voicings  
**Location**: `lib/chord-progression/song-progression-utils.ts`

### convertVoicingToTriadPosition()
```typescript
convertVoicingToTriadPosition(
  voicing: ChordVoicing,
  chord: ChordInstance
): TriadPosition | null
```
**Purpose**: Convert custom voicing to triad position  
**Returns**: TriadPosition or null  
**Location**: `lib/chord-progression/song-progression-utils.ts`

## State Management Quick Reference

### PlaySongPanel State
```typescript
const [selectedChordIndex, setSelectedChordIndex] = useState<number>(0);
const [selectedTriadPosition, setSelectedTriadPosition] = useState<TriadPosition | null>(null);
const [customVoicings, setCustomVoicings] = useState<Map<string, ChordVoicing>>(new Map());
const [showCAGEDGuide, setShowCAGEDGuide] = useState<boolean>(true);
const [selectedCAGEDShapes, setSelectedCAGEDShapes] = useState<CAGEDShapeName[]>(['C', 'A', 'G', 'E', 'D']);
```

### State Update Patterns

**Chord Selection**:
```typescript
const handleChordSelect = (index: number) => {
  setSelectedChordIndex(index);
  const chord = chords[index];
  const positions = getTriadPositionsForChord(chord, 24, selectedCAGEDShapes);
  if (positions.length > 0) {
    setSelectedTriadPosition(positions[0]);
  }
};
```

**Voicing Change**:
```typescript
const handleVoicingChange = (chordIndex: number, voicing: ChordVoicing) => {
  const chord = chords[chordIndex];
  setCustomVoicings(prev => {
    const updated = new Map(prev);
    updated.set(chord.id, voicing);
    return updated;
  });
  const triadPosition = convertVoicingToTriadPosition(voicing, chord);
  setSelectedTriadPosition(triadPosition);
};
```

**Verse Change**:
```typescript
useEffect(() => {
  setSelectedChordIndex(0);
  setSelectedTriadPosition(null);
  setCustomVoicings(new Map());
}, [activeVerse.id]);
```

## Common Patterns

### Memoization Pattern
```typescript
const triadPositions = useMemo(() => {
  if (!selectedChord) return [];
  return getTriadPositionsForChord(selectedChord, 24, selectedCAGEDShapes);
}, [selectedChord, selectedCAGEDShapes]);
```

### CAGED Filtering Pattern
```typescript
const filteredScaleNotes = useMemo(() => {
  if (!selectedScale || !selectedTriadPosition) return [];
  const cagedRegions = getCAGEDRegionsForVoicing(selectedTriadPosition);
  return filterScaleNotesByCAGEDRegions(selectedScale, cagedRegions, tuning);
}, [selectedScale, selectedTriadPosition, tuning]);
```

### Playback Update Pattern
```typescript
const debouncedTime = useDebounce(currentTime, 50);

useEffect(() => {
  if (isPlaying) {
    const { chord, scale } = getCurrentChordAndScale(chords, scales, debouncedTime);
    if (chord) {
      const index = chords.findIndex(c => c.id === chord.id);
      if (index !== -1) handleChordSelect(index);
    }
  }
}, [debouncedTime, isPlaying]);
```

## Testing Quick Reference

### Unit Test Template
```typescript
describe('SongProgressionDisplay', () => {
  it('renders chord buttons', () => {
    const chords = [mockChord1, mockChord2];
    render(<SongProgressionDisplay chords={chords} {...props} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
  
  it('highlights selected chord', () => {
    render(<SongProgressionDisplay selectedChordIndex={0} {...props} />);
    expect(screen.getByText('C')).toHaveClass('selected');
  });
});
```

### Integration Test Template
```typescript
describe('PlaySongPanel Integration', () => {
  it('updates fretboards on chord selection', async () => {
    render(<PlaySongPanel {...props} />);
    
    const chordButton = screen.getByText('C');
    fireEvent.click(chordButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('triad-fretboard')).toBeInTheDocument();
      expect(screen.getByTestId('scale-fretboard')).toBeInTheDocument();
    });
  });
});
```

## Debugging Tips

### Check State
```typescript
// Add to PlaySongPanel for debugging
useEffect(() => {
  console.log('State:', {
    selectedChordIndex,
    selectedTriadPosition,
    customVoicings: Array.from(customVoicings.entries())
  });
}, [selectedChordIndex, selectedTriadPosition, customVoicings]);
```

### Check Calculations
```typescript
// Add to DualFretboardDisplay
const triadPositions = useMemo(() => {
  const positions = getTriadPositionsForChord(selectedChord, 24);
  console.log('Triad positions:', positions.length);
  return positions;
}, [selectedChord]);
```

### Check Performance
```typescript
// Wrap expensive operations
console.time('triad-calculation');
const positions = getTriadPositionsForChord(chord, 24);
console.timeEnd('triad-calculation');
```

## Common Issues & Solutions

### Issue: Fretboards not updating
**Solution**: Check that props are being passed correctly and state is updating

### Issue: CAGED filtering not working
**Solution**: Verify selectedTriadPosition has valid cagedShape property

### Issue: Voicing selector not opening
**Solution**: Check that dropdown click handler is not being prevented

### Issue: Performance lag during playback
**Solution**: Ensure debouncing is working and memoization is in place

### Issue: Custom voicings not persisting
**Solution**: Verify Map is being updated immutably

## Keyboard Shortcuts

- `←` / `→` - Navigate chords
- `Space` - Play/Pause
- `T` - Toggle fretboards
- `V` - Open voicing selector
- `C` - Toggle CAGED guide
- `Esc` - Close modals

## File Locations

```
components/chord-progression/
├── PlaySongPanel.tsx (ENHANCED)
├── SongProgressionDisplay.tsx (NEW)
├── DualFretboardDisplay.tsx (NEW)
├── TriadFretboard.tsx (NEW)
└── ScaleFretboard.tsx (NEW)

lib/chord-progression/
└── song-progression-utils.ts (NEW)

hooks/chord-progression/
├── useSongProgression.ts (NEW)
├── useTriadPositionSelection.ts (NEW)
└── useCAGEDFiltering.ts (NEW)
```

