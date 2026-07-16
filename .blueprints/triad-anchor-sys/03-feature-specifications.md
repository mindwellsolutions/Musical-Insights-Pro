# Complete Feature Specifications

## Executive Summary

This document provides exhaustive specifications for every feature in the Pentatonic Triad System. Each feature includes its purpose, user interaction flow, visual design, logic requirements, and edge cases.

---

## Feature 1: Dynamic Key & Mode Selection

### 1.1 Purpose
Allow users to select any musical key and mode (major/minor), which becomes the foundation for all subsequent calculations and visualizations.

### 1.2 User Interaction
```
┌─────────────────────────────────────────────────┐
│  Key Selection                                   │
│  ┌─────────┐  ┌─────────────────────────────┐  │
│  │    C    │  │ ○ Major   ● Minor           │  │
│  │    ▼    │  └─────────────────────────────┘  │
│  └─────────┘                                    │
│   Dropdown                Radio Buttons         │
└─────────────────────────────────────────────────┘
```

### 1.3 Dropdown Options
```
Natural Notes:  C, D, E, F, G, A, B
Sharps:         C#, D#, F#, G#, A#
Flats:          Db, Eb, Gb, Ab, Bb

Display preference: Show sharps by default
User can toggle between enharmonic spellings
```

### 1.4 State Changes on Selection
```typescript
// When user selects "C Major":
{
  selectedKey: { pitchClass: 0, name: 'C' },
  selectedMode: 'major',
  
  // Automatically computed:
  derivedState: {
    relativePentatonic: {
      root: { pitchClass: 9, name: 'A' },  // A minor pentatonic
      type: 'minor',
      notes: [A, C, D, E, G]
    }
  }
}
```

### 1.5 Visual Feedback
- Fretboard immediately updates to show new pentatonic overlay
- All triad positions recalculate
- Zone data updates
- Progression (if active) transposes to new key

### 1.6 Edge Cases
- If user rapidly changes keys, debounce recalculation by 150ms
- Preserve user's string set and inversion preferences across key changes

---

## Feature 2: Triad Position Visualization

### 2.1 Purpose
Display all possible triad voicings across the fretboard, organized by string set and inversion, with clear visual hierarchy.

### 2.2 Display Hierarchy

#### 2.2.1 String Set Organization
```
┌──────────────────────────────────────────────────────────────┐
│  STRING SETS                                                  │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  E-B-G  │  │  B-G-D  │  │  G-D-A  │  │  D-A-E  │        │
│  │  (123)  │  │  (234)  │  │  (345)  │  │  (456)  │        │
│  │ Strings │  │ Strings │  │ Strings │  │ Strings │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│   [Active]     [Normal]     [Normal]     [Normal]           │
└──────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Inversion Tabs Within Each String Set
```
┌──────────────────────────────────────────┐
│  Root Position  │  1st Inversion  │  2nd Inversion  │
│     [Active]    │    [Normal]     │    [Normal]     │
└──────────────────────────────────────────┘
```

### 2.3 Color Coding Specification

```
┌────────────────────────────────────────────────────────────┐
│  TRIAD NOTE COLORS                                          │
├──────────────────────────────────────────────────────────────┤
│  Root Note:                                                  │
│    Background: #E53935 (Red 600)                            │
│    Border: #B71C1C (Red 900)                                │
│    Text: #FFFFFF                                            │
│    Symbol: "R" inside circle                                │
│                                                              │
│  3rd (Major or Minor):                                      │
│    Background: #1E88E5 (Blue 600)                           │
│    Border: #0D47A1 (Blue 900)                               │
│    Text: #FFFFFF                                            │
│    Symbol: "3" or "♭3" inside circle                        │
│                                                              │
│  5th (Perfect, Dim, or Aug):                                │
│    Background: #43A047 (Green 600)                          │
│    Border: #1B5E20 (Green 900)                              │
│    Text: #FFFFFF                                            │
│    Symbol: "5", "♭5", or "#5" inside circle                 │
└──────────────────────────────────────────────────────────────┘
```

### 2.4 Visual Grouping of Shapes
```
Each triad shape gets:
- Subtle connecting lines between its 3 notes
- Optional bounding box highlight on hover
- Fret position label below shape

