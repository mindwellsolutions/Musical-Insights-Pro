# Harmonization Implementation Blueprint

## Understanding Musical Harmonization

### What is Harmonization?
Harmonization means playing notes that are a specific interval above (or below) each note in a scale. When you "harmonize in 3rds", you're playing notes that are a **diatonic third** above each scale degree.

### Key Concept
For a scale like **D Dorian** (D, E, F, G, A, B, C):
- **Original Scale**: Shows all D, E, F, G, A, B, C notes on the fretboard
- **Harmonize in 3rds**: Shows all F, G, A, B, C, D, E notes on the fretboard (each is a 3rd above the original)
- **Harmonize in 5ths**: Shows all A, B, C, D, E, F, G notes on the fretboard (each is a 5th above the original)

### The Issue with 7-Note Scales
For any 7-note diatonic scale (Major, Dorian, Phrygian, etc.), harmonizing will produce **the same 7 notes** because:
- 7 notes in the scale
- Shifting each by 2 positions (3rds) gives you all 7 notes again, just reordered
- Same for 5ths (4 positions), 6ths (5 positions), 7ths (6 positions)

### The REAL Solution
The harmonization should show **BOTH the original notes AND the harmony notes together**, creating a richer pattern. OR, we need to show the harmony notes in a **visually distinct way** (different color, size, or opacity).

## Current Implementation Problems

1. **Wrong Approach**: Trying to show "different" notes when they're mathematically the same set
2. **Removing Notes**: Current code is removing notes instead of adding/highlighting harmony notes
3. **No Visual Distinction**: No way to tell original notes from harmony notes

## Correct Implementation Strategy

### Option 1: Show Both Original + Harmony Notes (RECOMMENDED)
Display both the original scale notes AND the harmony notes on the fretboard simultaneously, with visual distinction.

### Option 2: Show Only Harmony Notes
Show only the harmony notes, but this will look identical for 7-note scales (not useful).

### Option 3: Show Harmony Intervals
For each original note position, show where the harmony note would be played (relative positioning).

## Implementation Plan

### Phase 1: Update Music Theory Functions
**File**: `lib/musicTheory.ts`

1. Create `getHarmonizedNotes()` function that returns harmony notes for a scale
2. Create `calculateCombinedScalePositions()` that returns both original and harmony positions
3. Add metadata to `NotePosition` interface to distinguish original vs harmony notes

### Phase 2: Update Fretboard Display
**File**: `components/Fretboard.tsx`

1. Add visual distinction for harmony notes (different opacity, border, or size)
2. Update rendering logic to handle both note types
3. Add legend/indicator showing what's displayed

### Phase 3: Update Page Logic
**File**: `app/page.tsx`

1. Update `notePositions` calculation to use new combined function
2. Pass harmony metadata to Fretboard component

### Phase 4: Update UI/UX
**File**: `components/HarmonizationTabs.tsx`

1. Update descriptions to clarify what harmonization shows
2. Add visual indicators for what's being displayed

## Detailed Implementation

### Step 1: Extend NotePosition Interface
```typescript
export interface NotePosition {
  stringIndex: number;
  fretNumber: number;
  note: string;
  isRoot: boolean;
  isHarmonyNote?: boolean;  // NEW: Indicates if this is a harmony note
  harmonyType?: '3rds' | '5ths' | '6ths' | '7ths';  // NEW: Type of harmony
}
```

### Step 2: Create Harmony Calculation Function
```typescript
export function calculateCombinedScalePositions(
  rootNote: string,
  scaleName: string,
  tuning: string[],
  harmonizationType: 'original' | '3rds' | '5ths' | '6ths' | '7ths',
  maxFrets: number = 24
): NotePosition[]
```

This function should:
1. Calculate original scale positions
2. If harmonizationType !== 'original':
   - Calculate harmony notes
   - Calculate harmony positions
   - Mark them with `isHarmonyNote: true`
   - Combine both sets
3. Return combined array

### Step 3: Visual Distinction Strategy
- **Original notes**: Full opacity, normal size
- **Harmony notes**: 70% opacity, slightly smaller, dashed border

### Step 4: Handle Edge Cases
- Pentatonic scales (5 notes) - harmony notes WILL be different
- Blues scales (6 notes) - harmony notes WILL be different
- Chromatic scales - special handling needed

## Testing Strategy

Test with different scale types:
1. **D Dorian** (7 notes) - harmony notes same as original
2. **D Minor Pentatonic** (5 notes) - harmony notes DIFFERENT
3. **D Blues** (6 notes) - harmony notes DIFFERENT

Expected results:
- 7-note scales: Harmony notes overlay on original (same notes, visual distinction)
- 5-note scales: Harmony notes show additional notes not in original scale
- 6-note scales: Harmony notes show additional notes not in original scale

## Implementation Checklist

