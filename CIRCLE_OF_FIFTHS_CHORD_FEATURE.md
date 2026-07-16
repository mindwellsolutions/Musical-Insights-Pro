# Circle of Fifths - Interactive Chord Display Feature

## Overview
The Circle of Fifths now supports interactive chord display. Users can click on any major or minor key to see all the diatonic chords in that key, highlighted with their scale degree positions.

## Music Theory Implementation

### Major Keys
When a major key is selected (outer circle), the system displays all 7 diatonic chords:
- **Position 1 (I)**: Tonic - Major chord on the selected note
- **Position 2 (ii)**: Supertonic - Minor chord
- **Position 3 (iii)**: Mediant - Minor chord
- **Position 4 (IV)**: Subdominant - Major chord (one step LEFT in the circle)
- **Position 5 (V)**: Dominant - Major chord (one step RIGHT in the circle)
- **Position 6 (vi)**: Submediant - Minor chord
- **Position 7 (vii°)**: Leading Tone - Diminished chord

### Minor Keys
When a minor key is selected (inner circle), the system displays all 7 diatonic chords in natural minor:
- **Position 1 (i)**: Tonic - Minor chord on the selected note
- **Position 2 (ii°)**: Supertonic - Diminished chord
- **Position 3 (III)**: Mediant - Major chord
- **Position 4 (iv)**: Subdominant - Minor chord (one step LEFT in the inner circle)
- **Position 5 (v)**: Dominant - Minor chord (one step RIGHT in the inner circle)
- **Position 6 (VI)**: Submediant - Major chord
- **Position 7 (VII)**: Subtonic - Major chord

### The Circle of Fifths Trick
The implementation uses the classic Circle of Fifths trick for finding I-IV-V chords:
1. Select any note (e.g., G major)
2. That note is Position 1 (I) - the tonic
3. One step counter-clockwise (left) is Position 4 (IV) - the subdominant (C)
4. One step clockwise (right) is Position 5 (V) - the dominant (D)

The other chord positions (2, 3, 6, 7) are calculated using their semitone intervals from the root.

### Position Numbers in Minor Keys
**Important Music Theory Note**: When a minor key is selected, the position numbers remain consistent with the minor scale degrees. For example, in E minor:
- E is position 1 (i)
- F# is position 2 (ii°)
- G is position 3 (III)
- A is position 4 (iv)
- B is position 5 (v)
- C is position 6 (VI)
- D is position 7 (VII)

The positions do NOT change to match the relative major. This is musically accurate because each key (major or minor) has its own set of scale degrees.

## Visual Design

### Highlighting
- **Green (#22c55e)**: Chords that belong to the selected key
- **Green ring**: Surrounds chord notes in the circle
- **Position numbers**: Displayed below each chord note in green
- **White border**: Indicates the selected root key

### Chord Information Panel
When a key is selected, a panel appears below the circle showing:
- All 7 chords in a grid layout
- Position number (1-7)
- Chord symbol (e.g., C, Dm, E°)
- Roman numeral notation (e.g., I, ii, vii°)
- Helpful tip about the Circle of Fifths trick

## User Interaction
1. **Click a major key** (outer circle) to see all chords in that major key
2. **Click a minor key** (inner circle) to see all chords in that minor key
3. **Click the same key again** to deselect and clear the display
4. **Click "Clear"** button in the chord panel to deselect

## Files Modified
- `components/CircleOf5ths.tsx` - Added interactive chord display functionality
- `lib/music-theory/circle-of-fifths-chords.ts` - New utility file for chord calculations

## Technical Implementation
- Uses accurate diatonic chord formulas for major and minor keys
- Calculates chord root notes using semitone intervals
- Highlights notes in both major (outer) and minor (inner) circles
- Displays position numbers relative to the selected key
- Provides clear visual feedback with green highlighting
- Shows comprehensive chord information in an organized panel