┌─────────────────────────────────┐
│         Fret 5     Fret 8       │
│           │          │          │
│    e ─────●──────────┼─────     │  ● = Root (R)
│    B ─────┼────●─────┼─────     │  ● = 5th
│    G ─────┼────┼─────●─────     │  ● = 3rd
│           │    │     │          │
│        └──┴────┴─────┘          │
│         "C Major - Root Pos"    │
└─────────────────────────────────────┘
```

### 2.5 Information Panel Content
When a voicing is selected:
```
┌────────────────────────────────────────────────────┐
│  POSITION DETAILS                                   │
├────────────────────────────────────────────────────┤
│  Name:        C Major Triad                        │
│  Inversion:   Root Position                        │
│  String Set:  1-2-3 (E-B-G)                        │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  String  │  Note  │  Fret  │  Finger    │       │
│  ├─────────────────────────────────────────┤       │
│  │    1 (E) │   G    │   3    │    3       │       │
│  │    2 (B) │   C    │   1    │    1       │       │
│  │    3 (G) │   E    │   2    │    2       │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  Interval Structure:  1 - 3 - 5                    │
│  Notes:               C - E - G                    │
└────────────────────────────────────────────────────┘
```

### 2.6 Fingering Algorithm
```typescript
function suggestFingering(voicing: TriadVoicing): [number, number, number] {
  const frets = voicing.positions.map(p => p.fret);
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const span = maxFret - minFret;
  
  // For compact shapes (span <= 2 frets)
  if (span <= 2) {
    return assignByPosition(voicing.positions);
  }
  
  // For stretched shapes
  return assignWithStretch(voicing.positions);
}

// Principles:
// 1. Lower fret = lower numbered finger (usually)
// 2. Avoid awkward stretches
// 3. Free pinky for embellishments when possible
```

### 2.7 Fretboard Coverage Display
Show all instances of selected triad type across entire fretboard:
```
Fret:   0   1   2   3   4   5   6   7   8   9   10  11  12
        ▓▓▓▓▓▓▓▓│   │   │▓▓▓▓▓▓▓│   │   │▓▓▓▓▓▓▓│▓▓▓▓▓
        Available positions for C Major (strings 1-2-3)
```

---

## Feature 3: Bar Chord Reference System

### 3.1 Purpose
Provide visual "anchor" showing the full bar chord that the triad is derived from, helping users connect triads to shapes they already know.

### 3.2 Reference Display Logic

```typescript
interface BarChordReference {
  // The full 6-string (or 5-string) bar chord
  fullShape: FretboardNote[];
  
  // The triad subset highlighted within it
  triadSubset: FretboardNote[];
  
  // CAGED system shape identifier
  cagedShape: 'E' | 'A' | 'D' | 'C' | 'G';
  
  // Position on neck
  rootFret: number;
}
```

### 3.3 Visual Rendering
```
┌──────────────────────────────────────────────────────────┐
│  BAR CHORD REFERENCE MODE                                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Full bar chord shown as semi-transparent overlay:        │
│                                                           │
│    e ─────░───●───────────────     ● = Active triad note │
│    B ─────░───●───────────────     ░ = Ghost bar chord   │
│    G ─────░───●───────────────                           │
│    D ─────░───░───────────────                           │
│    A ─────░───░───────────────                           │
│    E ─────░───░───────────────                           │
│           │   │                                          │
│          Fret 3                                          │
│           └── "E-shape bar chord"                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 3.4 Ghost Note Styling
```css
.bar-chord-ghost {
  opacity: 0.25;
  fill: #9E9E9E;
  stroke: #757575;
  stroke-dasharray: 3, 2;  /* Dashed outline */
}
```

### 3.5 Toggle Control
```
┌─────────────────────────────────┐
│  ☑ Show Bar Chord Reference    │
└─────────────────────────────────┘
```

### 3.6 CAGED Shape Mapping
```typescript
const CAGED_SHAPES = {
  'E': { rootString: 6, basePattern: [...] },
  'A': { rootString: 5, basePattern: [...] },
  'D': { rootString: 4, basePattern: [...] },
  'C': { rootString: 5, basePattern: [...] },  // Modified for bar chord
  'G': { rootString: 6, basePattern: [...] }
};

function findNearestCAGEDShape(triadVoicing: TriadVoicing): BarChordReference {
  // Find which CAGED shape contains this triad
  // Return the full shape with triad highlighted
}
```

---

## Feature 4: Compatible Nearby Chords ("Chord Neighborhood")

### 4.1 Purpose
Show users which other chords are easily accessible from their current position without significant hand movement.

