# Foreground Overlay Patterns — Full Build Blueprint
**Project:** Musical Insights Pro
**Repo:** `C:\Next-JS\Musical Insights - Circle of 5ths updates v0.59`
**Author:** Agent Blueprint — 2026-08-08

---

## PART 0 — TASK SUMMARY

Two concrete UI changes plus six new foreground overlay pattern modes:

**UI Change 1:** Move the Zones GUI (the `TriadPositionsCard` — "Triad Positions: Root / 1st / 2nd" arrows/buttons) to the **right side** of the top info row in the triads-in-scale fretboard area, separated from the chord text on the left.

**UI Change 2:** Replace the hard-coded "Triads in Scale" label and triad-only controls with a **dropdown selector** that lets the user choose among seven overlay modes (Triads + 6 new patterns). Each mode shows its own relevant sub-controls inline below the dropdown. The triads-in-scale experience is preserved exactly; the other modes are additive.

---

## PART 1 — ARCHITECTURE OVERVIEW

### How "Triads in Scale" Works Today (the template)

All overlay modes follow this exact data flow:

```
musicTheory lib → compute foreground note set (string[])
                                  ↓
page.tsx state: triadData.notePositions  (NotePosition[] — foreground)
                triadScaleNotePositions  (NotePosition[] — background scale)
                displayedTriadNotes      (string[] — foreground note names)
                                  ↓
Fretboard.tsx receives:
  notePositions  = combinedNotePositions  (foreground triad + background scale)
  triadNotes     = displayedTriadNotes    (which notes are "foregrounded")
  showTriadMode  = true                   (enables triad rendering branch)
                                  ↓
Fretboard renders triad notes: full opacity, note color circle, interval border, glow
Fretboard renders background notes: opacity controlled by nonTriadOpacity prop (default 30%)
```

**Key rendering branch in `Fretboard.tsx` line 672:**
```typescript
if (showTriadMode && triadNotes.length > 0) {
  const isTriadNote = triadNotes.includes(notePos.note);
  if (isTriadNote) { /* bright foreground circle */ return; }
  return null; // background notes: handled by outer opacity layer
}
```

Background dimming is achieved by a wrapper `div` with `opacity: nonTriadOpacity/100` applied to the non-triad notePos row.

**NotePosition type** (from `lib/musicTheory.ts`):
```typescript
interface NotePosition {
  note: string;          // e.g. "C#"
  stringIndex: number;
  fretNumber: number;
  isRoot: boolean;
  chordTone?: 'root' | 'third' | 'fifth' | 'seventh';
  triadMembership?: any[];
}
```

---

## PART 2 — NEW TYPE DEFINITIONS

### 2.1 Overlay Mode Type

Add to `lib/overlay-patterns.ts` (new file):

```typescript
export type OverlayMode =
  | 'triads'           // existing
  | 'seventh-chords'   // 7th chords in scale (I–VII)
  | 'modes'            // mode shapes per chord degree
  | 'pentatonic'       // pentatonic per chord
  | 'arpeggios'        // arpeggio shapes per CAGED position
  | 'diatonic-intervals' // thirds, sixths, tenths
  | 'tritone';         // tension & resolution pairs

export interface OverlayModeConfig {
  id: OverlayMode;
  label: string;
  shortLabel: string;
  description: string;
  color: string;       // accent color for badge/label
}

export const OVERLAY_MODES: OverlayModeConfig[] = [
  { id: 'triads',             label: 'Triads in Scale',              shortLabel: 'Triads',       description: 'Diatonic triads I–VII foregrounded over the scale', color: '#5DB572' },
  { id: 'seventh-chords',     label: '7th Chords in Scale',          shortLabel: '7th Chords',   description: '4-note diatonic 7th chords (Maj7, min7, dom7, m7b5)', color: '#A07ED4' },
  { id: 'modes',              label: 'Mode Shapes per Degree',       shortLabel: 'Modes',        description: 'Mode that lives on each diatonic degree (Dorian on ii, etc.)', color: '#F5BC3C' },
  { id: 'pentatonic',         label: 'Pentatonic per Chord',         shortLabel: 'Pentatonic',   description: 'Matching pentatonic scale for the selected chord degree', color: '#3B9ED4' },
  { id: 'arpeggios',          label: 'Arpeggio Shapes (CAGED)',       shortLabel: 'Arpeggios',    description: 'Chord tone arpeggio within the selected CAGED position', color: '#F5BC3C' },
  { id: 'diatonic-intervals', label: 'Diatonic Intervals (3rds/6ths)', shortLabel: 'Intervals',  description: 'Diatonic 3rds and 6ths from a selected starting note', color: '#F43F5E' },
  { id: 'tritone',            label: 'Tritone Tension & Resolution',  shortLabel: 'Tritone',      description: 'Tritone pairs (b5) and their resolution targets highlighted', color: '#D946EF' },
];
```


