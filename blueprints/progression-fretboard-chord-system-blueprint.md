# Progression × Fretboard × Chord System — GUI/UX & Dev Blueprint

> **Scope**: Three interconnected features built on the existing Musical Insights codebase.  
> **Do not implement** until explicitly instructed.

---

## Table of Contents
1. [Existing Codebase Anchors](#1-existing-codebase-anchors)
2. [Feature 0 — Progression Card → Fretboard Note Filter](#2-feature-0)
3. [Feature A — Progression Interval Chord Selector](#3-feature-a)
4. [Feature B — Per-Fret Chord Availability HUD](#4-feature-b)
5. [Music Theory Database Design](#5-music-theory-database-design)
6. [State Architecture](#6-state-architecture)
7. [API Layer](#7-api-layer)
8. [Component Architecture](#8-component-architecture)
9. [Color System](#9-color-system)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Existing Codebase Anchors

| Asset | Path | Relevance |
|---|---|---|
| `ChordProgressionRecommendations` | `components/ChordProgressionRecommendations.tsx` | Card UI, `onProgressionSelect` callback already wired |
| `MusicTheoryTabs` | `components/MusicTheoryTabs.tsx` | 3-tab shell: Scales / Chords / **Progressions** |
| `Fretboard` | `components/Fretboard.tsx` | Accepts `notePositions: NotePosition[]`; already renders multi-ring via `sharedChordColors` |
| `NotePosition` | `lib/musicTheory.ts` | Has `sharedChordColors?: string[]` — multi-chord ring already supported |
| `ALL_INTERVAL_COLORS` | `lib/musicTheory.ts` | 12 semitone → hex color map |
| `NOTE_COLORS` | `lib/musicTheory.ts` | Per note-name hex colors |
| `calculateScalePositions` | `lib/musicTheory.ts` | Returns `NotePosition[]` for a key+scale |
| `getScaleNotes` | `lib/musicTheory.ts` | Returns note name array for key+scale |
| Chord progression DB | `music-theory/chord-progressions/{key}-chord-progression-database.json` | Per-chord scale compatibility; per-key |
| Chord recommendations DB | `data/chord-recommendations/{key}-{scale}.json` | Per-key+scale chord recommendations (already exists for all 12 keys × 12 scales) |
| `findChordsInScale` | `lib/music-theory/overlapping-chords/chord-finder.ts` | Finds chord voicings that overlap a scale/area — reusable for Feature B |
| `sharedNoteRingOpacity` | `components/Fretboard.tsx` prop | Controls opacity of shared-note outer rings |
| `ChordProgression` type | `lib/progression-analyzer/types.ts` | `id, name, chords[], romanNumerals[], scaleRecommendations` |

### Key insight on `sharedChordColors`
`NotePosition.sharedChordColors?: string[]` is **already rendered** as stacked outer rings in `Fretboard.tsx`. When multiple chords share a fret note, we simply assign each chord a unique color and pass all matching chord colors in `sharedChordColors`. This covers the "see all chords at once" requirement in Feature A with **zero changes** to `Fretboard.tsx`.

---

## 2. Feature 0 — Progression Card → Fretboard Note Filter

### 2.1 What It Does
Clicking a recommended-progression card filters the **frontpage fretboard** to show only fret dots whose note appears in at least one chord of that progression. Notes outside the progression are hidden (not shown at all, or dimmed with low opacity — dimmed is better UX so the user retains spatial context).

- Clicking the **same card again** deselects it, restoring all scale notes.
- A chord labeled **"Other"** (roman numeral === `"Other"` or chord symbol === `"Other"`) is skipped — its notes are **not** used for filtering, and no reduction is applied for that slot.

### 2.2 Logic

```
progressionNotes = union of notes in all non-"Other" chords
filteredPositions = scalePositions.filter(p => progressionNotes.has(p.note))
```

Chord note lookup uses the chord symbol string (e.g., "Am7") → look up in `ChordTonesEntry` (`lib/chord-tones-database.ts`) → get `notes[]`. Fallback: parse chord symbol algorithmically using existing `CHORD_INTERVALS` map in `lib/music-theory/overlapping-chords/chord-finder.ts`.

### 2.3 State Changes (in `app/page.tsx`)

```ts
// Add to existing page state:
const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);

// Derived filtered positions (useMemo — no extra API call):
const progressionFilteredPositions = useMemo(() => {
  if (!selectedProgression) return scaleNotePositions; // no filter active
  const allowed = getProgressionNoteSet(selectedProgression); // returns Set<string>
  return scaleNotePositions.map(p =>
    allowed.has(p.note) ? p : { ...p, dimmed: true } // or just filter out
  );
}, [selectedProgression, scaleNotePositions]);
```

Pass `progressionFilteredPositions` to the frontpage `<Fretboard>` instead of `scaleNotePositions` when a progression is selected.

### 2.4 UI Changes

In `ChordProgressionRecommendations.tsx`:
- Add `selectedProgressionId: string | null` prop and `onProgressionDeselect` or use the same `onProgressionSelect` with toggle logic.
- Selected card gets: `border: 2px solid accentPrimary`, subtle background highlight, a small ✓ badge top-right.
- Add a small **"Active Filter"** pill badge in the fretboard area above it: `Filtering: {progression.name}  ✕` — clicking ✕ clears the filter.

### 2.5 Affected Files
- `components/ChordProgressionRecommendations.tsx` — add selected state styling
- `components/MusicTheoryTabs.tsx` — pass `selectedProgressionId` down
- `app/page.tsx` — add `selectedProgression` state, derived filtered positions, wire `onProgressionSelect`
- `lib/progressionNoteUtils.ts` (**new small util file**) — `getProgressionNoteSet(progression)` pure function

---

## 3. Feature A — Progression Interval Chord Selector

### 3.1 Overview
When a progression card is selected, a **Chord Selector Panel** appears below the card (or as an inline expansion). The progression's roman-numeral slots are displayed as interactive interval steps. For each step, the user can:

- See the **default chord** for that scale degree in the current key
- **Browse alternative compatible chords** (e.g., for slot "I" in C major: C, Cmaj7, Cadd9, Csus2, C6, Cmaj9…)
- **Select** which chord to use for that step — saved per step

The fretboard then reflects the user's chord selections via three display modes:
1. **Step View** (default): Left/right arrow navigation through each progression step; fretboard shows only the notes of the selected/current chord for that step
2. **All Chords View**: All selected chords displayed simultaneously using `sharedChordColors` rings

### 3.2 Database: Progression Interval Compatible Chords

**This is the primary new database.** Stored in `music-theory/progression-interval-chords/` — one JSON file per key (12 files total).

```jsonc
// music-theory/progression-interval-chords/c-interval-chords.json
{
  "key": "C",
  "version": "1.0.0",
  "scaleDegrees": {
    "I": {
      "primaryChord": "C",
      "primaryQuality": "major",
      "rootNote": "C",
      "compatibleChords": [
        {
          "symbol": "C",
          "displayName": "C Major",
          "quality": "major",
          "notes": ["C", "E", "G"],
          "intervals": [0, 4, 7],
          "suitability": 10,
          "context": "Standard tonic — foundational",
          "genres": ["All"]
        },
        {
          "symbol": "Cmaj7",
          "displayName": "C Major 7",
          "quality": "major7",
          "notes": ["C", "E", "G", "B"],
          "intervals": [0, 4, 7, 11],
          "suitability": 9,
          "context": "Lush jazz/pop tonic color",
          "genres": ["Jazz", "Pop", "R&B"]
        }
        // ... more compatible chords
      ]
    },
    "ii": { ... },
    "iii": { ... },
    "IV": { ... },
    "V": { ... },
    "vi": { ... },
    "vii°": { ... },
    // Secondary degrees for borrowed chords:
    "bVII": { ... },
    "bVI": { ... },
    "IV/IV": { ... }
  }
}
```

**Generation approach**: Use AI (Claude/GPT) with a structured music-theory prompt to generate all 12 key files. The `scripts/` folder already has pattern generators — add `scripts/generateProgressionIntervalChords.ts`.

**Scale-degree to roman numeral mapping**: The `ChordProgression.romanNumerals[]` field uses strings like `"I"`, `"ii"`, `"V"`, `"bVII"`, `"Other"`. The DB keys must match these exactly (case-sensitive, includes accidentals).

### 3.3 Loader: `lib/music-theory/progression-interval-chords/loader.ts`

```ts
// Lazy loads per-key database, LRU-cached (use existing lru-cache pattern)
export async function getProgressionIntervalChords(key: string): Promise<IntervalChordDatabase>
export function getCompatibleChordsForDegree(db: IntervalChordDatabase, romanNumeral: string): CompatibleChordEntry[]
```

### 3.4 API Endpoint: `app/api/progression-interval-chords/route.ts`

```
GET /api/progression-interval-chords?key=C&degree=I
→ { degree: "I", rootNote: "C", compatibleChords: [...] }
```

Single endpoint. Uses lazy-loaded local JSON (no AI call at runtime — DB is pre-generated).

### 3.5 Component: `ProgressionIntervalChordSelector`

**File**: `components/progression-chords/ProgressionIntervalChordSelector.tsx`

```
┌─────────────────────────────────────────────────────────────────────┐
│  I  →  IV  →  V  →  I    [Step View ▼]  [See All Chords]          │
│  ───────────────────────────────────────────────────────────────────│
│  ◀  Slot 1 of 4: I (C major)                                    ▶  │
│  ─────────────────────────────────────────────────────────────────  │
│  Selected: [ Cmaj7  ✓ ]                                            │
│  Alternatives:                                                      │
│  [ C ]  [ Cmaj7 ✓ ]  [ Cadd9 ]  [ Csus2 ]  [ C6 ]  [ Cmaj9 ]   │
│  Suitability: ████████░░ 9/10  · Jazz/Pop tonic                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Props**:
```ts
interface ProgressionIntervalChordSelectorProps {
  progression: ChordProgression;       // selected progression
  currentKey: string;                  // e.g. "C"
  theme: ThemeConfig;
  onChordSelectionsChange: (selections: ProgressionChordSelections) => void;
  // selections = Record<slotIndex, CompatibleChordEntry>
}
```

**State (internal)**:
```ts
const [currentSlot, setCurrentSlot] = useState(0);           // left/right arrow
const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
const [chordSelections, setChordSelections] = useState<Record<number, CompatibleChordEntry>>({});
// loaded via React Query: useQuery(['interval-chords', key, degree])
```

**Size**: Fixed width ~680px, not full-width. Sits between the progression card and the fretboard.

### 3.6 Fretboard Integration

**Step View**: Pass notes of `chordSelections[currentSlot]` as a note filter → only those notes are shown on the fretboard with full opacity. Other notes in scale dimmed.

**All Chords View**: 
1. Assign each slot a unique `chordColor` (use a predefined palette of 8 distinct vivid colors)
2. Build `NotePosition[]` where each position gets `sharedChordColors` = array of all chord colors whose chord includes that note
3. Pass as `notePositions` to `<Fretboard>` — existing `sharedChordColors` rendering handles overlap display automatically

### 3.7 Dot Rendering: Core + Border Color System

Each note dot on the fretboard when showing a chord in **Step View** uses:
- **Core fill color** = `NOTE_COLORS[note]` (the note's own color — e.g., C = red)
- **Border / glow color** = `ALL_INTERVAL_COLORS[semitone]` where semitone = distance from the **chord's root** (not scale root)

This gives dual information: what note it is (core) + its function in the chord (border).

For the **All Chords View**, each chord gets its own assigned color as the ring/border, stacked if shared.

### 3.8 Slot-Level Visual Design

The progression step selector row:
- Each slot is a small pill/chip: roman numeral + note name, e.g., `I · Cmaj7`
- Active slot = filled background with accent color
- Non-active slots = muted border
- Arrows (◀ ▶) are positioned left/right of the active slot chip — NOT full-row navigation
- Chips are horizontally scrollable if the progression has many steps
- Chord chips below: pill buttons, max 6 per row, overflow into a "Show more" expander

---

## 4. Feature B — Per-Fret Chord Availability HUD

### 4.1 What It Does
A subtle, non-intrusive UI above/below the fretboard's top fret-number row that shows small **fret-zone chord trigger buttons**. Clicking one opens a compact popover listing chords available in that fret neighborhood given the current key + scale.

### 4.2 Fret Zone Design

Group frets into **overlapping 4-fret neighborhoods**:
| Zone | Frets | Label |
|---|---|---|
| Open | 0–4 | "Open" |
| Zone 2 | 2–6 | "Pos 2" |
| Zone 3 | 5–9 | "Pos 5" |
| Zone 4 | 7–12 | "Pos 7" |
| Zone 5 | 9–13 | "Pos 9" |
| Zone 6 | 12–16 | "Pos 12" |

Zones are aligned with CAGED positions naturally. The zone buttons sit in a **single horizontal row** above the fret numbers, centered on the midpoint fret of each zone. Each button = a tiny `♦` icon (12px) that becomes a small rectangle on hover showing "Pos X".

### 4.3 Chord Availability Data Source

**Primary**: The existing `data/chord-recommendations/{key}-{scale}.json` files contain all compatible chords for each key+scale. Filter these to notes playable in the fret zone's fret range using the guitar tuning.

**Algorithm** (reuse `findChordsInScale` from `lib/music-theory/overlapping-chords/chord-finder.ts`):
```ts
const chordsInZone = findChordsInScale({
  key: currentKey,
  scale: currentScale,
  fretRange: [zone.minFret, zone.maxFret],
  tuning: currentTuning,
  stringCount
});
```

No new database needed for Feature B — existing chord-finder + chord-recommendations covers it.

### 4.4 Popover UI

```
┌──────────────────────────────────┐
│  Chords — Frets 5–9 (Position 5) │
│  ──────────────────────────────  │
│  Triads:                         │
│  [Am] [C] [Em] [G] [Dm]         │
│  ──────────────────────────────  │
│  7th Chords:                     │
│  [Am7] [Cmaj7] [Em7] [G7]       │
│  ──────────────────────────────  │
│  Extended:                       │
│  [Am9] [Cmaj9]                   │
│  ──────────────────────────────  │
│  [Show on Fretboard]  [Close]    │
└──────────────────────────────────┘
```

- Popover width: 280px max, fixed. Appears above the button (or below if near top of viewport)
- "Show on Fretboard": clicking a chord name highlights those notes on the fretboard (uses existing `selectedChordNotes` mechanism)
- Close on click-outside or Escape
- Only one popover open at a time

### 4.5 Component: `FretZoneChordHUD`

**File**: `components/fretboard-zone-chords/FretZoneChordHUD.tsx`

**Props**:
```ts
interface FretZoneChordHUDProps {
  currentKey: string;
  currentScale: string;
  tuning: string[];
  stringCount: 6 | 7;
  fretCount: number;
  theme: ThemeConfig;
  onChordHighlight: (notes: string[] | null) => void;
}
```

Inserted into `Fretboard.tsx`'s top fret row (or as a sibling div above it), aligned with the existing fret-number row using the same `width: 70px per fret` grid.

### 4.6 Data Fetching

Use **React Query** with a single `useQuery`:
```ts
useQuery({
  queryKey: ['zone-chords', currentKey, currentScale],
  queryFn: () => fetchZoneChords(currentKey, currentScale),
  staleTime: Infinity,  // music theory doesn't change
})
```
Cache is key+scale scoped — one fetch covers all zones for a given key+scale context. Zone filtering is done client-side from the cached response.

---

## 5. Music Theory Database Design

### 5.1 New Database: Progression Interval Compatible Chords

**Location**: `music-theory/progression-interval-chords/`  
**Files**: `{key}-interval-chords.json` × 12 keys (c, c-sharp, d, d-sharp, e, f, f-sharp, g, g-sharp, a, a-sharp, b)

**TypeScript types** (`lib/music-theory/progression-interval-chords/types.ts`):
```ts
export interface CompatibleChordEntry {
  symbol: string;          // e.g., "Cmaj7"
  displayName: string;     // e.g., "C Major 7"
  quality: string;         // e.g., "major7"
  notes: string[];         // e.g., ["C", "E", "G", "B"]
  intervals: number[];     // semitones from root
  suitability: number;     // 1-10
  context: string;         // musical use description
  genres: string[];        // applicable genres
}

export interface ScaleDegreeEntry {
  primaryChord: string;        // e.g., "C"
  primaryQuality: string;      // e.g., "major"
  rootNote: string;            // e.g., "C"
  compatibleChords: CompatibleChordEntry[];
}

export interface IntervalChordDatabase {
  key: string;
  version: string;
  scaleDegrees: Record<string, ScaleDegreeEntry>;
  // keys: "I", "ii", "iii", "IV", "V", "vi", "vii°", "bVII", "bVI", "bIII"
}
```

### 5.2 Do We Need Key + Scale/Mode Combinations?

**Answer**: For Feature A (progression chord selector), NO — just key-based is sufficient, because the progression's roman numerals already imply the scale degree. The diatonic chord function (I, IV, V, etc.) is enough to determine compatible voicings.

**However**, for the `Compatible Scales & Modes` database expansion, the recommendation is:

> **Expand** `music-theory/{key}-key-complete-database.json` to add a `"chordCompatibility"` section per scale entry, listing which chord types (maj, min, maj7, dom7, etc.) are diatonic to or compatible with that scale. This makes the existing database the **single source of truth** for both scale compatibility AND chord compatibility per key+scale. No separate key+scale chord file needed.

**Expanded schema addition** (added to existing `CompatibleScale` entries):
```jsonc
{
  "scaleName": "C Major (Ionian)",
  // ... existing fields ...
  "diatonicChords": [
    { "degree": "I",    "chord": "C",    "quality": "major",  "notes": ["C","E","G"] },
    { "degree": "ii",   "chord": "Dm",   "quality": "minor",  "notes": ["D","F","A"] },
    { "degree": "iii",  "chord": "Em",   "quality": "minor",  "notes": ["E","G","B"] },
    { "degree": "IV",   "chord": "F",    "quality": "major",  "notes": ["F","A","C"] },
    { "degree": "V",    "chord": "G",    "quality": "major",  "notes": ["G","B","D"] },
    { "degree": "vi",   "chord": "Am",   "quality": "minor",  "notes": ["A","C","E"] },
    { "degree": "vii°", "chord": "Bdim", "quality": "diminished", "notes": ["B","D","F"] }
  ]
}
```

This addition is additive (non-breaking) and enables Feature B to also use mode-aware chord suggestions when a specific scale is selected.

### 5.3 AI Generation Script

**File**: `scripts/generateProgressionIntervalChords.ts`

Uses the existing OpenAI/Anthropic API already integrated in the project to generate all 12 key files. Prompt template:
```
Generate a comprehensive music theory database for key of {KEY}.
For each diatonic scale degree (I, ii, iii, IV, V, vi, vii°) and common
borrowed degrees (bVII, bVI, bIII), list all compatible chord voicings
(triads, 7ths, extensions, suspensions, added-tone chords) with their
notes, suitability score 1-10, musical context, and applicable genres.
Output as JSON matching this TypeScript interface: {types}
```

Output validation against TypeScript types before writing files.

---

## 6. State Architecture

### 6.1 New Page-Level State (`app/page.tsx`)

```ts
// Progression Filter State
const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);

// Progression Chord Selections (Feature A)
const [progressionChordSelections, setProgressionChordSelections] =
  useState<Record<number, CompatibleChordEntry>>({});
const [progressionViewMode, setProgressionViewMode] = useState<'step' | 'all'>('step');
const [progressionCurrentSlot, setProgressionCurrentSlot] = useState(0);

// Active fret zone chord highlight (Feature B) — ephemeral, not persisted
const [zoneHighlightedChordNotes, setZoneHighlightedChordNotes] = useState<string[] | null>(null);
```

### 6.2 Derived Fretboard Positions (useMemo)

```ts
const activeFretboardPositions = useMemo(() => {
  // Priority order:
  // 1. Progression Step View chord (Feature A step mode)
  // 2. Progression All Chords View (Feature A all mode)
  // 3. Progression Note Filter (Feature 0)
  // 4. Normal scale positions (baseline)
  
  if (selectedProgression && progressionViewMode === 'step') {
    return buildStepViewPositions(scaleNotePositions, progressionChordSelections, progressionCurrentSlot, currentKey);
  }
  if (selectedProgression && progressionViewMode === 'all') {
    return buildAllChordsViewPositions(scaleNotePositions, progressionChordSelections, currentKey);
  }
  if (selectedProgression) {
    return buildProgressionFilterPositions(scaleNotePositions, selectedProgression);
  }
  return scaleNotePositions;
}, [selectedProgression, progressionViewMode, progressionCurrentSlot, progressionChordSelections, scaleNotePositions, currentKey]);
```

Single `useMemo` — no repeated API calls, no redundant re-renders.

### 6.3 React Query Keys

```ts
// Feature A: interval chords per key (loaded once per key, cached indefinitely)
['progression-interval-chords', key]

// Feature B: zone chords per key+scale (loaded once per key+scale)
['zone-chords', key, scale]
```

Both use `staleTime: Infinity` since the data is static music theory — never re-fetches.

---

## 7. API Layer

### 7.1 Existing Endpoints (unchanged)
- `GET /api/progression-recommendations?key=C` — used by `ChordProgressionRecommendations`

### 7.2 New Endpoints

#### `GET /api/progression-interval-chords`
```
Query: key=C&degree=I
Response: { degree: "I", rootNote: "C", compatibleChords: [...] }
```
Reads from `music-theory/progression-interval-chords/{key}-interval-chords.json` (server-side file read, no DB call, no auth needed for public music theory data).

#### `GET /api/fret-zone-chords`
```
Query: key=C&scale=Ionian&minFret=5&maxFret=9
Response: {
  zone: { minFret: 5, maxFret: 9 },
  triads: [...],
  seventhChords: [...],
  extendedChords: [...]
}
```
Runs `findChordsInScale()` server-side with the given parameters, returns grouped chord list. Results are deterministic → aggressively cacheable (HTTP `Cache-Control: public, max-age=86400`).

**Note**: Both endpoints are thin wrappers over pure functions — no Supabase calls needed (music theory data is local JSON). If user-specific chord selections need persistence in the future, that would be a separate Supabase table.

---

## 8. Component Architecture

### 8.1 New Components

```
components/
├── progression-chords/
│   ├── ProgressionIntervalChordSelector.tsx   # Feature A main component
│   ├── ChordSlotPill.tsx                      # Individual slot chip (I · Cmaj7)
│   ├── ChordAlternativePicker.tsx             # Grid of alternative chord pills
│   ├── ProgressionStepNavigator.tsx           # ◀ Slot N of M ▶ header
│   └── ProgressionViewToggle.tsx              # Step View | All Chords toggle
│
└── fretboard-zone-chords/
    ├── FretZoneChordHUD.tsx                   # Feature B zone trigger row
    ├── FretZoneTrigger.tsx                    # Individual zone button (♦)
    └── FretZonePopover.tsx                    # Chord list popover

lib/
├── progressionNoteUtils.ts                    # getProgressionNoteSet() — Feature 0
├── progressionFretboardUtils.ts               # buildStepViewPositions(), buildAllChordsViewPositions()
└── music-theory/
    └── progression-interval-chords/
        ├── types.ts
        └── loader.ts                          # LRU-cached JSON loader

music-theory/
└── progression-interval-chords/               # Feature A database (AI-generated)
    ├── c-interval-chords.json
    ├── c-sharp-interval-chords.json
    ├── d-interval-chords.json
    ├── ... (12 files total)

scripts/
└── generateProgressionIntervalChords.ts       # AI generation script
```

### 8.2 Modified Components (minimal surface area)

| Component | Change |
|---|---|
| `ChordProgressionRecommendations.tsx` | Add `selectedProgressionId` prop, selected card styling, deselect toggle |
| `MusicTheoryTabs.tsx` | Pass `onProgressionSelect`, `selectedProgressionId` down |
| `app/page.tsx` | Add progression state, derived positions, wire new components |
| `Fretboard.tsx` | Insert `<FretZoneChordHUD>` above fret-numbers row (or as sibling in page) |

**No changes** to `NotePosition` interface, `ALL_INTERVAL_COLORS`, `NOTE_COLORS`, or the core fretboard rendering logic — they already support everything needed.

---

## 9. Color System

### 9.1 Feature 0 — Progression Filter

- Notes **in** the progression: rendered at full opacity (no change)
- Notes **not** in the progression: rendered at 15% opacity (dimmed dots, not hidden) for spatial context

### 9.2 Feature A — Step View Dot Colors

| Dot Component | Color Source |
|---|---|
| **Core fill** | `NOTE_COLORS[note]` — the note's own color (e.g., C = `#ef4444`) |
| **Border ring** | `ALL_INTERVAL_COLORS[semitone]` where semitone = note's semitone distance from **chord root** |
| **Glow** | Border ring color at 40% opacity |

This gives players two simultaneous pieces of information per dot: which note it is, and its function within the chord.

### 9.3 Feature A — All Chords View Chord Color Palette

8 distinct vivid colors assigned sequentially to progression slots:
```ts
const PROGRESSION_CHORD_COLORS = [
  '#3b82f6',  // Blue    (slot 1)
  '#f97316',  // Orange  (slot 2)
  '#22c55e',  // Green   (slot 3)
  '#f59e0b',  // Amber   (slot 4)
  '#ec4899',  // Pink    (slot 5)
  '#8b5cf6',  // Violet  (slot 6)
  '#06b6d4',  // Cyan    (slot 7)
  '#ef4444',  // Red     (slot 8)
];
```

Notes shared by multiple chords: their `sharedChordColors` array gets all matching slot colors → rendered as stacked concentric rings (already supported by `Fretboard.tsx`).

### 9.4 Feature B — Fret Zone HUD

- Zone trigger buttons: small semi-transparent dots, 10px diameter, positioned above fret markers
- Hover state: expand to a small pill showing "Pos X"
- Active (popover open): filled with `accentPrimary`
- Popover chord pills: rounded, 28px height, text color on subtle background, hover highlights the notes on fretboard temporarily

---

## 10. Implementation Phases

### Phase 1 — Feature 0: Progression Filter (Simplest, highest value)
1. Add `getProgressionNoteSet()` to `lib/progressionNoteUtils.ts`
2. Add `selectedProgression` state + `activeFretboardPositions` derived memo in `app/page.tsx`
3. Update `ChordProgressionRecommendations.tsx` with selected-card styling and toggle
4. Update `MusicTheoryTabs.tsx` to forward callback
5. Wire `activeFretboardPositions` into the frontpage `<Fretboard>`
6. Add "Active Filter" pill badge above fretboard

**Estimate**: 2–3 components touched, 1 new util file, ~150 lines net new code

### Phase 2 — Feature B: Fret Zone Chord HUD
1. Create `FretZoneChordHUD`, `FretZoneTrigger`, `FretZonePopover` components
2. Create `GET /api/fret-zone-chords` route
3. Add React Query hook `useZoneChords(key, scale)`
4. Insert `<FretZoneChordHUD>` above the fretboard in `app/page.tsx`

**Estimate**: 3 new components, 1 new API route, 1 hook

### Phase 3 — Feature A: Progression Interval Chord Selector

**Phase 3a — Database Generation**:
1. Write TypeScript types in `lib/music-theory/progression-interval-chords/types.ts`
2. Write `scripts/generateProgressionIntervalChords.ts` with AI generation logic
3. Run script to generate all 12 key JSON files
4. Validate output against types

**Phase 3b — Loader + API**:
1. Write `lib/music-theory/progression-interval-chords/loader.ts` with LRU cache
2. Write `GET /api/progression-interval-chords` route
3. Write `useProgressionIntervalChords(key)` React Query hook

**Phase 3c — UI Components**:
1. `ProgressionIntervalChordSelector` (main component)
2. `ChordSlotPill`, `ChordAlternativePicker`, `ProgressionStepNavigator`, `ProgressionViewToggle`
3. Integrate with `ChordProgressionRecommendations` — show selector below selected card
4. Write `lib/progressionFretboardUtils.ts` — `buildStepViewPositions()`, `buildAllChordsViewPositions()`
5. Wire derived positions into page-level fretboard

**Phase 3d — Expanded Music Theory Database** (optional enhancement):
1. Add `diatonicChords` section to existing `music-theory/{key}-key-complete-database.json` files
2. This makes the key+scale database the single source of truth for scale-aware chord compatibility

**Estimate**: ~8–10 components/files, the bulk of work; database generation can be semi-automated

---

## Appendix: Key Design Decisions

| Decision | Rationale |
|---|---|
| Progression note filter dims (not hides) out-of-set notes | Players need spatial context; hidden dots confuse navigation |
| Feature A uses local JSON DB, not real-time AI | Deterministic, instant, no API cost per user interaction |
| Feature A does NOT need key+scale combos (just key) | Roman numerals encode the scale degree relationship; key alone sufficient for chord alternatives |
| Existing `sharedChordColors` rendering handles All Chords View | Zero changes to Fretboard.tsx needed for multi-chord overlap display |
| Feature B groups frets into 4-fret overlapping zones | Matches guitarist mental model of CAGED positions; cleaner than per-fret triggers |
| Feature B reuses `findChordsInScale` (no new algorithm) | Already battle-tested; avoids duplication |
| `staleTime: Infinity` for music theory queries | Music theory never changes; no re-fetch waste |
| Database files in `music-theory/` (not Supabase) | Static data, instant access, no RLS complexity, no latency |
| Chord selector panel NOT full-width | Proportional design: fixed ~680px, centered or left-aligned below card |