### 4.2 Neighborhood Definition
```typescript
interface ChordNeighborhood {
  // The chord user is currently on
  currentChord: Triad;
  currentVoicing: TriadVoicing;
  
  // Chords within 2 frets (easy reach)
  immediateNeighbors: {
    chord: Triad;
    voicing: TriadVoicing;
    fretDistance: number;
    relationship: string;  // 'relative minor', 'IV chord', etc.
  }[];
  
  // Chords within 4 frets (slight shift)
  extendedNeighbors: {
    chord: Triad;
    voicing: TriadVoicing;
    fretDistance: number;
    relationship: string;
  }[];
}
```

### 4.3 Relationship Labels
```typescript
const CHORD_RELATIONSHIPS = {
  // Same root
  'quality_change': 'Same Root (Quality Change)',  // C → Cm
  
  // Diatonic relationships
  'relative_minor': 'Relative Minor',               // C → Am
  'relative_major': 'Relative Major',               // Am → C
  'subdominant': 'IV Chord (Subdominant)',         // C → F
  'dominant': 'V Chord (Dominant)',                 // C → G
  'supertonic': 'ii Chord (Supertonic)',           // C → Dm
  
  // Movement descriptions
  'step_down': '1 Step Down',
  'step_up': '1 Step Up',
  'third_down': 'Minor 3rd Down',
  'third_up': 'Minor 3rd Up'
};
```

### 4.4 Visual Display
```
┌──────────────────────────────────────────────────────────────┐
│  CHORD NEIGHBORHOOD                     Zone 3 (Frets 5-9)   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Current: C Major (Fret 5)                                   │
│                                                               │
│  ┌─ IMMEDIATE (within 2 frets) ─────────────────────────┐   │
│  │  ● Am (0 frets) - Relative Minor - Common Tones: 2   │   │
│  │  ● F (2 frets) - Subdominant                         │   │
│  │  ● Dm (1 fret) - ii Chord                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ EXTENDED (within 4 frets) ──────────────────────────┐   │
│  │  ○ G (3 frets) - Dominant                            │   │
│  │  ○ Em (3 frets) - iii Chord                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Click any chord to see voice leading path                   │
└──────────────────────────────────────────────────────────────┘
```

### 4.5 Fretboard Visualization
```
When Neighborhood mode is active, show all nearby chords as ghost shapes:

    e ─────●───○───────●───────     ● = Current chord (C)
    B ─────●───○───────●───────     ○ = Am (immediate)
    G ─────●───○───────●───────     ◐ = F (immediate)
    D ─────────◐───────○───────     ○ = G (extended)
           │   │       │
          C   Am       F
```

### 4.6 Click Behavior
When user clicks a neighborhood chord:
1. Animate voice leading path from current to clicked
2. Update information panel with movement details
3. Option to "commit" - make clicked chord the new current

---

## Feature 5: Pentatonic Scale Integration

### 5.1 Purpose
Overlay the appropriate pentatonic scale as a visual "anchor" behind all triad visualizations, matching the instructor's teaching method.

### 5.2 Automatic Pentatonic Selection
```typescript
function selectPentatonicOverlay(key: Note, mode: 'major' | 'minor'): PentatonicScale {
  if (mode === 'major') {
    // For major keys, show relative minor pentatonic
    // This is the instructor's core teaching approach
    const relativeMinor = (key.pitchClass - 3 + 12) % 12;
    return buildMinorPentatonic(relativeMinor);
  } else {
    // For minor keys, show same-root minor pentatonic
    return buildMinorPentatonic(key.pitchClass);
  }
}
```

### 5.3 Layer Rendering Order (Bottom to Top)
```
Layer 1: Pentatonic ghost notes (most transparent)
Layer 2: Bar chord reference (if enabled)
Layer 3: Triad notes (fully opaque)
Layer 4: Embellishment indicators (if enabled)
Layer 5: Selection/hover highlights
```

### 5.4 Ghost Note Styling
```css
.pentatonic-ghost {
  fill: #B0BEC5;          /* Blue-grey 200 */
  opacity: 0.4;
  r: 8px;                  /* Slightly smaller than triad notes */
}

.pentatonic-ghost.in-triad {
  /* Notes that are BOTH pentatonic AND in the triad */
  /* Show as full triad note, not ghost */
  display: none;
}
```