---

## PART 3 — MUSIC THEORY COMPUTATION FUNCTIONS

All new compute functions go in `lib/overlay-patterns.ts`. They all return `string[]` — the **foreground note names** to highlight. The caller (page.tsx) passes these as `triadNotes` (the Fretboard prop already used by triads).

### 3.1 Shared Helpers

```typescript
import { getScaleNotes, CHORD_QUALITIES, ALL_INTERVAL_COLORS } from '@/lib/musicTheory';
import { normalizeNoteToSharp } from '@/lib/triad-theory';

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function noteAt(root: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(normalizeNoteToSharp(root));
  return CHROMATIC[(idx + semitones + 12) % 12];
}

// Diatonic 7th chord intervals for major scale degrees 0–6
const DIATONIC_7TH_INTERVALS: Record<number, number[]> = {
  0: [0, 4, 7, 11],  // I   Maj7
  1: [0, 3, 7, 10],  // ii  min7
  2: [0, 3, 7, 10],  // iii min7
  3: [0, 4, 7, 11],  // IV  Maj7
  4: [0, 4, 7, 10],  // V   dom7
  5: [0, 3, 7, 10],  // vi  min7
  6: [0, 3, 6, 10],  // vii° m7b5
};

export const DEGREE_LABELS = ['I','ii','iii','IV','V','vi','vii°'];
export const SEVENTH_CHORD_QUALITY_LABELS = ['Maj7','min7','min7','Maj7','dom7','min7','m7b5'];
export const MODE_NAMES = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'];
```

### 3.2 `get7thChordNotes(rootNote, scaleName, degree): string[]`

```typescript
export function get7thChordNotes(rootNote: string, scaleName: string, degree: number): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  if (scaleNotes.length < 7 || degree < 0 || degree > 6) return [];
  const chordRoot = scaleNotes[degree];
  const intervals = DIATONIC_7TH_INTERVALS[degree] ?? [0, 4, 7, 11];
  return intervals.map(i => noteAt(chordRoot, i));
}
```

### 3.3 `getModeNotes(rootNote, scaleName, degree): string[]`

```typescript
// Returns all 7 scale notes (same as parent scale; visual focus via modeRootNote)
export function getModeNotes(rootNote: string, scaleName: string, degree: number): string[] {
  return getScaleNotes(rootNote, scaleName);
}

export function getModeRoot(rootNote: string, scaleName: string, degree: number): string {
  const notes = getScaleNotes(rootNote, scaleName);
  return notes[degree] ?? rootNote;
}
```

### 3.4 `getPentatonicNotes(rootNote, scaleName, degree): string[]`

```typescript
export function getPentatonicNotes(rootNote: string, scaleName: string, degree: number): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  if (scaleNotes.length < 7) return [];
  const chordRoot = scaleNotes[degree];
  const qualities = CHORD_QUALITIES[scaleName] ?? CHORD_QUALITIES['Major'];
  const quality = qualities?.[degree] ?? 'maj';
  const isMajorChord = quality === 'maj';
  const isMinorChord = quality === 'min';
  const isDim        = quality === 'dim';

  let pentRoot = chordRoot;
  let pentIntervals: number[];

  if (isMajorChord) {
    pentIntervals = [0, 2, 4, 7, 9]; // major pentatonic
  } else if (isMinorChord) {
    pentIntervals = [0, 3, 5, 7, 10]; // minor pentatonic
  } else if (isDim) {
    pentRoot = noteAt(chordRoot, 3); // minor pent on b3 above
    pentIntervals = [0, 3, 5, 7, 10];
  } else {
    pentIntervals = [0, 2, 4, 7, 9];
  }
  return pentIntervals.map(i => noteAt(pentRoot, i));
}
```