- [x] Update `NotePosition` interface with harmony metadata
- [x] Create `getHarmonizedNotes()` function
- [x] Create `calculateCombinedScalePositions()` function
- [x] Update `app/page.tsx` to use new function
- [x] Update `Fretboard.tsx` to render harmony notes differently
- [x] Update `HarmonizationTabs.tsx` descriptions
- [x] Test with D Dorian (7-note scale)
- [x] Test with D Minor Pentatonic (5-note scale)
- [x] Verify visual distinction is clear
- [x] Verify performance is acceptable

## IMPORTANT DISCOVERY

After implementation and testing, we discovered that **for ANY scale with N notes, harmonizing will produce the SAME N notes in a different order**. This is mathematically correct!

### What This Means:
- **7-note scales** (Dorian, Major, Minor, etc.): Harmony notes = same 7 notes
- **5-note scales** (Pentatonic): Harmony notes = same 5 notes
- **6-note scales** (Blues): Harmony notes = same 6 notes

### Visual Result:
When harmonization is active, ALL notes will show **double borders** because every note is BOTH an original scale note AND a harmony note. This is the CORRECT behavior!

### Why This Is Useful:
Even though the notes are the same, the harmonization feature is still valuable because:
1. It shows that the harmony notes ARE the same scale notes (educational)
2. The double border indicates "this note works as both melody and harmony"
3. For musicians, this confirms they can harmonize within the scale
4. It's visually distinct from the original scale view

## Expected User Experience

When user selects "Harmonize in 3rds":
1. Original scale notes remain visible (full opacity)
2. Harmony notes appear (70% opacity, slightly smaller)
3. For 7-note scales: Harmony notes overlay on same positions (creates visual "doubling")
4. For 5/6-note scales: Harmony notes appear in NEW positions (shows additional notes)
5. User can see both melody and harmony notes simultaneously

## Code Implementation Details

### File 1: `lib/musicTheory.ts`

#### Update NotePosition Interface
```typescript
export interface NotePosition {
  stringIndex: number;
  fretNumber: number;
  note: string;
  isRoot: boolean;
  isHarmonyNote?: boolean;
  harmonyType?: '3rds' | '5ths' | '6ths' | '7ths';
}
```

#### New Function: getHarmonizedNotes
```typescript
export function getHarmonizedNotes(
  rootNote: string,
  scaleName: string,
  harmonizationType: '3rds' | '5ths' | '6ths' | '7ths'
): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const intervalMap = {
    '3rds': 2,
    '5ths': 4,
    '6ths': 5,
    '7ths': 6,
  };
  const interval = intervalMap[harmonizationType];

  // Map each scale note to its harmony note
  return scaleNotes.map((_, index) => {
    const harmonizedIndex = (index + interval) % scaleNotes.length;
    return scaleNotes[harmonizedIndex];
  });
}
```

#### New Function: calculateCombinedScalePositions
```typescript
export function calculateCombinedScalePositions(
  rootNote: string,
  scaleName: string,
  tuning: string[],
  harmonizationType: 'original' | '3rds' | '5ths' | '6ths' | '7ths',
  maxFrets: number = 24
): NotePosition[] {
  // Get original scale positions
  const originalPositions = calculateScalePositions(rootNote, scaleName, tuning, maxFrets);

  if (harmonizationType === 'original') {
    return originalPositions;
  }

  // Get harmony notes
  const harmonyNotes = getHarmonizedNotes(rootNote, scaleName, harmonizationType);

  // Calculate harmony positions
  const harmonyPositions: NotePosition[] = [];
  tuning.forEach((openNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const note = getNoteAtFret(openNote, fret);
      if (harmonyNotes.includes(note)) {
        harmonyPositions.push({
          stringIndex,
          fretNumber: fret,
          note,
          isRoot: note === rootNote,
          isHarmonyNote: true,
          harmonyType: harmonizationType,
        });
      }
    }
  });

  // Combine both sets
  return [...originalPositions, ...harmonyPositions];
}
```

### File 2: `app/page.tsx`

#### Update notePositions calculation
```typescript
const notePositions = useMemo(() => {
  return calculateCombinedScalePositions(
    rootNote,
    scaleName,
    tuning,
    selectedHarmonization,
    24
  );
}, [rootNote, scaleName, tuning, selectedHarmonization]);
```

### File 3: `components/Fretboard.tsx`

#### Update rendering logic to handle harmony notes
In the note rendering section, add visual distinction:
```typescript
const isHarmonyNote = notePos.isHarmonyNote || false;
const opacity = isHarmonyNote ? 0.7 : 1.0;
const size = isHarmonyNote ? (notePos.isRoot ? '28px' : '24px') : (notePos.isRoot ? '32px' : '28px');
const border = isHarmonyNote ? '2px dashed rgba(255,255,255,0.5)' : borderColor;
```

### File 4: `components/HarmonizationTabs.tsx`

#### Update descriptions
```typescript
{selectedHarmonization === '3rds' && 'Shows harmony notes a third above each scale degree overlaid on the original scale. For 7-note scales, harmony notes will overlap with original notes.'}
```