### 5.5 Pentatonic Box Boundaries
Show the current pentatonic "box" boundaries:
```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  e ─────░─────░───░─────░───░─────────                     │
│  B ─────░─────░───░─────░───░─────────   ░ = Pentatonic   │
│  G ─────░─────░───░─────░───░─────────                     │
│  D ─────░─────░───░─────░───░─────────   Box 1 boundary   │
│  A ─────░─────░───░─────░───░─────────   shown with subtle│
│  E ─────░─────░───░─────░───░─────────   background shade │
│         │     │                                            │
│        Fret 5 └───── Box 1 (A minor pentatonic)           │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 5.6 Toggle Options
```
┌─────────────────────────────────────────┐
│  Pentatonic Display:                     │
│    ○ Hidden                              │
│    ● Ghost Notes Only                    │
│    ○ Full Box Outline                    │
│    ○ All 5 Boxes                         │
└─────────────────────────────────────────┘
```

---

## Feature 6: Zone Navigation System

### 6.1 Purpose
Allow users to navigate the fretboard by "zones" (3-5 fret areas) rather than individual positions, building comprehensive neck knowledge.

### 6.2 Zone Definitions
```typescript
const ZONES: Zone[] = [
  { number: 1, start: 0, end: 3,  center: 2,  cagedShape: 'E/Open' },
  { number: 2, start: 2, end: 6,  center: 4,  cagedShape: 'D' },
  { number: 3, start: 5, end: 9,  center: 7,  cagedShape: 'C' },
  { number: 4, start: 7, end: 11, center: 9,  cagedShape: 'A' },
  { number: 5, start: 10, end: 14, center: 12, cagedShape: 'G' },
  { number: 6, start: 12, end: 15, center: 14, cagedShape: 'E (8va)' }
];
```

### 6.3 Zone Navigator UI
```
┌───────────────────────────────────────────────────────────────┐
│  ZONE NAVIGATION                                               │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│     ◀ Prev    [ Zone 3: Frets 5-9 ]    Next ▶                │
│                                                                │
│     ┌───┬───┬───┬───┬───┬───┐                                │
│     │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │  ← Zone quick-jump            │
│     └───┴───┴─●─┴───┴───┴───┘                                │
│               ▲ Current                                       │
│                                                                │
│     Jump to Fret: [____]  [Go]                                │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 6.4 Zone Shading on Fretboard
```
Fret:  0   1   2   3   4   5   6   7   8   9  10  11  12
       ░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░
                   │                     │
                   └─ Zone 3 (Active) ───┘
       
CSS:
.zone-active { background: rgba(33, 150, 243, 0.15); }
.zone-adjacent { background: rgba(33, 150, 243, 0.05); }
```

### 6.5 Zone Content Display
For each zone, show:
```
┌───────────────────────────────────────────────────────────────┐
│  ZONE 3 CONTENTS (Key: C Major)                               │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Reference Bar Chord:                                         │
│    C Major - A-shape at fret 3                               │
│                                                                │
│  Triads in this Zone:                                        │
│    • C Major (3 voicings)                                    │
│    • Am (3 voicings)                                         │
│    • F Major (2 voicings)                                    │
│    • Dm (2 voicings)                                         │
│                                                                │
│  Pentatonic Box:                                             │
│    Box 2 of A minor pentatonic                               │
│                                                                │
│  Practice Tip:                                                │
│    "This zone is great for R&B rhythm parts"                 │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 6.6 Zone Transition Animation
When changing zones:
1. Fade out current zone content
2. Slide fretboard view to new zone
3. Fade in new zone content
4. Duration: 300ms total

---

## Feature 7: String Set Filter

### 7.1 Purpose
Limit triad display to specific 3-string sets, implementing the instructor's "limitation technique" for clarity.

### 7.2 UI Control
```
┌───────────────────────────────────────────────────────────────┐
│  STRING SET FILTER                                             │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ○ All Sets                                                   │
│                                                                │
│  ● Set 1: E-B-G (Strings 1-2-3)  "Bright, cutting"           │
│                                                                │
│  ○ Set 2: B-G-D (Strings 2-3-4)  "Balanced, versatile"       │
│                                                                │
│  ○ Set 3: G-D-A (Strings 3-4-5)  "Warm, full"                │
│                                                                │
│  ○ Set 4: D-A-E (Strings 4-5-6)  "Deep, bass-heavy"          │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 7.3 Fretboard Masking
When a string set is selected, non-active strings are visually de-emphasized:
```css
.string-inactive {
  opacity: 0.3;
}

.string-active {
  opacity: 1.0;
}

/* String labels update */
.string-label.active {
  font-weight: bold;
  color: #1976D2;
}
```