### 3.5 `getArpeggioNotes(rootNote, scaleName, degree): string[]`

```typescript
// Same as 7th chord notes — 4 tones. CAGED zone filtering done at render time via highlightedZone.
export function getArpeggioNotes(rootNote: string, scaleName: string, degree: number): string[] {
  return get7thChordNotes(rootNote, scaleName, degree);
}
```

### 3.6 `getDiatonicIntervalNotes(rootNote, scaleName, startingNote, intervalType): string[]`

```typescript
export type DiatonicIntervalType = '3rd' | '6th' | '10th';

export function getDiatonicIntervalNotes(
  rootNote: string, scaleName: string,
  startingNote: string, intervalType: DiatonicIntervalType
): string[] {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const idx = scaleNotes.indexOf(normalizeNoteToSharp(startingNote));
  if (idx === -1) return [startingNote];
  const stepMap: Record<DiatonicIntervalType, number> = { '3rd': 2, '6th': 5, '10th': 2 };
  const partnerIdx = (idx + stepMap[intervalType]) % scaleNotes.length;
  return [startingNote, scaleNotes[partnerIdx]];
}
```

### 3.7 `getTritonePairs(rootNote, scaleName)`

```typescript
export function getTritonePairs(rootNote: string, scaleName: string): Array<{
  tensionNote: string; resolutionNotes: string[]; label: string;
}> {
  const scaleNotes = getScaleNotes(rootNote, scaleName);
  const results: Array<{ tensionNote: string; resolutionNotes: string[]; label: string }> = [];
  scaleNotes.forEach((note, i) => {
    const noteIdx = CHROMATIC.indexOf(normalizeNoteToSharp(note));
    const tritoneNote = CHROMATIC[(noteIdx + 6) % 12];
    if (scaleNotes.includes(tritoneNote)) {
      const resUp   = CHROMATIC[(CHROMATIC.indexOf(tritoneNote) + 1) % 12];
      const resDown = CHROMATIC[(noteIdx - 1 + 12) % 12];
      results.push({ tensionNote: tritoneNote, resolutionNotes: [resUp, resDown], label: `${DEGREE_LABELS[i]} tritone` });
    }
  });
  return results;
}
```

---

## PART 4 — STATE IN `app/page.tsx`

Add around line 139 (after existing triad state):

```typescript
import { OverlayMode } from '@/lib/overlay-patterns';

const [overlayMode, setOverlayMode] = useSupabaseStorage<OverlayMode>('guitar-app-overlay-mode', 'triads');
const [overlayDegree, setOverlayDegree] = useSupabaseStorage<number>('guitar-app-overlay-degree', 0);
const [intervalStartNote, setIntervalStartNote] = useSupabaseStorage<string>('guitar-app-interval-start-note', 'C');
const [intervalType, setIntervalType] = useSupabaseStorage<'3rd'|'6th'|'10th'>('guitar-app-interval-type', '3rd');
const [tritoneDegree, setTritoneDegree] = useSupabaseStorage<number>('guitar-app-tritone-degree', 4);
```

### 4.1 `foregroundNotes` useMemo (replaces raw `triadData?.triadNotes` usage)

