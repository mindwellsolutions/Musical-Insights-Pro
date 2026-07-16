# Triad and CAGED System - Technical Overview

## Table of Contents
1. [Triad System Overview](#triad-system-overview)
2. [How Triads Are Determined](#how-triads-are-determined)
3. [Data Structures](#data-structures)
4. [Position Calculation Algorithm](#position-calculation-algorithm)
5. [Color System](#color-system)
6. [Fretboard Display Logic](#fretboard-display-logic)
7. [CAGED System Overview](#caged-system-overview)
8. [CAGED Integration with Triads](#caged-integration-with-triads)
9. [Future: CAGED as Standalone View](#future-caged-as-standalone-view)

---

## Triad System Overview

### What is a Triad?
A triad is a three-note chord consisting of:
- **Root**: The fundamental note that gives the chord its name
- **Third**: Determines the quality (major or minor)
- **Fifth**: Completes the harmonic structure

### Triad Types Supported
The system supports four triad types, each with unique interval patterns:

| Triad Type | Intervals (semitones) | Example (C root) | Notes |
|------------|----------------------|------------------|-------|
| **Major** | [0, 4, 7] | C major | C, E, G |
| **Minor** | [0, 3, 7] | C minor | C, E♭, G |
| **Diminished** | [0, 3, 6] | C diminished | C, E♭, G♭ |
| **Augmented** | [0, 4, 8] | C augmented | C, E, G♯ |

### Triad Inversions
Each triad can be played in three inversions based on which note is in the bass (lowest position):

- **Root Position**: Root note in bass (e.g., C-E-G)
- **First Inversion**: Third in bass (e.g., E-G-C)
- **Second Inversion**: Fifth in bass (e.g., G-C-E)

---

## How Triads Are Determined

### 1. Note Calculation (`lib/triad-theory.ts`)

The `getTriadNotes()` function calculates the three notes of any triad:

```typescript
export function getTriadNotes(rootNote: string, triadType: TriadType): string[] {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = NOTES.indexOf(rootNote);
  const intervals = TRIAD_INTERVALS[triadType];
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}
```

**Example**: C major
- Root index: 0 (C)
- Intervals: [0, 4, 7]
- Result: [C, E, G]

### 2. Position Calculation (`lib/triad-positions.ts`)

The `calculateTriadPositions()` function finds ALL playable 3-note triad voicings across the fretboard.

**Key Principles**:
- Uses **adjacent string sets** (3 strings each) for playability
- Scans the entire 24-fret range
- Validates each position for correct notes and playability
- Assigns unique position indices for color coding

**String Sets**:
1. Strings 1-2-3 (High E, B, G)
2. Strings 2-3-4 (B, G, D)
3. Strings 3-4-5 (G, D, A)
4. Strings 4-5-6 (D, A, Low E)

---

## Data Structures

### TriadPosition Interface
```typescript
interface TriadPosition {
  rootNote: string;           // e.g., "C"
  triadType: TriadType;       // "major", "minor", "diminished", "augmented"
  inversion: TriadInversion;  // "root", "first", "second"
  cagedShape: CAGEDShape | null;  // "C", "A", "G", "E", "D", or null
  fretPosition: number;       // Lowest fret in the position
  stringSet: number;          // 1-4 (which 3-string set)
  stringPositions: StringPosition[];  // Exactly 3 notes
  positionIndex: number;      // Unique index for color coding (0-based)
}
```

### StringPosition Interface
```typescript
interface StringPosition {
  stringIndex: number;  // 0-5 (0 = low E, 5 = high E) - matches fretboard component
  fret: number;          // 0-24
  note: string;          // e.g., "C", "E", "G"
  chordTone: 'root' | 'third' | 'fifth';
}
```

### Database Structure
The pre-generated database (`public/data/triads/triad-database.json`) contains:
- **48 triads** (12 root notes × 4 triad types)
- **1,114 total positions** (average 23.2 positions per triad)
- Each entry includes root note, triad type, symbol, notes array, and positions array

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-01-25T16:40:51.779Z",
  "triads": [
    {
      "rootNote": "C",
      "triadType": "major",
      "symbol": "C",
      "notes": ["C", "E", "G"],
      "positions": [ /* array of TriadPosition objects */ ]
    }
  ]
}
```

---

## Position Calculation Algorithm

The algorithm systematically scans the fretboard to find all valid triad positions:

### Step-by-Step Process

1. **For each string set** (1-2-3, 2-3-4, 3-4-5, 4-5-6):
   
2. **For each fret on string 1** (0-24):
   - Check if the note at this position is part of the triad
   - If not, skip to next fret
   
3. **For each fret on string 2** (0-24):
   - Check if the note is a different triad note
   - If not, skip to next fret
   
4. **For each fret on string 3** (0-24):
   - Check if the note completes the triad
   
5. **Validation**:
   - ✓ Exactly 3 unique notes
   - ✓ All notes are in the triad (root, third, fifth)
   - ✓ Playable span (max fret - min fret ≤ 4)
   
6. **Determine inversion**:
   - Based on the lowest note (string 3, which is lowest in pitch)
   - If lowest = root → root position
   - If lowest = third → first inversion
   - If lowest = fifth → second inversion
   
7. **Assign CAGED shape**:
   - Uses simplified heuristic based on fret position
   - CAGED system repeats every 12 frets (one octave)
   
8. **Create position object**:
   - Store all metadata (notes, frets, chord tones, inversion, etc.)
   - Assign unique `positionIndex` for color coding

### Example: C Major on Strings 1-2-3, Frets 0-1-0
- String 1, fret 0 = E (third)
- String 2, fret 1 = C (root)
- String 3, fret 0 = G (fifth)
- Lowest note = G → **Second inversion**
- Fret span = 1 → **Playable** ✓
- Position index = 0

---

## Color System

The system uses **two distinct color modes** to visualize triads on the fretboard.

### 1. Position-Based Colors (Default Mode)

**Purpose**: Distinguish different triad positions with unique colors

**Color Palette**: 20 distinct colors defined in `POSITION_COLORS` array
```typescript
export const POSITION_COLORS = [
  '#FF6B9D',  // Pink
  '#4ECDC4',  // Turquoise
  '#FFE66D',  // Yellow
  '#95E1D3',  // Mint
  '#C77DFF',  // Purple
  '#FF9F1C',  // Orange
  // ... 14 more colors
];
```

**Color Assignment**:
```typescript
export function getPositionColor(positionIndex: number): string {
  return POSITION_COLORS[positionIndex % POSITION_COLORS.length];
}
```

Each triad position gets a unique color based on its `positionIndex`. If there are more than 20 positions, colors cycle through the palette.

**Example**: C major has ~23 positions
- Position 0 → Pink (#FF6B9D)
- Position 1 → Turquoise (#4ECDC4)
- Position 2 → Yellow (#FFE66D)
- ...
- Position 20 → Pink again (cycles)

### 2. CAGED-Based Colors (CAGED Guide Mode)

**Purpose**: Show CAGED shape associations for learning the CAGED system

**Color Palette**: 5 colors, one for each CAGED shape
```typescript
export const CAGED_COLORS: Record<CAGEDShape, string> = {
  C: '#FF6B6B',  // Coral Red
  A: '#4ECDC4',  // Turquoise
  G: '#FFE66D',  // Sunny Yellow
  E: '#95E1D3',  // Mint Green
  D: '#C7CEEA',  // Lavender Blue
};
```

**When Active**: Enabled by toggling the "CAGED Guide" button in the UI

**Color Assignment**: Based on the `cagedShape` property of each position
- All positions associated with CAGED "C" shape → Coral Red
- All positions associated with CAGED "A" shape → Turquoise
- etc.

### Color Mode Switching Logic (`components/Fretboard.tsx`)

```typescript
// Determine color based on mode
let noteColor: string;
let colorLabel: string;

if (showCAGEDGuide && position.cagedShape) {
  // Use CAGED color when CAGED guide is enabled
  noteColor = CAGED_COLORS[position.cagedShape];
  colorLabel = `CAGED ${position.cagedShape}`;
} else {
  // Use position-based color for triad positions
  noteColor = getPositionColor(position.positionIndex);
  colorLabel = `Position ${position.positionIndex + 1}`;
}
```

---

## Fretboard Display Logic

### How Triads Are Displayed (`components/Fretboard.tsx`)

The fretboard component renders triads by iterating through each string and fret position, checking if that location contains a triad note.

### Display Algorithm

**For each fret position on the fretboard**:

1. **Check if triad mode is active** and triad notes are loaded

2. **Check if the note at this position is a triad note**
   - If not, skip (don't display anything)

3. **Find ALL matching positions** that contain this note at this string/fret:
   ```typescript
   const matchingPositions = triadPositions.filter((position) => {
     // Filter by selected CAGED shapes if CAGED guide is enabled
     if (showCAGEDGuide && position.cagedShape &&
         !selectedCAGEDShapes.includes(position.cagedShape)) {
       return false;
     }

     // Check if this string/fret matches any note in this position
     return position.stringPositions.some(
       (sp) => sp.stringIndex === stringIndex && sp.fret === fretIndex
     );
   });
   ```

4. **If matches found**, use the first matching position for display

5. **Determine color** based on current mode (Position or CAGED)

6. **Determine chord tone type** (root, third, or fifth)

7. **Render the note** with:
   - Colored circle background
   - Note name (e.g., "C", "E", "G")
   - Chord tone badge (R, 3, or 5)
   - Colored border and glow effect
   - Educational tooltip

### Visual Elements

**Note Circle**:
- 32px diameter
- Background color from color system
- White text
- 3px solid border in matching color
- Glow effect using box-shadow

**Chord Tone Badge**:
- Small badge in bottom-right corner
- Shows "R" (root), "3" (third), or "5" (fifth)
- Black background with white text
- Helps identify the function of each note

**Tooltip** (on hover):
```
C - Root
Position 1
Root Position
String Set: 1
Fret: 3
```

### Filtering by CAGED Shapes

When CAGED Guide is enabled, users can toggle individual CAGED shapes on/off:
- Only positions matching selected CAGED shapes are displayed
- Allows focusing on specific patterns
- Reduces visual clutter when learning

---

## CAGED System Overview

### What is the CAGED System?

The CAGED system is a guitar teaching method that divides the fretboard into **5 overlapping positions** based on the shapes of the five basic open chord forms: **C, A, G, E, and D**.

### Key Concepts

1. **Five Basic Shapes**: Each shape is based on an open chord form
   - **C shape**: Based on open C major chord
   - **A shape**: Based on open A major chord
   - **G shape**: Based on open G major chord
   - **E shape**: Based on open E major chord
   - **D shape**: Based on open D major chord

2. **Movable Patterns**: Each shape can be moved up the fretboard to play different chords
   - E.g., E shape at fret 3 = G major
   - E.g., A shape at fret 5 = D major

3. **Octave Repetition**: The CAGED sequence repeats every 12 frets (one octave)
   - Frets 0-2: E shape region
   - Frets 3-4: D shape region
   - Frets 5-6: C shape region
   - Frets 7-9: A shape region
   - Frets 10-11: G shape region
   - Frets 12-14: E shape again (one octave higher)

4. **Connecting Patterns**: The shapes connect seamlessly across the fretboard
   - Learning one shape helps you find the next
   - Provides complete fretboard coverage

### CAGED Shape Determination in This App

The app uses a **simplified heuristic** to associate triad positions with CAGED shapes:

```typescript
function determineCCAGEDShape(fretPosition: number, stringSetIdx: number): CAGEDShape | null {
  const positionInOctave = fretPosition % 12;

  if (positionInOctave >= 0 && positionInOctave < 3) return 'E';
  if (positionInOctave >= 3 && positionInOctave < 5) return 'D';
  if (positionInOctave >= 5 && positionInOctave < 7) return 'C';
  if (positionInOctave >= 7 && positionInOctave < 10) return 'A';
  return 'G';
}
```

**Note**: This is a simplified approximation. A more sophisticated implementation could use pattern matching against actual CAGED chord shapes.

### CAGED Colors

Each CAGED shape has a unique, memorable color:

| Shape | Color | Hex Code | Visual Association |
|-------|-------|----------|-------------------|
| **C** | Coral Red | #FF6B6B | Warm, foundational |
| **A** | Turquoise | #4ECDC4 | Cool, flowing |
| **G** | Sunny Yellow | #FFE66D | Bright, central |
| **E** | Mint Green | #95E1D3 | Fresh, open |
| **D** | Lavender Blue | #C7CEEA | Calm, upper register |

---

## CAGED Integration with Triads

### Current Implementation

The CAGED system is currently integrated with triads in the following ways:

#### 1. CAGED Shape Association
- Each triad position is associated with a CAGED shape during calculation
- Stored in the `cagedShape` property of `TriadPosition`
- Based on fret position using the simplified heuristic

#### 2. CAGED Guide Toggle
**Location**: `components/TriadTab.tsx`

**Functionality**:
- Button in the header to enable/disable CAGED Guide mode
- When enabled:
  - Switches from position-based colors to CAGED colors
  - Activates CAGED shape filtering
  - Shows CAGED Legend with toggleable shapes

**UI Element**:
```typescript
<button onClick={() => onShowCAGEDGuideChange(!showCAGEDGuide)}>
  {showCAGEDGuide ? <Eye /> : <EyeOff />}
  CAGED Guide
</button>
```

#### 3. CAGED Legend Component
**Location**: `components/CAGEDLegend.tsx`

**Features**:
- Displays all 5 CAGED shapes with their colors
- 2-column grid layout for compact display
- Checkbox toggles for each shape (when CAGED Guide is enabled)
- Visual feedback for selected shapes
- Info text explaining the toggle functionality

**Interaction**:
- Click on a shape to toggle it on/off
- At least one shape must remain selected
- Only positions matching selected shapes are displayed on fretboard

#### 4. Position Statistics
**Location**: `components/TriadTab.tsx`

**Display**:
- Shows count of positions for each CAGED shape
- Shows count of positions for each inversion
- Updates dynamically based on selected triad
- Helps users understand the distribution of positions

**Example for C Major**:
```
CAGED Shapes:
C: 5 positions
A: 4 positions
G: 5 positions
E: 5 positions
D: 4 positions

Inversions:
Root: 8 positions
1st: 8 positions
2nd: 7 positions
```

### User Workflow

1. **Select a triad** (e.g., C major)
2. **View all positions** with unique position-based colors
3. **Enable CAGED Guide** to switch to CAGED color mode
4. **Toggle CAGED shapes** to focus on specific patterns
5. **Hover over notes** to see CAGED shape, inversion, and other details

---

## Future: CAGED as Standalone View

### Potential Implementation

The CAGED system could be displayed as a **separate view option** independent of triads. Here's how it could work:

#### 1. New "CAGED Patterns" Tab

**Location**: Add a new tab alongside "Chord Tones" and "Triads"

**Purpose**: Dedicated view for learning and practicing CAGED shapes

**Features**:
- Select a root note (e.g., C)
- Select a CAGED shape (C, A, G, E, or D)
- Display the full chord shape on the fretboard
- Show all 6 strings (not just 3-string triads)
- Include optional notes and extensions
- Show finger positions

#### 2. CAGED Shape Selector

**UI Component**: Similar to TriadSelector but for CAGED shapes

**Options**:
- Root note selector (12 notes)
- CAGED shape selector (C, A, G, E, D)
- Chord type selector (major, minor, 7th, etc.)
- Display mode (full chord, triad only, arpeggio)

#### 3. Full Chord Shapes

**Data Structure**:
```typescript
interface CAGEDChordShape {
  shape: CAGEDShape;
  rootNote: string;
  chordType: string;
  fretPosition: number;
  notes: {
    stringNumber: number;
    fret: number;
    note: string;
    chordTone: string;
    optional: boolean;
    fingerPosition?: number;
  }[];
}
```

#### 4. Shape Progression View

**Feature**: Show how CAGED shapes connect across the fretboard

**Display**:
- Highlight the current shape
- Show the next shape in the sequence
- Animate transitions between shapes
- Practice mode for learning shape changes

#### 5. Comparison Mode

**Feature**: Compare triad positions vs. full CAGED shapes

**Display**:
- Split view showing both
- Toggle between triad and full chord
- Highlight common notes
- Show how triads fit within full chords

### Implementation Steps

1. **Create CAGED pattern library** (`lib/caged-patterns.ts`)
   - Define full chord shapes for each CAGED form
   - Include finger positions
   - Support multiple chord types

2. **Create CAGED database** (`public/data/caged/caged-database.json`)
   - Pre-generate all CAGED shapes for all root notes
   - Include metadata (difficulty, common uses, etc.)

3. **Create CAGED Tab component** (`components/CAGEDTab.tsx`)
   - Shape selector UI
   - Display controls
   - Integration with fretboard

4. **Update fretboard component** (`components/Fretboard.tsx`)
   - Add CAGED display mode
   - Support full 6-string chord shapes
   - Show finger positions

5. **Add to main navigation**
   - New tab in the tabbed interface
   - State management for CAGED mode
   - Persistence to localStorage

### Benefits of Standalone CAGED View

- **Focused Learning**: Dedicated space for CAGED system study
- **Full Chord Shapes**: Not limited to 3-note triads
- **Finger Positions**: Show proper fingering for each shape
- **Shape Transitions**: Practice moving between CAGED shapes
- **Flexibility**: Can be used independently of triad study
- **Comprehensive**: Covers all aspects of the CAGED system

---

## Summary

### Current System Capabilities

✅ **Triad Calculation**: Accurate 3-note triad positions across 24 frets
✅ **Position-Based Colors**: 20 unique colors for position identification
✅ **CAGED Integration**: Simplified CAGED shape associations
✅ **Dual Color Modes**: Switch between position and CAGED colors
✅ **Interactive Filtering**: Toggle CAGED shapes on/off
✅ **Educational Tooltips**: Detailed information on hover
✅ **Complete Coverage**: 1,114 positions across 48 triads

### Key Files

- **`lib/triad-theory.ts`**: Core triad theory and color definitions
- **`lib/triad-positions.ts`**: Position calculation algorithm
- **`lib/triad-database-loader.ts`**: Database loading and caching
- **`components/Fretboard.tsx`**: Fretboard visualization (lines 450-534)
- **`components/TriadTab.tsx`**: Main triad UI container
- **`components/CAGEDLegend.tsx`**: CAGED shape legend and toggles
- **`public/data/triads/triad-database.json`**: Pre-generated database
- **`scripts/generateTriadDatabase.ts`**: Database generation script

### Future Enhancements

🔮 Standalone CAGED view with full chord shapes
🔮 Finger position suggestions
🔮 Shape transition animations
🔮 Practice mode with exercises
🔮 Audio playback for each position
🔮 More sophisticated CAGED shape determination

---

**Document Version**: 1.0
**Last Updated**: 2026-01-25
**Author**: Musical Insights Development Team