### 7.4 State Integration
```typescript
// Filtering triads by string set
const filteredTriads = allTriads.filter(t => 
  selectedStringSet === 'all' || t.stringSet === selectedStringSet
);
```

---

## Feature 8: Inversion Selector

### 8.1 Purpose
Filter and highlight triads by inversion type, helping users understand and practice specific voicing concepts.

### 8.2 UI Control
```
┌───────────────────────────────────────────────────────────────┐
│  INVERSION FILTER                                              │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ○ All Inversions                                             │
│                                                                │
│  ● Root Position (1-3-5)   "Root in bass, stable sound"      │
│                                                                │
│  ○ 1st Inversion (3-5-1)   "Third in bass, smooth movement"  │
│                                                                │
│  ○ 2nd Inversion (5-1-3)   "Fifth in bass, open sound"       │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 8.3 Educational Content
Each inversion option shows:
- Interval stack description
- Sound character
- Common usage context

---

## Feature 9: Two-Note Mode ("Breathing" Technique)

### 9.1 Purpose
Implement the instructor's "sonic landscape breath" technique by hiding one note of the triad.

### 9.2 Mode Options
```
┌───────────────────────────────────────────────────────────────┐
│  TWO-NOTE MODE                                                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ○ Off (Full Triad)                                           │
│                                                                │
│  ● Outside Notes     Removes middle note                      │
│    Shows: Highest + Lowest (strings 1 & 3 of set)            │
│    Sound: "Shell voicing, airy"                              │
│                                                                │
│  ○ Top Notes         Removes lowest note                      │
│    Shows: Middle + Highest (strings 1 & 2 of set)            │
│    Sound: "Upper structure, bright"                           │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 9.3 Visual Rendering
```
Full Triad:          Outside Notes:        Top Notes:
e ──●── (5th)       e ──●── (5th)         e ──●── (5th)
B ──●── (3rd)       B ──○── (muted)       B ──●── (3rd)
G ──●── (Root)      G ──●── (Root)        G ──○── (muted)

● = Active note
○ = Muted note (shown as hollow circle with X)
```

### 9.4 Muted Note Styling
```css
.note-muted {
  fill: transparent;
  stroke: #9E9E9E;
  stroke-dasharray: 4, 2;
  opacity: 0.5;
}

.note-muted::after {
  content: '×';
  font-size: 10px;
  color: #757575;
}
```

---

## Feature 10: Embellishment Mode

### 10.1 Purpose
Highlight pentatonic notes within reach of the triad fingers for slides, hammer-ons, and pull-offs.

### 10.2 Indicator Types
```typescript
type EmbellishmentIndicator = {
  type: 'slide-up' | 'slide-down' | 'hammer' | 'pull';
  fromPosition: FretPosition;
  toPosition: FretPosition;
  visualType: 'arrow' | 'curve' | 'bracket';
};
```

### 10.3 Visual Rendering
```
Slide Indicators:
    │
e ──┤────●────    ● = Triad note
    │  ↗         ↗ = Slide from one fret below
    │ ○          ○ = Approach note (one fret below)
    │
   Fret 4    Fret 5

Hammer-on/Pull-off Indicators:
    │
G ──●─────◌─────   ● = Triad note
    │     └── ◌ = Available pentatonic note for hammer/pull
    │
```

### 10.4 Styling
```css
.embellishment-arrow {
  stroke: #FF9800;
  stroke-width: 2;
  marker-end: url(#arrowhead);
}

.embellishment-note {
  fill: #FFF3E0;
  stroke: #FF9800;
  stroke-dasharray: 2, 2;
  r: 6px;
}
```

### 10.5 Toggle Control
```
┌─────────────────────────────────────┐
│  ☑ Show Embellishment Points        │
│    ☑ Slide approaches               │
│    ☑ Hammer-on/Pull-off targets     │
└─────────────────────────────────────┘
```

---

## Feature 11: Voice Leading Visualization

### 11.1 Purpose
Show the optimal path between chords with minimal movement, animating the voice leading concept.