```typescript
import { get7thChordNotes, getModeNotes, getModeRoot, getPentatonicNotes,
         getArpeggioNotes, getDiatonicIntervalNotes, getTritonePairs } from '@/lib/overlay-patterns';
import { normalizeNoteToSharp } from '@/lib/triad-theory';

const foregroundNotes = useMemo((): string[] => {
  const key = manualKey || rootNote;
  const scale = manualScaleName || scaleName;
  switch (overlayMode) {
    case 'triads':          return triadData?.triadNotes || [];
    case 'seventh-chords':  return get7thChordNotes(key, scale, overlayDegree);
    case 'modes':           return getModeNotes(key, scale, overlayDegree);
    case 'pentatonic':      return getPentatonicNotes(key, scale, overlayDegree);
    case 'arpeggios':       return getArpeggioNotes(key, scale, overlayDegree);
    case 'diatonic-intervals': return getDiatonicIntervalNotes(key, scale, intervalStartNote, intervalType);
    case 'tritone': {
      const pairs = getTritonePairs(key, scale);
      const p = pairs[tritoneDegree] ?? pairs[0];
      return p ? [p.tensionNote, ...p.resolutionNotes] : [];
    }
    default: return triadData?.triadNotes || [];
  }
}, [overlayMode, overlayDegree, intervalStartNote, intervalType, tritoneDegree,
    manualKey, rootNote, manualScaleName, scaleName, triadData]);

const modeRootNote = useMemo(() =>
  overlayMode === 'modes' ? getModeRoot(manualKey || rootNote, manualScaleName || scaleName, overlayDegree) : (manualKey || rootNote),
  [overlayMode, overlayDegree, manualKey, rootNote, manualScaleName, scaleName]);
```

### 4.2 Tension/resolution note sets for Fretboard (tritone mode)

```typescript
const fretboardTensionNotes = useMemo(() => {
  if (overlayMode !== 'tritone') return [];
  const pairs = getTritonePairs(manualKey || rootNote, manualScaleName || scaleName);
  return [pairs[tritoneDegree]?.tensionNote].filter(Boolean) as string[];
}, [overlayMode, tritoneDegree, manualKey, rootNote, manualScaleName, scaleName]);

const fretboardResolutionNotes = useMemo(() => {
  if (overlayMode !== 'tritone') return [];
  const pairs = getTritonePairs(manualKey || rootNote, manualScaleName || scaleName);
  return pairs[tritoneDegree]?.resolutionNotes || [];
}, [overlayMode, tritoneDegree, manualKey, rootNote, manualScaleName, scaleName]);
```

### 4.3 overlayColorMode for Fretboard

```typescript
const overlayColorMode: 'interval' | 'chord-function' | 'tension-resolution' = useMemo(() => {
  if (overlayMode === 'tension-resolution' || overlayMode === 'tritone') return 'tension-resolution';
  if (['seventh-chords','arpeggios'].includes(overlayMode)) return 'chord-function';
  return 'interval';
}, [overlayMode]);
```

### 4.4 Replace `triadNotes={displayedTriadNotes}` in all 3 Fretboard instances:

```tsx
// All 3 Fretboard instances — replace existing triadNotes prop:
triadNotes={foregroundNotes}
highlightKeyNote={overlayMode === 'modes' ? modeRootNote : (highlightKeyNote prop existing logic)}
overlayColorMode={overlayColorMode}
tensionNotes={fretboardTensionNotes}
resolutionNotes={fretboardResolutionNotes}
```

### 4.5 Pass to Header

```tsx
overlayMode={overlayMode}
onOverlayModeChange={setOverlayMode}
overlayDegree={overlayDegree}
onOverlayDegreeChange={setOverlayDegree}
intervalStartNote={intervalStartNote}
onIntervalStartNoteChange={setIntervalStartNote}
intervalType={intervalType}
onIntervalTypeChange={setIntervalType}
tritoneDegree={tritoneDegree}
onTritoneDegreeChange={setTritoneDegree}
```

---

## PART 5 — HEADER.tsx CHANGES

### 5.1 Add to HeaderProps interface (after existing allIntervalsMode block):

```typescript
overlayMode?: OverlayMode;
onOverlayModeChange?: (mode: OverlayMode) => void;
overlayDegree?: number;
onOverlayDegreeChange?: (degree: number) => void;
intervalStartNote?: string;
onIntervalStartNoteChange?: (note: string) => void;
intervalType?: '3rd' | '6th' | '10th';
onIntervalTypeChange?: (type: '3rd' | '6th' | '10th') => void;
tritoneDegree?: number;
onTritoneDegreeChange?: (degree: number) => void;
```

### 5.2 Destructure in function signature (after existing allIntervalsMode):

