# Triad Arc Band & Focus Mode — GUI/UX & Dev Blueprint

> **Scope**: Two interconnected features adding diatonic triad membership visualization to the note circles on every fretboard and a single-triad spotlight mode for players navigating triads mid-phrase.  
> **Do not implement** until explicitly instructed.

---

## Table of Contents
1. [Existing Codebase Anchors](#1-existing-codebase-anchors)
2. [Feature 1 — Bottom Arc Band Note Circle](#2-feature-1)
3. [Feature 2 — Single Triad Focus Mode](#3-feature-2)
4. [Data Architecture](#4-data-architecture)
5. [State Architecture](#5-state-architecture)
6. [Component Architecture](#6-component-architecture)
7. [Fretboard Rendering Logic](#7-fretboard-rendering-logic)
8. [UX Behaviour & Controls](#8-ux-behaviour--controls)
9. [Color System](#9-color-system)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Existing Codebase Anchors

| Asset | Path | Relevance |
|---|---|---|
| `Fretboard` | `components/Fretboard.tsx` | Note circle render target; 32×32px circles, `boxShadow` glow, `borderRadius:50%`. **No** `overflow:hidden` currently. |
| `NotePosition` | `lib/musicTheory.ts` | Core type per fret dot — `note, isRoot, sharedChordColors, chordTone`. New fields added here. |
| `NOTE_COLORS` | `lib/musicTheory.ts` | 12 note-name → hex; fills the circle interior. Must **not** collide with triad palette. |
| `ALL_INTERVAL_COLORS` | `lib/musicTheory.ts` | 12 semitone → hex; used for chord-tone glow. Must **not** collide with triad palette. |
| `CHORD_TONE_COLORS` | `lib/musicTheory.ts` & `Fretboard.tsx` | root=#E85555, third=#F5BC3C, fifth=#5DB572, seventh=#A07ED4. Used for glow/border; untouched by these features. |
| `showTriadRingsOnScale` | `Fretboard.tsx` prop | Existing triad-ring mode — co-exists with the arc band (independent prop). |
| `calculateScalePositions` | `lib/musicTheory.ts` | Provides all scale note positions; source for membership derivation. |
| `getScaleNotes` | `lib/musicTheory.ts` | Returns note-name array for key+scale; used to drive diatonic-triad computation. |
| `normalizeNoteToSharp` | `lib/triad-theory.ts` | Canonical enharmonic normalization already used throughout Fretboard. |
| `page.tsx` | `app/page.tsx` | Top-level state home; existing `showTriadMode`, `triadData`, key/scale state. |

### Layer Stack (Existing → Unchanged)
Each note circle is currently built as a single `<div>` with:
- `boxShadow` → outer glow (chord-tone or circle-of-5ths color)
- `border: 3px solid {color}` → circle stroke
- `backgroundColor: NOTE_COLORS[note]` → identity fill
- `color: #fff` + centered text → note letter

All four layers **remain identical** in both Feature 1 and Feature 2. The arc band is an **additive** inner element only.

---

## 2. Feature 1 — Bottom Arc Band Note Circle

### 2.1 Purpose
Show which diatonic triads contain each note directly on the note circle, without altering note identity or chord-tone glow. Because the band is always anchored to the same bottom position, the eye learns where to look after one pass.

### 2.2 Visual Specification

```
┌─────────────────────────────┐
│     ╔══════════════╗        │
│     ║      B       ║  ←── letter nudged up 3px     │
│     ║   ┌──┬──┬──┐ ║        │
│     ║   │I │IV│vi│ ║  ←── bottom arc band (28% height)│
│     ╚═══╧══╧══╧══╝══╝        │
│    (each segment = triad color, separated by 1px black divider) │
└─────────────────────────────┘
```

**Circle dimensions** (current): 32px × 32px, `borderRadius: 50%`.  
**Band height**: 9px (~28% of 32px). On any larger circle variant (e.g. 36px hover state), scale proportionally: `Math.round(diameter * 0.28)`.  
**Divider**: `1px solid rgba(0,0,0,0.85)` right-border on all segments except the last. The dark line gives the clear visual separation requested.

### 2.3 Layer Stack — Updated Order (Outermost → Innermost)

| Layer | Element | Implementation |
|---|---|---|
| **Outer glow** | `boxShadow` on the circle div | **Unchanged** — chord-tone or C5ths glow |
| **Circle border** | `border: 3px solid` | **Unchanged** — chord-tone color |
| **Circle fill** | `backgroundColor: NOTE_COLORS[note]` | **Unchanged** — identity color |
| **Note letter** | Centered text | Nudge up: `transform: 'translateY(-3px)'` when band is visible |
| **Bottom arc band** | Absolute `<div>` at bottom inside circle | **New** — clipped by `overflow: hidden` on the circle div |

### 2.4 Arc Band Rules

1. **Overflow clip**: Add `overflow: 'hidden'` and `position: 'relative'` to the circle `<div>`. This makes the band follow the circle's curve for free — no SVG clipping path needed.
2. **Band element**: `position: 'absolute', bottom: 0, left: 0, right: 0, height: bandHeight, display: 'flex'`
3. **N segments**: one per enabled triad that contains this note.  
   - Normal diatonic scale → exactly 3 segments (every note belongs to exactly 3 diatonic triads).  
   - Pentatonic / symmetric → fewer; can be 1 (solid bar) or 2.
4. **Segment order**: fixed ascending by `degreeIndex` (0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°). Never sort dynamically.  
5. **Segment fill**: `backgroundColor: TRIAD_PALETTE[degree]`.  
6. **Segment divider**: `borderRight: '1px solid rgba(0,0,0,0.85)'` on segments 0 … N-2; none on the last.
7. **Filter-aware**: when a triad-filter toggle is active, only include segments for enabled triads. A note in no enabled triad renders no band at all (band element not mounted).
8. **Accessibility floor**: each segment must be ≥ 4px wide. At 32px circle, N=3 → each segment ≈ 10px ✓. If N > 4 (unusual but possible in extended/exotic scales), cap at 4 and add a small `…` overflow indicator (2px dotted strip after the 4th segment). Alternatively, grow the circle diameter to 40px when arc-band mode is on — simpler and cleaner UX.

### 2.5 Toggle Behaviour
- `showTriadArcBands: boolean` prop on `<Fretboard>` — master switch.
- **Off**: circle renders identically to current; no `overflow: hidden`, no band div, no letter nudge. Zero visual change.
- **On**: adds `overflow: hidden` + band div; applies letter nudge.
- The toggle does **not** interact with `showTriadMode`, `showTriadRingsOnScale`, or any chord-tone display — fully independent.

---

## 3. Feature 2 — Single Triad Focus Mode

### 3.1 Purpose
Spotlight one triad across the entire fretboard simultaneously, with instant switching while playing, so the player never leaves the mode to change triads.

### 3.2 Selector Strip UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  Triad Focus  [●]                                                   │
│  ◀  [■ I · C]  [ii · Dm]  [iii · Em]  [IV · F]  [V · G]  [vi · Am]  [vii° · Bdim]  ▶  │
└─────────────────────────────────────────────────────────────────────┘
```

- **Location**: rendered directly above the fretboard (or inside the "Triads in Scale" toggle panel, same row as other triad controls). Fixed width ~780px max, horizontally scrollable if needed.
- **Toggle pill**: "Triad Focus" label + toggle switch. When toggled on, immediately spotlights the I chord (or last remembered degree for this key+scale).
- **Degree chips**: one per diatonic triad in `availableTriads`. Each chip = `[color swatch ■] [degree] · [chord name]`, e.g. `■ IV · F`. Selected chip = filled background using `TRIAD_PALETTE[degree]` at 20% opacity with solid 2px border in that color. Unselected = subtle border.
- **◀ ▶ arrows**: step left/right through the list. Wrap around (vii° → I, I → vii°).
- **Chip sizing**: fixed height 32px, auto-width with min-width 64px; not full-width.
- **Rebuild**: selector strip list rebuilds whenever `currentKey` or `currentScale` changes. `selectedFocusDegree` falls back to `'I'` if the previous selection is not in the new `availableTriads`.

### 3.3 Spotlight Rendering (per note circle, every position)

| Note State | Rendering |
|---|---|
| **In focus triad + is the triad root** | Full fill = `TRIAD_PALETTE[selectedDegree]`. Chord-tone red glow kept (`boxShadow` unchanged). Circle diameter bumped **+12%** → 36px. Letter stays white. |
| **In focus triad + not root** | Full fill = `TRIAD_PALETTE[selectedDegree]`. Standard glow. Normal 32px size. |
| **In scale but not in focus triad** | `opacity: 0.3`, `filter: 'saturate(0) brightness(0.6)'` applied to the entire circle div. Dims and desaturates to neutral gray. Arc band hidden. |
| **Not in scale** | Hidden (unchanged behavior). |

**Letter contrast on triad fill**: because triad palette colors are mid-saturation (not pure black/white), ensure text shadow `textShadow: '0 1px 3px rgba(0,0,0,0.8)'` keeps the white letter readable.

### 3.4 Optional Shape Reinforcement
Draw faint connecting lines between the 3 note instances of each triad occurrence per string region. Implemented as an SVG overlay (same pattern as `voicingOutlineGroups` in `Fretboard.tsx`). Lines use `TRIAD_PALETTE[degree]` at 20% opacity, `strokeWidth: 1.5`, `strokeDasharray: '4 3'`. Keep disabled by default; add a toggle `showTriadFocusLines?: boolean`.

### 3.5 Transition Animation
Triad switch: `transition: 'all 150ms ease-out'` on the circle div covering opacity, filter, backgroundColor, width, height. This makes the re-spotlight feel like a smooth swap rather than a flash.

### 3.6 State Model

```ts
// New state in app/page.tsx:
const [showTriadArcBands, setShowTriadArcBands] = useState(false);
const [triadFocusOn, setTriadFocusOn] = useState(false);
const [selectedFocusDegree, setSelectedFocusDegree] = useState<string>('I');
// Per key+scale memory — remember last selected degree when returning to a scale
const [triadFocusMemory, setTriadFocusMemory] = useState<Record<string, string>>({});
```

```ts
// Derived (useMemo — no API calls):
const diatonicTriads = useMemo(
  () => computeDiatonicTriads(currentKey, currentScale),
  [currentKey, currentScale]
);

const triadMembership = useMemo(
  () => (showTriadArcBands || triadFocusOn)
    ? computeTriadMembership(diatonicTriads)
    : {},
  [diatonicTriads, showTriadArcBands, triadFocusOn]
);

const focusTriad = useMemo(() => {
  if (!triadFocusOn) return null;
  return diatonicTriads.find(t => t.degree === selectedFocusDegree)
    ?? diatonicTriads[0]
    ?? null;
}, [triadFocusOn, selectedFocusDegree, diatonicTriads]);
```

### 3.7 Edge Cases

| Scenario | Behaviour |
|---|---|
| Scale change → selected degree no longer exists | Fall back to `'I'` (first diatonic triad) |
| Pentatonic (only 5 notes, fewer triads) | Selector lists only the triads that exist; gaps are not shown |
| Scale with diminished / augmented triads | Included in selector; palette color from `TRIAD_PALETTE` at that degree index |
| `triadFocusOn` turned off | Arc band view resumes instantly; focus rendering removed |
| `showTriadArcBands` turned off while `triadFocusOn` is true | Focus mode continues (it is the replacement view, not dependent on arc bands) |

---

## 4. Data Architecture

### 4.1 New Types — `lib/music-theory/triad-membership/types.ts`

```ts
export interface DiatonicTriad {
  degree: string;        // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  degreeIndex: number;   // 0–6 — used for fixed left-to-right segment ordering
  romanNumeral: string;  // same as degree (alias for display)
  rootNote: string;      // e.g. 'C', 'D', 'E'
  notes: string[];       // all 3 pitch classes (sharp-normalized), e.g. ['C','E','G']
  color: string;         // TRIAD_PALETTE[degreeIndex]
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
}

export interface TriadMembershipEntry {
  degree: string;
  degreeIndex: number;
  color: string;
  triadRoot: string;
  triadNotes: string[];
}

// Key type added to NotePosition in lib/musicTheory.ts (additive, no breaking change):
// triadMembership?: TriadMembershipEntry[];
```

### 4.2 New Utility — `lib/music-theory/triad-membership/index.ts`

```ts
// Scale degree intervals for diatonic triads (major scale default)
// For each supported scale, the triad quality pattern is derived from EXTENDED_SCALE_INTERVALS
export function computeDiatonicTriads(key: string, scaleName: string): DiatonicTriad[]

// Maps each pitch class → sorted array of TriadMembershipEntry (sorted by degreeIndex ASC)
// enabledDegrees: optional filter; if omitted, all 7 are included
export function computeTriadMembership(
  triads: DiatonicTriad[],
  enabledDegrees?: string[]
): Record<string, TriadMembershipEntry[]>
```

**Implementation notes**:
- `computeDiatonicTriads` uses `getScaleNotes(key, scaleName)` (already in `lib/musicTheory.ts`) to get the 7 (or fewer) scale notes, then stacks 3rds to build each triad.
- Normalize all notes with `normalizeNoteToSharp` before storing.
- Pure functions — no API calls, no side effects. Memoized at call-site with `useMemo`.
- LRU-cache not needed (tiny computation, `useMemo` suffices).

### 4.3 NotePosition Extension (Additive Only)

Add one optional field to `lib/musicTheory.ts`:

```ts
export interface NotePosition {
  // ... all existing fields unchanged ...
  triadMembership?: TriadMembershipEntry[];  // NEW — populated by page.tsx useMemo
}
```

`page.tsx` populates `triadMembership` on each `NotePosition` via the `useMemo` that already builds `scaleNotePositions`, or as a separate `useMemo` that maps the positions and attaches the membership. No new API call.

---

## 5. State Architecture

### 5.1 New State in `app/page.tsx`

```ts
// Feature 1 toggle
const [showTriadArcBands, setShowTriadArcBands] = useState(false);

// Feature 2 focus mode
const [triadFocusOn, setTriadFocusOn] = useState(false);
const [selectedFocusDegree, setSelectedFocusDegree] = useState<string>('I');
const [triadFocusMemory, setTriadFocusMemory] = useState<Record<string, string>>({});
// triadFocusMemory key = `${key}-${scaleName}`, value = last selected degree
```

### 5.2 Derived State (all `useMemo`, no extra API calls)

```ts
// Diatonic triads for current key+scale — pure function, tiny
const diatonicTriads = useMemo(
  () => computeDiatonicTriads(currentKey, currentScale),
  [currentKey, currentScale]
);

// Triad membership map — only computed when a triad feature is active
const triadMembership = useMemo(
  () => (showTriadArcBands || triadFocusOn)
    ? computeTriadMembership(diatonicTriads)
    : {},
  [diatonicTriads, showTriadArcBands, triadFocusOn]
);

// Scale positions with triadMembership attached (piggybacks the existing scaleNotePositions memo)
const scaleNotePositionsWithTriads = useMemo((): NotePosition[] => {
  if (!showTriadArcBands && !triadFocusOn) return scaleNotePositions;
  return scaleNotePositions.map(p => ({
    ...p,
    triadMembership: triadMembership[normalizeNoteToSharp(p.note)] ?? [],
  }));
}, [scaleNotePositions, triadMembership, showTriadArcBands, triadFocusOn]);

// Focused triad object
const focusTriad = useMemo(() => {
  if (!triadFocusOn) return null;
  return diatonicTriads.find(t => t.degree === selectedFocusDegree)
    ?? diatonicTriads[0] ?? null;
}, [triadFocusOn, selectedFocusDegree, diatonicTriads]);
```

### 5.3 Scale-Change Handler (Triad Focus Memory)

```ts
// When key or scale changes, restore last selected triad degree for that key+scale
useEffect(() => {
  const memKey = `${currentKey}-${currentScale}`;
  const remembered = triadFocusMemory[memKey];
  if (remembered && diatonicTriads.some(t => t.degree === remembered)) {
    setSelectedFocusDegree(remembered);
  } else {
    setSelectedFocusDegree('I');
  }
}, [currentKey, currentScale]); // diatonicTriads updates in sync

// When user picks a different degree, write to memory
const handleFocusDegreeSelect = useCallback((degree: string) => {
  setSelectedFocusDegree(degree);
  const memKey = `${currentKey}-${currentScale}`;
  setTriadFocusMemory(prev => ({ ...prev, [memKey]: degree }));
}, [currentKey, currentScale]);
```

---

## 6. Component Architecture

### 6.1 New Files

```
components/
└── scale-triads/
    ├── TriadFocusSelector.tsx      # Selector strip: degree chips + ◀ ▶ arrows
    └── TriadArcBandSegments.tsx    # Inner arc band <div> — keeps Fretboard.tsx clean

lib/
└── music-theory/
    └── triad-membership/
        ├── types.ts                # DiatonicTriad, TriadMembershipEntry
        └── index.ts               # computeDiatonicTriads, computeTriadMembership
```

### 6.2 Modified Files (minimal surface area)

| File | Change |
|---|---|
| `lib/musicTheory.ts` | Add `triadMembership?: TriadMembershipEntry[]` to `NotePosition` |
| `components/Fretboard.tsx` | Add 4 new optional props; add arc band + focus rendering branch; add `overflow:'hidden'` + `position:'relative'` to circle div when `showTriadArcBands` is on |
| `app/page.tsx` | Add 4 new state vars, 4 new `useMemo` derivations, pass new props to `<Fretboard>` |

### 6.3 `TriadFocusSelector` Props

```ts
interface TriadFocusSelectorProps {
  available: DiatonicTriad[];           // from diatonicTriads
  selectedDegree: string;
  onSelect: (degree: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  theme: ThemeConfig;
}
```

Renders inline — no modal, no popover. Positioned above the fretboard in a horizontally scrollable `<div>` with `maxWidth: 780px`.

### 6.4 `TriadArcBandSegments` Props

```ts
interface TriadArcBandSegmentsProps {
  membership: TriadMembershipEntry[];  // sorted by degreeIndex
  circleDiameter: number;              // 32 or 36 (hover state)
}
```

Returns a single flex `<div>` — no JSX wrapper — so Fretboard can position it absolutely without extra DOM nodes.

### 6.5 New `Fretboard.tsx` Props

```ts
// Triad arc band (Feature 1)
showTriadArcBands?: boolean;               // master toggle; default false
// (triadMembership is already on NotePosition.triadMembership — no extra prop needed)

// Triad focus mode (Feature 2)
triadFocusOn?: boolean;                    // default false
focusTriad?: DiatonicTriad | null;         // spotlight target
showTriadFocusLines?: boolean;             // optional shape-outline SVG; default false
```

---

## 7. Fretboard Rendering Logic

### 7.1 Note Circle Modifications (inside `Fretboard.tsx` note render IIFE)

The existing note render produces one `<div>` per note. The changes wrap that div with two additions:

**Step 1 — Determine circle diameter:**
```ts
const isFocusRoot = triadFocusOn && focusTriad &&
  normalizeNoteToSharp(notePos.note) === normalizeNoteToSharp(focusTriad.rootNote);
const circleDiameter = isFocusRoot ? 36 : 32; // +12% for triad root in focus mode
```

**Step 2 — Determine fill color and opacity:**
```ts
let circleFill = NOTE_COLORS[notePos.note] ?? '#6b7280';        // default: identity color
let circleOpacity = 1;
let circleFilter = 'none';
let letterNudge = false;

if (triadFocusOn && focusTriad) {
  const inFocusTriad = focusTriad.notes.includes(normalizeNoteToSharp(notePos.note));
  if (inFocusTriad) {
    circleFill = focusTriad.color;                              // triad palette color
    // glow unchanged (chord-tone or default)
  } else {
    circleOpacity = 0.3;
    circleFilter = 'saturate(0) brightness(0.6)';              // desaturate, dim
  }
} else if (showTriadArcBands && notePos.triadMembership?.length) {
  letterNudge = true;                                          // band takes bottom space
}
```

**Step 3 — Render arc band (only when `showTriadArcBands && !triadFocusOn`):**
```tsx
<div
  style={{
    width: `${circleDiameter}px`, height: `${circleDiameter}px`,
    borderRadius: '50%',
    backgroundColor: circleFill,
    border: `3px solid ${borderColor}`,
    boxShadow: glowColor,
    position: 'relative',
    overflow: showTriadArcBands ? 'hidden' : 'visible',   // clip only when needed
    opacity: circleOpacity,
    filter: circleFilter,
    transition: 'all 150ms ease-out',
    // ... other existing styles
  }}
>
  <span style={{ transform: letterNudge ? 'translateY(-3px)' : 'none' }}>
    {getNoteDisplayName(notePos.note)}
  </span>

  {showTriadArcBands && !triadFocusOn && notePos.triadMembership?.length > 0 && (
    <TriadArcBandSegments
      membership={notePos.triadMembership}
      circleDiameter={circleDiameter}
    />
  )}
</div>
```

### 7.2 `TriadArcBandSegments` Render Logic

```tsx
export function TriadArcBandSegments({ membership, circleDiameter }: TriadArcBandSegmentsProps) {
  const bandHeight = Math.round(circleDiameter * 0.28);  // 28% rule
  const N = membership.length;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: `${bandHeight}px`,
      display: 'flex',
    }}>
      {membership.map((entry, i) => (
        <div
          key={entry.degree}
          style={{
            flex: 1,
            backgroundColor: entry.color,
            borderRight: i < N - 1 ? '1px solid rgba(0,0,0,0.85)' : 'none',
          }}
          title={`${entry.degree} triad`}
        />
      ))}
    </div>
  );
}
```

**Min-width enforcement**: before rendering, check `circleDiameter / N >= 4`. If not, cap displayed segments at 4 and mark overflow with a 2px `borderRight: '2px dotted rgba(255,255,255,0.5)'` on the last visible segment.

### 7.3 Focus Mode SVG Lines (optional)

Uses the same SVG overlay pattern as `voicingOutlineGroups` in `Fretboard.tsx`. For each instance of `focusTriad.notes` found at adjacent string/fret positions, draw a dashed line:
```
strokeDasharray="4 3"  strokeWidth="1.5"  opacity="0.2"  stroke={focusTriad.color}
```
Only mounted when `showTriadFocusLines === true`.

---

## 8. UX Behaviour & Controls

### 8.1 Arc Band Toggle Location
Place the **"Triads in Scale"** toggle (already referenced in existing UI) as the master toggle for `showTriadArcBands`. Below it or alongside it, add a **"Triad Focus"** pill toggle to activate Feature 2.

```
[ ◎ Triads in Scale ] ────●   [ Triad Focus ] ────○
```

When "Triads in Scale" is **off**, both features are off. "Triad Focus" is only active when "Triads in Scale" is also on.

### 8.2 Keyboard Navigation (Triad Focus)

| Key | Action |
|---|---|
| `ArrowRight` | Next triad (wraps) |
| `ArrowLeft` | Previous triad (wraps) |
| `1`–`7` | Jump directly to triad at that degree index (1=I, 2=ii, etc.) |

Apply `keydown` listener on `document` only when `triadFocusOn === true`. Remove on cleanup (no leak). Guard: check `document.activeElement` is not an `<input>` or `<textarea>` before consuming the key.

### 8.3 Swipe Navigation
Attach `touchstart` / `touchend` listeners to the fretboard container div. Horizontal swipe ≥ 40px → next/previous triad. Same wrap-around logic as arrows.

### 8.4 MIDI / Footswitch (Stretch)
Listen on the existing MIDI input (if available in the project). A footswitch CC message on CC#64 (sustain) or a user-mapped CC → step to next triad. Documented here for future integration; not required in Phase 1 implementation.

### 8.5 Triad Switching Animation
- Circle fill color change: `transition: 'background-color 150ms ease-out'`
- Opacity change for dimmed notes: `transition: 'opacity 150ms ease-out, filter 150ms ease-out'`
- Root size bump: `transition: 'width 150ms ease-out, height 150ms ease-out'`
- All on the same 150ms timing → cohesive, reads as a swap not a flash.

---

## 9. Color System

### 9.1 Triad Palette (`TRIAD_PALETTE`)

Fixed per degree index. Chosen to avoid all `NOTE_COLORS` hues and all `ALL_INTERVAL_COLORS` hues.

```ts
// lib/music-theory/triad-membership/types.ts
export const TRIAD_PALETTE: Record<number, string> = {
  0: '#7F77DD',  // I   — muted indigo-violet
  1: '#1D9E75',  // ii  — teal-green
  2: '#EF9F27',  // iii — amber (darker than NOTE_COLORS yellows)
  3: '#D4537E',  // IV  — dusty rose
  4: '#97C459',  // V   — muted yellow-green
  5: '#C56BD6',  // vi  — medium purple (lighter than NOTE_COLORS purples)
  6: '#4FB3C4',  // vii — teal-cyan
};
// Access by degree: TRIAD_PALETTE[degreeIndex]  or  TRIAD_PALETTE_BY_DEGREE['I'] etc.
```

| Degree | Color | Hex | Notes |
|---|---|---|---|
| I | Muted Indigo-Violet | `#7F77DD` | Warm anchor; distinct from all note-identity blues |
| ii | Teal-Green | `#1D9E75` | Mid saturation; distinct from G (#27AE60) |
| iii | Amber | `#EF9F27` | Darker/oranger than D (#F1C40F) and interval yellows |
| IV | Dusty Rose | `#D4537E` | Mid-pink; not in note or interval palette |
| V | Muted Yellow-Green | `#97C459` | Chartreuse; lighter than G, distinct from 5th green |
| vi | Medium Purple | `#C56BD6` | Distinctly lighter/pinker than A (#8E44AD) |
| vii° | Teal-Cyan | `#4FB3C4` | Blue-teal; not present elsewhere in the palette |

### 9.2 Color Collision Audit

The colors above are verified against:
- `NOTE_COLORS`: C/#E74C3C, C#/#E67E22, D/#F1C40F, D#/#2ECC71, E/#1ABC9C, F/#3498DB, F#/#2980B9, G/#27AE60, G#/#16A085, A/#8E44AD, A#/#9B59B6, B/#E91E63
- `ALL_INTERVAL_COLORS` (0–11)
- `CHORD_TONE_COLORS`: root/#E85555, third/#F5BC3C, fifth/#5DB572, seventh/#A07ED4

No direct hex collision exists. Perceptual proximity: ii (#1D9E75) and E (#1ABC9C) are the closest pair; they remain distinguishable as the circle fill is E's color and the band segment uses ii's color — different shape + position disambiguates them.

---

## 10. Implementation Phases

### Phase 1 — Data Foundation
1. Create `lib/music-theory/triad-membership/types.ts` — `DiatonicTriad`, `TriadMembershipEntry`, `TRIAD_PALETTE`
2. Create `lib/music-theory/triad-membership/index.ts` — `computeDiatonicTriads()`, `computeTriadMembership()`
3. Add `triadMembership?: TriadMembershipEntry[]` to `NotePosition` in `lib/musicTheory.ts`
4. Unit-test `computeDiatonicTriads` for C major: verify each of the 7 notes appears in exactly 3 triads with correct degrees

**Estimate**: 2 new files, 1 line added to `lib/musicTheory.ts`, ~80 lines net

### Phase 2 — Arc Band Rendering (Feature 1)
1. Create `components/scale-triads/TriadArcBandSegments.tsx`
2. Add `showTriadArcBands` prop to `Fretboard.tsx`; add `overflow: hidden` + band render branch inside the note circle IIFE
3. Add `showTriadArcBands` state + `scaleNotePositionsWithTriads` useMemo in `app/page.tsx`
4. Add the toggle UI element to the existing Triads in Scale toggle area
5. Pass `scaleNotePositionsWithTriads` to `<Fretboard>` when arc bands are on; otherwise `scaleNotePositions`

**Estimate**: 1 new component, changes to 3 files, ~60 lines net. Low risk — additive only.

### Phase 3 — Focus Mode Selector (Feature 2)
1. Create `components/scale-triads/TriadFocusSelector.tsx`
2. Add `triadFocusOn`, `focusTriad`, `showTriadFocusLines` props to `Fretboard.tsx`; add focus rendering branch
3. Add `triadFocusOn`, `selectedFocusDegree`, `triadFocusMemory`, `handleFocusDegreeSelect`, `focusTriad` state/derived state in `app/page.tsx`
4. Add `useEffect` for key+scale change memory restoration
5. Mount `<TriadFocusSelector>` above the main fretboard when `showTriadArcBands` is on
6. Add keyboard listener in `page.tsx` (ArrowLeft/ArrowRight, 1–7) when `triadFocusOn`
7. Add swipe listener on fretboard container

**Estimate**: 1 new component, changes to 3 files, ~120 lines net

### Phase 4 — Polish & Accessibility
1. Enforce 4px minimum segment width; handle overflow indicator
2. Verify color contrast of letter text over all 7 triad palette fills (adjust text shadow if needed)
3. ARIA labels: `role="img"` + `aria-label="Triad membership: I, IV, vi"` on the arc band
4. Add tooltip on hover showing the degree names: `title="I · IV · vi"` on the band wrapper
5. Optional: `showTriadFocusLines` SVG overlay (Phase 4 stretch)

---

## Appendix: Key Design Decisions

| Decision | Rationale |
|---|---|
| `overflow: hidden` only when `showTriadArcBands` is true | Avoids any visual change when feature is off; defensive |
| Letter nudge via `transform: translateY(-3px)` | Does not affect layout flow; reversible instantly; no padding/margin side-effects |
| Segment divider = 1px solid rgba(0,0,0,0.85) right-border | Black dividers on all mid-segments; clears the ambiguity at 9px band height on dark fills |
| Fixed degree-index sort order for segments | Predictability is the entire point — I always left, vii° always right, everywhere |
| Single `useMemo` for `triadMembership` | No API calls; pure derivation; runs only when a triad feature is active |
| `triadMembership` on `NotePosition` (not a separate map prop) | Keeps Fretboard.tsx prop surface minimal; data travels with the position it describes |
| Focus mode replaces arc band view (not additive) | Both on simultaneously would overload a 32px circle; focus mode is a different mental model |
| `triadFocusMemory` in page state (not localStorage) | Session-scoped memory is sufficient; avoids storage quota concerns and stale-data edge cases |
| TRIAD_PALETTE colors avoided NOTE_COLORS and ALL_INTERVAL_COLORS | The arc band must not be read as note identity or chord function — different semantic layer |
| Min circle diameter unchanged in arc band mode | 32px works for N≤4; Phase 4 can grow to 40px if overflow is needed — not pre-baked |