### 11.2 Calculation Display
```
┌───────────────────────────────────────────────────────────────┐
│  VOICE LEADING: C Major → A Minor                             │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Voice Movement:                                              │
│    ┌─────────────────────────────────────────────┐           │
│    │  String 1:  G (fret 3) → E (fret 5)  +2    │           │
│    │  String 2:  C (fret 1) → C (fret 1)   0 ★  │  ★ = Common │
│    │  String 3:  E (fret 2) → A (fret 2)   0 ★  │      tone   │
│    └─────────────────────────────────────────────┘           │
│                                                                │
│  Total Movement: 2 semitones                                  │
│  Rating: ★★★★★ Excellent                                     │
│  Common Tones: 2                                              │
│                                                                │
│  [ ▶ Animate ]  [ Show on Fretboard ]                        │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 11.3 Animation Sequence
```typescript
async function animateVoiceLeading(
  from: TriadVoicing, 
  to: TriadVoicing, 
  duration: number = 800
) {
  // 1. Highlight current voicing
  highlightVoicing(from, 'active');
  await delay(200);
  
  // 2. Show movement arrows
  showMovementArrows(from, to);
  await delay(300);
  
  // 3. Fade current, fade in new
  fadeVoicing(from, 0.3);
  fadeInVoicing(to, 1.0);
  await delay(300);
  
  // 4. Clean up arrows, finalize
  hideMovementArrows();
  highlightVoicing(to, 'active');
}
```

### 11.4 Fretboard Connection Lines
```
When showing voice leading:

e ──●═══════════════════●──   ═══ = Voice movement line
B ──●──────────────●───────   ─── = Common tone (stays)
G ──●──────────●───────────   
    │          │
   C Maj      A min
```

---

## Feature 12: Chord Progression Builder

### 12.1 Purpose
Allow users to input or select chord progressions and see voice-led triad paths.

### 12.2 UI Interface
```
┌───────────────────────────────────────────────────────────────┐
│  PROGRESSION BUILDER                                          │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Key: [C Major ▼]                                             │
│                                                                │
│  Quick Presets:                                               │
│    [I-V-vi-IV] [I-vi-IV-V] [ii-V-I] [I-IV-I-V]              │
│                                                                │
│  Current Progression:                                         │
│    ┌─────┬─────┬─────┬─────┬─────┐                          │
│    │  C  │  G  │  Am │  F  │  +  │                          │
│    │  I  │  V  │  vi │  IV │     │                          │
│    └─────┴─────┴─────┴─────┴─────┘                          │
│       ▲                                                       │
│     Current                                                   │
│                                                                │
│  [ ◀ Prev ]  [ Play ▶ ]  [ Next ▶ ]  [ Clear ]              │
│                                                                │
│  Tempo: [120] BPM    Beats per chord: [4]                    │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 12.3 Auto-Optimization
```typescript
function optimizeProgressionVoicings(
  progression: Progression,
  constraints: {
    stringSet?: StringSet;
    startingZone?: number;
    preferCommonTones?: boolean;
  }
): TriadVoicing[] {
  // Start with first chord's most central voicing
  let current = findBestStartingVoicing(progression.chords[0], constraints);
  const result = [current];
  
  // For each subsequent chord, find smoothest voice leading
  for (let i = 1; i < progression.chords.length; i++) {
    const next = findOptimalNextVoicing(current, progression.chords[i], constraints);
    result.push(next);
    current = next;
  }
  
  return result;
}
```

### 12.4 Playback Mode
When progression is playing:
- Current chord highlighted
- Metronome click option
- Auto-advance with beat
- Voice leading animation between chords

---

## Feature 13: Fingering Display

### 13.1 Purpose
Show recommended fingerings (1-2-3-4) for each triad voicing.

### 13.2 Display Options
```
┌───────────────────────────────────────┐
│  FINGERING DISPLAY                    │
├───────────────────────────────────────┤
│  ○ Hidden                             │
│  ● Numbers on Notes                   │
│  ○ Hand Diagram                       │
└───────────────────────────────────────┘
```

### 13.3 Note-Based Display
```
Finger numbers appear inside note circles:

e ──(3)──    3 = Ring finger
B ──(1)──    1 = Index finger
G ──(2)──    2 = Middle finger
```

### 13.4 Hand Diagram (Optional Enhancement)
```
┌─────────────────┐
│   Fret 5        │
│   ┌───┐         │
│   │ 1 │ ← Index │
│   │ 2 │ ← Middle│
│   │ 3 │ ← Ring  │
│   │   │         │
│   └───┘         │
└─────────────────┘
```

---

*This document provides complete specifications for all features. Implementation should follow these specs precisely.*