```typescript
overlayMode = 'triads',
onOverlayModeChange,
overlayDegree = 0,
onOverlayDegreeChange,
intervalStartNote = 'C',
onIntervalStartNoteChange,
intervalType = '3rd',
onIntervalTypeChange,
tritoneDegree = 4,
onTritoneDegreeChange,
```

### 5.3 Replace the `{showTriadMode && <TriadTab>}` block (line ~810) with:

```tsx
{showTriadMode && (
  <div className="flex-shrink-0">
    <OverlayModePanel
      theme={theme}
      overlayMode={overlayMode}
      onOverlayModeChange={onOverlayModeChange || (() => {})}
      overlayDegree={overlayDegree}
      onOverlayDegreeChange={onOverlayDegreeChange || (() => {})}
      intervalStartNote={intervalStartNote}
      onIntervalStartNoteChange={onIntervalStartNoteChange || (() => {})}
      intervalType={intervalType}
      onIntervalTypeChange={onIntervalTypeChange || (() => {})}
      tritoneDegree={tritoneDegree}
      onTritoneDegreeChange={onTritoneDegreeChange || (() => {})}
      currentKey={manualKey || rootNote}
      currentScale={manualScaleName || scaleName}
      selectedRoot={manualKey || rootNote}
      selectedTriadType={selectedTriadType}
      onTriadTypeChange={onTriadTypeChange || (() => {})}
      selectedCAGEDShapes={selectedTriadCAGEDShapes || []}
      onCAGEDShapesChange={onTriadCAGEDShapesChange || (() => {})}
      selectedInversion={selectedTriadInversion}
      onInversionChange={onTriadInversionChange || (() => {})}
      onTriadDataChange={onTriadDataChange}
      showCAGEDGuide={showCAGEDGuide}
    />
  </div>
)}
```

### 5.4 Triad Type selector — show only when overlayMode === 'triads':

```tsx
{showTriadMode && overlayMode === 'triads' && (
  <div> {/* existing Triad Type selector block */} </div>
)}
```

### 5.5 CAGED card — show for triads and arpeggios:

```tsx
{showTriadMode && (overlayMode === 'triads' || overlayMode === 'arpeggios') && (
  <CAGEDShapesCard ... />
)}
```

---

## PART 6 — `components/OverlayModePanel.tsx` (FULL SPEC)

Create new file. Import from `lib/overlay-patterns`, `lib/musicTheory`, `./TriadTab`.

**Props interface:**

```typescript
interface OverlayModePanelProps {
  theme: ThemeConfig;
  overlayMode: OverlayMode;
  onOverlayModeChange: (mode: OverlayMode) => void;
  overlayDegree: number;
  onOverlayDegreeChange: (degree: number) => void;
  intervalStartNote: string;
  onIntervalStartNoteChange: (note: string) => void;
  intervalType: DiatonicIntervalType;
  onIntervalTypeChange: (type: DiatonicIntervalType) => void;
  tritoneDegree: number;
  onTritoneDegreeChange: (degree: number) => void;
  currentKey: string;
  currentScale: string;
  // TriadTab passthrough:
  selectedRoot: string;
  selectedTriadType: TriadType;
  onTriadTypeChange: (t: TriadType) => void;
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (s: CAGEDShape[]) => void;
  selectedInversion: TriadInversion;
  onInversionChange: (i: TriadInversion) => void;
  onTriadDataChange?: (data: any) => void;
  showCAGEDGuide?: boolean;
}
```

**Rendered layout:**

```
┌─────────────────────────────────────────────────┐
│ Overlay Mode: [dropdown ▼]  ● (color dot)        │
│ Description text                                 │
├─────────────────────────────────────────────────┤
│ [Degree selector OR interval controls OR tritone]│
├─────────────────────────────────────────────────┤
│ [Color legend row]                               │
├─────────────────────────────────────────────────┤
│ [TriadTab — only when overlayMode === 'triads'] │
└─────────────────────────────────────────────────┘
```

**Degree Selector sub-component** (local to file):
- 7 buttons, each: Roman numeral bold on top, sublabel on bottom (note name, chord quality, or mode name depending on overlay mode)
- Selected = `theme.buttonPrimary` background; unselected = `theme.bgTertiary`

**DiatonicIntervalControls sub-component** (local to file):
- Row 1: "Starting Note" — one button per scale note (7 buttons using `getScaleNotes`)
- Row 2: Interval type segmented toggle — `[3rd] [6th] [10th]`

**TritoneControls sub-component** (local to file):
- 7 degree buttons (same style as DegreeSelector but with fuchsia `#D946EF` for selected
- Bottom legend: fuchsia dot = Tension, green dot = Resolution

**Color Legend sub-component** (local to file):
- `seventh-chords` / `arpeggios`: Red=Root, Gold=3rd, Green=5th, Purple=7th
- `modes`: "Showing {ModeName} mode — rooted on {noteDisplay}"
- `pentatonic`: "5-note {ChordRoot} pentatonic for degree {label}"
- `diatonic-intervals`: Blue dot = Note 1, Emerald dot = Interval partner
- `tritone`: Fuchsia dot = Tension, Green dot = Resolution

---

## PART 7 — `Fretboard.tsx` CHANGES

### 7.1 Add to FretboardProps interface (after `allIntervalsDisplayMode`):

```typescript
overlayColorMode?: 'interval' | 'chord-function' | 'tension-resolution';
tensionNotes?: string[];
resolutionNotes?: string[];
```

### 7.2 Destructure with defaults (after `allIntervalsDisplayMode = 'glow'`):

```typescript
overlayColorMode = 'interval',
tensionNotes = [],
resolutionNotes = [],
```

### 7.3 Extend `getIntervalBorderColor()` inside the `isTriadNote` block:

```typescript
const getIntervalBorderColor = (): string => {
  // Tension/resolution override
  if (overlayColorMode === 'tension-resolution') {
    if (tensionNotes.includes(notePos.note)) return '#D946EF';   // Fuchsia
    if (resolutionNotes.includes(notePos.note)) return '#5DB572'; // Green
  }
  // Chord function: root/3rd/5th/7th by index in foreground note set
  if (overlayColorMode === 'chord-function') {
    const toneToSemitone: Record<string, number> = { root: 0, third: 4, fifth: 7, seventh: 11 };
    const semitone = notePos.chordTone ? (toneToSemitone[notePos.chordTone] ?? 0) : 0;
    return ALL_INTERVAL_COLORS[semitone] ?? noteColor;
  }
  // Interval mode (existing + default)
  if (nonTriadColorMode) return noteColor;
  const toneToSemitone: Record<string, number> = { root: 0, third: 4, fifth: 7, seventh: 11 };
  const semitone = notePos.chordTone ? (toneToSemitone[notePos.chordTone] ?? 0) : 0;
  return ALL_INTERVAL_COLORS[semitone] ?? noteColor;
};
```

### 7.4 chordTone inference for non-triad overlays

Insert immediately before `getIntervalBorderColor()` call:

```typescript
// For overlays that don't pre-populate chordTone (all new modes except triads),
// infer from position in triadNotes array
let resolvedChordTone = notePos.chordTone;
if (!resolvedChordTone && triadNotes.length > 0) {
  const posInForeground = triadNotes.indexOf(notePos.note);
  const fnMap: ('root'|'third'|'fifth'|'seventh')[] = ['root','third','fifth','seventh'];
  resolvedChordTone = fnMap[posInForeground] ?? 'root';
}
// Temporarily assign for color function (do not mutate notePos)
const effectiveChordTone = resolvedChordTone;
```

Then use `effectiveChordTone` instead of `notePos.chordTone` inside `getIntervalBorderColor`.

---

## PART 8 — UI CHANGE 1: ZONES GUI TO RIGHT

**File:** `app/page.tsx`, around line 2867.

**Current structure:**
```tsx
<div className="flex items-center gap-3 flex-wrap">
  {/* chord badge */}
  {fretboardOrder === 'triads-top' && <TriadPositionsCard ... />}
  {/* ChordProgressionNavigator */}
  {/* notification */}
</div>
```

**New structure:**
```tsx
<div className="flex items-center justify-between gap-3 flex-wrap">
  {/* LEFT group */}
  <div className="flex items-center gap-3 flex-wrap">
    {/* chord badge — unchanged */}
    {/* ChordProgressionNavigator — unchanged */}
    {/* notification pulse — unchanged */}
  </div>
  {/* RIGHT: Zones (TriadPositionsCard) */}
  {fretboardOrder === 'triads-top' && (
    <div className="flex-shrink-0 ml-auto">
      <TriadPositionsCard
        theme={theme}
        selectedInversion={selectedTriadInversion}
        onInversionChange={setSelectedTriadInversion}
        positionCountsByInversion={positionCountsByInversion}
      />
    </div>
  )}
</div>
```

---

## PART 9 — `showTriadMode` BEHAVIORAL NOTE

- `showTriadMode` remains the on/off toggle for the entire overlay system
- The dropdown selects *which* overlay to show — it does not control on/off
- When `overlayMode !== 'triads'`, triadData is still loaded (TriadTab still mounts inside OverlayModePanel with CSS `display: none` or conditional render to keep data flowing — OR stop loading triadData when not in triads mode by adding a guard in TriadTab's useEffect: `if (overlayMode !== 'triads') return;`)
- The "Triad Type" selector in Header is hidden when `overlayMode !== 'triads'`
- CAGED card visible only when `overlayMode === 'triads' || overlayMode === 'arpeggios'`

---

## PART 10 — FILE CHANGE SUMMARY

| File | Type | Key Changes |
|------|------|-------------|
| `lib/overlay-patterns.ts` | **NEW** | OverlayMode type, OVERLAY_MODES config, all 6 compute functions |
| `components/OverlayModePanel.tsx` | **NEW** | Dropdown + DegreeSelector + DiatonicIntervalControls + TritoneControls + legend. Wraps TriadTab. |
| `app/page.tsx` | EDIT | 5 new state vars, foregroundNotes useMemo, modeRootNote, tension/resolution arrays, overlayColorMode, pass all to Header + all 3 Fretboard instances. Zones GUI layout fix. |
| `components/Header.tsx` | EDIT | 10 new props. Swap TriadTab for OverlayModePanel. Conditional CAGED card. Conditional Triad Type row. |
| `components/Fretboard.tsx` | EDIT | 3 new props. Extended getIntervalBorderColor. chordTone inference for new modes. |

---

## PART 11 — IMPLEMENTATION ORDER

1. Create `lib/overlay-patterns.ts` — all types + compute functions
2. Edit `app/page.tsx` — state + useMemos + foregroundNotes default backward-compat
3. Create `components/OverlayModePanel.tsx` — full component
4. Edit `components/Header.tsx` — add props, swap TriadTab for OverlayModePanel
5. Edit `components/Fretboard.tsx` — new props + rendering extensions
6. Edit `app/page.tsx` — Zones GUI layout (TriadPositionsCard to right)
7. `npx tsc --noEmit` — fix any type errors

---

## PART 12 — MUSICAL CORRECTNESS REFERENCE

| Overlay | C Major, Degree ii (D) | Expected foreground notes |
|---|---|---|
| 7th Chords | D min7 | D, F, A, C |
| Modes | Dorian on D | C, D, E, F, G, A, B (all 7 scale notes; D marked as mode root) |
| Pentatonic | D minor pent | D, F, G, A, C |
| Arpeggios | D min7 arpeggio | D, F, A, C |
| Diatonic 3rd, start=C | C Major | C + E |
| Diatonic 6th, start=C | C Major | C + A |
| Tritone, degree V (G) | G dom7's tritone | B + F (tension); C + E (resolution) |

---

## PART 13 — CONVENTIONS TO MATCH

- `useSupabaseStorage` for all persistent state (never `useState` for user prefs)
- `normalizeNoteToSharp()` before any CHROMATIC array indexOf lookup
- `getScaleNotes(rootNote, scaleName)` returns 7 notes in sharp notation
- `CHORD_QUALITIES[scaleName]` — key must exactly match e.g. `'Major'`, `'Minor'` (not `'Ionian'`)
- All `style={{}}` colors via `theme.*` tokens — no hardcoded Tailwind class colors
- Component file names: PascalCase matching export name
- Lucide React for any icons
- `getNoteDisplayName(note)` for all user-facing note display (respects flat/sharp preference)
