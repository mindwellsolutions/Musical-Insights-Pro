# Custom Progressions Tab — GUI/UX & Development Blueprint

> **Scope**: A new "Custom Progressions" tab positioned to the right of the existing "Recommended Progressions" tab in the harmonization/progressions tabbed card above the main fretboard. Contains two sub-panels: (A) a visual interval sequence **Builder** for manually constructing, editing, and reordering progressions; and (B) an **AI Interval Progression Generator** powered by GPT-4o-mini that generates 5 recommendations from natural-language emotional/mood descriptions. Both panels are fully key-aware, driven by the currently selected key + scale in the webapp.

---

## Table of Contents
1. [Existing Codebase Anchors](#1-existing-codebase-anchors)
2. [Tab Integration](#2-tab-integration)
3. [Feature Overview](#3-feature-overview)
4. [Data Types](#4-data-types)
5. [Manual Sequence Builder — UI Design](#5-manual-sequence-builder--ui-design)
6. [Drag-Reorder System](#6-drag-reorder-system)
7. [Step Edit Capability](#7-step-edit-capability)
8. [AI Generator Panel](#8-ai-generator-panel)
9. [Recommendations Display](#9-recommendations-display)
10. [Save & History System](#10-save--history-system)
11. [API Layer](#11-api-layer)
12. [Supabase Schema](#12-supabase-schema)
13. [State Architecture](#13-state-architecture)
14. [Component Architecture](#14-component-architecture)
15. [UX Behaviour & Flows](#15-ux-behaviour--flows)
16. [Visual Design System](#16-visual-design-system)
17. [Animation & Motion Spec](#17-animation--motion-spec)
18. [Implementation Phases](#18-implementation-phases)

---

## 1. Existing Codebase Anchors

| Asset | Path | Relevance |
|---|---|---|
| Tab card host | `app/page.tsx` ~lines 2600–2665 | Two-tab card (Harmonization / Recommended Progressions) — expands to **three tabs** by replacing the `showChordToneProgressions` boolean with a 3-value enum. |
| `showChordToneProgressions` | `app/page.tsx` line 1026 | Current boolean tab switch — **replaced** by `harmonizationTab: 'harmonization' \| 'recommended' \| 'custom'` |
| `rootNote` / `scaleName` | `app/page.tsx` | Current key and scale — passed as `currentKey` + `currentScale` to `CustomProgressionsTab` |
| `computeDiatonicTriads()` | `lib/music-theory/triad-membership/index.ts` | Returns the 7 diatonic degree objects for any key+scale — drives the interval palette chips |
| `DiatonicTriad` | `lib/music-theory/triad-membership/types.ts` | Core type: `{ degree, degreeIndex, rootNote, notes, color, quality }` — the shape every palette chip and step card is built from |
| `TRIAD_PALETTE` | `lib/music-theory/triad-membership/types.ts` | 7 semantic colors (I–vii°) — reused 1-to-1 for chip/card background and glow |
| `getScaleNotes()` | `lib/musicTheory.ts` | Note-name array for key+scale — available as fallback if `computeDiatonicTriads` not yet imported |
| `ROMAN_NUMERALS` / `ROMAN_NUMERALS_LOWER` | `lib/musicTheory.ts` | Uppercase/lowercase Roman numeral arrays — labels for degree display |
| `NOTE_COLORS` | `lib/musicTheory.ts` | Per-note hex colors — used to tint the note name text inside chips |
| `useChordDragOptimized` | `hooks/chord-progression/useChordDragOptimized.ts` | **Primary drag pattern**: mouse-event capture, `startX`/`currentX` tracking, insertion-point ghost, `onDragEnd` commits reorder. The new `useIntervalSequenceDrag` hook is a list-index simplification of exactly this pattern. |
| `useScaleModeDragOptimized` | `hooks/chord-progression/useScaleModeDragOptimized.ts` | Secondary drag reference — same `handleDragStart / handleDragMove / handleDragEnd` API shape |
| `ChordCard` drag handle | `components/chord-progression/ChordCard.tsx` | 6-dot braille drag handle (top-center, `opacity: 0.4 → 0.9` on hover) — **copy this exact visual** for `IntervalStepCard` |
| `AIProgressionGenerator` | `components/chord-progression/AIProgressionGenerator.tsx` | AI prompt panel pattern: textarea, sentiment preset pills, stepper controls, Generate button with abort, `localStorage` session cache, animated progress bars — **mirror exactly** |
| `ChordProgressionRecommendations` | `components/chord-progression/ChordProgressionRecommendations.tsx` | Recommendation card grid (name, mood badge, rationale, complexity star, "Load" button) — **mirror layout and card anatomy** |
| `/api/chord-progression/generate-recommendations` | `app/api/chord-progression/generate-recommendations/route.ts` | GPT-4o-mini request/response pattern, abort handling, JSON parse, error envelope — **mirror for new endpoint** |
| `ThemeConfig` | `lib/themes.ts` | All new components accept `theme: ThemeConfig` prop — never hardcode colors |
| Supabase admin pattern | throughout codebase | All SQL reads/writes use `createClient(supabaseUrl, supabaseServiceRoleKey)` admin client. `user_id` read server-side from JWT. Never trust body-supplied IDs. |

---

## 2. Tab Integration

### 2.1 State Change in `app/page.tsx`

**Replace** the `showChordToneProgressions: boolean` + `selectedChordTonePattern` with a clean 3-value tab discriminator. The existing carousel state is preserved for the "recommended" tab.

```ts
// REMOVE:
const [showChordToneProgressions, setShowChordToneProgressions] = useState(false);

// ADD:
type HarmonizationTabKey = 'harmonization' | 'recommended' | 'custom';
const [harmonizationTab, setHarmonizationTab] = useSupabaseStorage<HarmonizationTabKey>(
  'guitar-app-harmonization-tab', 'harmonization'
);
```

All downstream references to `showChordToneProgressions` (lines ~2551, ~2622, ~2626, ~2646) are updated to use `harmonizationTab`.

The `SongProgressionChordTonesTabs` `progressionsOpen` prop binding at line ~2551 becomes:
```ts
progressionsOpen={harmonizationTab === 'recommended'}
onProgressionsOpenChange={(open) => setHarmonizationTab(open ? 'recommended' : 'harmonization')}
```

### 2.2 Tab Header Row (~lines 2611–2641)

The tab array expands from 2 to 3 entries. The new icon uses `Sliders` from `lucide-react` (already installed):

```ts
const HARMZ_TABS = [
  {
    key: 'harmonization' as HarmonizationTabKey,
    label: 'Harmonization Options',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    key: 'recommended' as HarmonizationTabKey,
    label: 'Recommended Progressions',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'custom' as HarmonizationTabKey,
    label: 'Custom Progressions',
    icon: <Sliders className="w-3.5 h-3.5" />,
  },
];

// isActive logic (replaces the ternary):
const isActive = tab.key === harmonizationTab;

// onClick:
onClick={() => setHarmonizationTab(tab.key)}
```

### 2.3 Tab Body

```tsx
{/* Tab body */}
<div className="p-3">
  {harmonizationTab === 'harmonization' && (
    <HarmonizationTabs
      theme={theme}
      currentKey={rootNote}
      currentScale={scaleName}
      selectedHarmonization={selectedHarmonization}
      onHarmonizationChange={setSelectedHarmonization}
      isEmbedded
    />
  )}
  {harmonizationTab === 'recommended' && (
    <ChordToneProgressionCarousel
      theme={theme}
      selectedPatternId={selectedChordTonePattern?.id ?? null}
      onPatternSelect={setSelectedChordTonePattern}
      glowBrightness={patternGlowBrightness}
      onGlowBrightnessChange={setPatternGlowBrightness}
    />
  )}
  {harmonizationTab === 'custom' && (
    <CustomProgressionsTab
      theme={theme}
      currentKey={rootNote}
      currentScale={scaleName}
    />
  )}
</div>
```

`CustomProgressionsTab` is a **fully self-contained island component** — zero additional prop drilling from `page.tsx` beyond `theme`, `currentKey`, `currentScale`. All sub-state (builder sequence, AI results, save/load, history) is managed entirely inside the component tree.

---

## 3. Feature Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [♩ Harmonization Options]  [⚡ Recommended Progressions]  [● Custom Progressions] │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌── Sub-Tab Pill Row ─────────────────────────────────────────────────────┐   │
│  │   [ 🎛 Manual Builder ]          [ ✨ AI Generator ]                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ━━━ MANUAL BUILDER SUB-PANEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                  │
│  Key: C Major   ← reactive live badge                                           │
│                                                                                  │
│  Scale Degree Palette  (click to add to sequence):                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │  I   │ │  ii  │ │  iii │ │  IV  │ │  V   │ │  vi  │ │ vii° │             │
│  │  C   │ │  Dm  │ │  Em  │ │  F   │ │  G   │ │  Am  │ │ Bdim │             │
│  │  maj │ │  min │ │  min │ │  maj │ │  maj │ │  min │ │  dim │             │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                                  │
│  Sequence Lane  (drag to reorder · click × to remove · click card to edit):    │
│  ┌──────┐       ┌──────┐       ┌──────┐       ┌──────┐        ┌───┐           │
│  │ ⠿⠿⠿⠿ │  →   │ ⠿⠿⠿⠿ │  →   │ ⠿⠿⠿⠿ │  →   │ ⠿⠿⠿⠿ │   →   │ + │           │
│  │  I   │       │  IV  │       │  V   │       │  I   │        └───┘           │
│  │  C   │       │  F   │       │  G   │       │  C   │                         │
│  │    ✕ │       │    ✕ │       │    ✕ │       │    ✕ │                         │
│  └──────┘       └──────┘       └──────┘       └──────┘                         │
│  ↑ drag handle top · degree center · note name · ✕ remove bottom-right         │
│                                                                                  │
│  Unsaved strip (if ≥2 steps and unsaved):                                       │
│  ⚠ Unsaved progression — [Save Now]  [Discard]                                  │
│                                                                                  │
│  Action bar (right-aligned, content-width buttons):                             │
│      [💾 Save Progression]    [🗑 Clear All]    [📂 Load Saved ▾]               │
│                                                                                  │
│  ━━━ AI GENERATOR SUB-PANEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                  │
│  Describe the feeling, mood or musical intent of your progression:              │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  e.g. "dark minor descent that resolves unexpectedly to a major chord"   │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  Sentiment Presets:                                                             │
│  [Melancholic & emotional]  [Uplifting & hopeful]  [Dark & cinematic]          │
│  [Jazzy & complex]  [Epic & dramatic]                                           │
│                                                                                  │
│  Steps: [ – 4 + ]     Results: [ – 5 + ]          [ ✨ Generate Progressions ] │
│                                                                                  │
│  ── 5 Recommendation Cards ─────────────────────────────────────────────────   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ [mood]★  │  │ [mood]★  │  │ [mood]★  │  │ [mood]★  │  │ [mood]★  │        │
│  │ "Name"   │  │ "Name"   │  │ "Name"   │  │ "Name"   │  │ "Name"   │        │
│  │ I→vi→IV→V│  │ i→VII→VI │  │ I→IV→vi  │  │ ii→V→I   │  │ I→III→IV │        │
│  │ C Am F G │  │ Am G F   │  │ C F Am   │  │ Dm G C   │  │ C E F    │        │
│  │ rationale│  │ rationale│  │ rationale│  │ rationale│  │ rationale│        │
│  │[Load→Bld]│  │[Load→Bld]│  │[Load→Bld]│  │[Load→Bld]│  │[Load→Bld]│        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                                  │
│  [📂 Load History]  (right-aligned link)                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Feature Capabilities Summary

| Capability | Where | Notes |
|---|---|---|
| Add step | Palette chip click or [+] button | Appends to sequence tail |
| Remove step | ✕ on step card | Immediate, no confirmation needed |
| Reorder step | Drag handle → drag left/right | Index-based, same event pattern as `useChordDragOptimized` |
| **Edit step** | Click the card body (not the handle/✕) | Inline degree picker popover replaces the step |
| Save progression | [💾 Save Progression] or ★ on AI card | Name dialog → Supabase insert |
| Load saved | [📂 Load Saved ▾] popover | Shows history list, loads to Builder |
| Delete saved | 🗑 in history popover | Supabase delete, ownership checked |
| AI generate | [✨ Generate] | GPT-4o-mini, 5 cards, key-aware |
| Load AI rec to builder | [Load to Builder] on card | Populates sequence lane, switches to Builder tab |
| History | [📂 Load History] in AI panel | Same history popover as Builder |
| Key change reactivity | Automatic | Steps keep degree, rootNote updates |

---

## 4. Data Types

**File**: `lib/custom-progressions/types.ts`

```ts
// A single step in an interval/degree progression
export interface IntervalStep {
  id: string;                        // uuid — stable key for React + drag
  degree: string;                    // 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
  degreeIndex: number;               // 0–6
  rootNote: string;                  // resolved note name for the current key, e.g. 'C'
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  color: string;                     // TRIAD_PALETTE[degreeIndex]
}

// A full interval progression (manual or AI-generated)
export interface IntervalProgression {
  id: string;                        // uuid
  name: string;
  steps: IntervalStep[];
  key: string;                       // the key it was built for, e.g. 'C'
  scale: string;                     // e.g. 'Major'
  createdAt: string;                 // ISO date string
  source: 'manual' | 'ai';
  aiMetadata?: {
    prompt: string;
    rationale: string;
    emotionalContext: string;
    mood: string;
    complexity: number;              // 1–10
    musicTheoryBasis: string;
  };
}

// Shape returned by the AI API
export interface AIIntervalProgressionRecommendation {
  id: string;
  name: string;
  degrees: string[];                 // e.g. ['I', 'vi', 'IV', 'V']
  rationale: string;
  emotionalContext: string;
  mood: string;
  complexity: number;
  musicTheoryBasis: string;
}
```

---

## 5. Manual Sequence Builder — UI Design

### 5.1 Key Context Header

At the very top of the Builder panel, a slim one-line header:

```
Key: C Major                    [← changes reactively with the webapp key selector]
```

- Font: `12px`, `theme.textSecondary`; key name in `theme.accentPrimary`, `font-semibold`
- No interaction — purely informational. When key changes, text updates live.

### 5.2 Scale Degree Palette

Immediately below the key header. Displays the 7 diatonic degrees of the current key+scale as clickable chips derived from `computeDiatonicTriads(currentKey, currentScale)`.

**Palette section label**: `"Scale Degree Palette"` — `10px`, `theme.textSecondary`, `letter-spacing: 0.08em`, uppercase. Left-aligned above the chip row.

**Chip anatomy** (width `72px`, height `52px`, `border-radius: 10px`):
```
┌────────────────┐
│ I              │  ← degree Roman numeral (top-left, 10px, font-semibold, white)
│      C         │  ← root note (center, 17px, font-bold, white)
│     maj        │  ← quality abbrev (bottom-center, 9px, white/50%)
└────────────────┘
```

**Visual spec**:
- `background`: `${TRIAD_PALETTE[degreeIndex]}22` (14% opacity hex fill)
- `border`: `1.5px solid ${TRIAD_PALETTE[degreeIndex]}66` (40% opacity border at rest)
- On hover: border → `TRIAD_PALETTE[degreeIndex]` (100%), `transform: translateY(-2px)`, `box-shadow: 0 4px 12px ${TRIAD_PALETTE[degreeIndex]}44`
- On mousedown: `transform: translateY(0px) scale(0.96)` (pressed feel)
- On click: appends a new `IntervalStep` to the sequence tail; chip briefly pulses (`scale 1 → 1.08 → 1`, `80ms`)

Chips are **never full-width**. They are `72px` fixed, in a `flex-row gap-2 flex-wrap` container. The row left-aligns and wraps on very narrow containers. Never stretches to fill.

**Quality abbreviations**:
| Quality | Abbrev |
|---|---|
| major | `maj` |
| minor | `min` |
| diminished | `dim` |
| augmented | `aug` |

### 5.3 Sequence Lane

A horizontally scrollable lane below the palette. Renders steps left-to-right with `→` arrow separators. The lane has `overflow-x: auto`, `padding: 12px 0`, and a subtle inset shadow on both sides to indicate scrollability when steps overflow.

**Step Card anatomy** (width `68px`, height `78px`, `border-radius: 10px`):
```
┌──────────────────┐
│   ⠿ ⠿ ⠿ ⠿ ⠿ ⠿   │  ← 6-dot braille drag handle (top-center, 10px dot size, opacity 0.35)
│                  │  ← 4px spacer
│       IV         │  ← degree label (13px, font-bold, white, text-center)
│        F         │  ← note name (18px, font-bold, white, text-center)
│              [✕] │  ← remove button (bottom-right, 12px icon, opacity 0.45 → 1 on hover, red tint)
└──────────────────┘
```

**Visual spec**:
- `background`: `linear-gradient(160deg, ${TRIAD_PALETTE[degreeIndex]}dd, ${TRIAD_PALETTE[degreeIndex]}99)` — rich vivid fill with subtle depth gradient
- `border`: `1px solid ${TRIAD_PALETTE[degreeIndex]}` at 60% opacity at rest
- `box-shadow`: `0 2px 8px ${TRIAD_PALETTE[degreeIndex]}33` (soft ambient glow at rest)
- **Hover state** (not dragging, not on ✕): `box-shadow: 0 4px 16px ${TRIAD_PALETTE[degreeIndex]}66`, `border-color` at 100%, shows "click to edit" tooltip after 600ms
- **Selected/editing state**: `border: 2px solid rgba(255,255,255,0.8)`, `box-shadow: 0 0 0 3px ${TRIAD_PALETTE[degreeIndex]}, 0 4px 20px ${TRIAD_PALETTE[degreeIndex]}88`
- **Active drag state**: `opacity: 0.45`, `transform: scale(0.97)`, `box-shadow: none`

**Cursor**:
- On drag handle: `cursor: grab` / `cursor: grabbing` during drag
- On card body (not handle, not ✕): `cursor: pointer` (triggers edit)
- On ✕ button: `cursor: pointer`

**Arrow separators** between cards:
- Content: `→`
- Style: `fontSize: 16px`, `color: theme.textSecondary`, `opacity: 0.6`, `mx: 6px`, `flex-shrink: 0`
- Not a drag-drop target. During drag, the arrows between specific step positions briefly highlight to indicate drop zone (`opacity: 1`, color → `TRIAD_PALETTE[dragged step]`)

**[+ Add Step] button** at the lane tail:
- Dimensions: `width: 56px`, `height: 78px`, `border-radius: 10px`
- Style: `border: 1.5px dashed ${theme.border}`, `background: transparent`, centered `+` icon (`20px`, `theme.textSecondary`)
- Hover: border color → `theme.accentPrimary`, `+` color → `theme.accentPrimary`, `background: ${theme.accentPrimary}11`
- On click: opens the **degree picker popover** (same 7 chips as the palette, rendered in a compact `Popover` component anchored to the button)

**Empty lane state** (0 steps):
```
          ↑
  Click a scale degree above
  to start building your progression
```
- Centered vertically in the lane area (`min-height: 96px`)
- `fontSize: 12px`, `theme.textSecondary`, `opacity: 0.6`
- Faint upward-pointing arrow icon (`ChevronUp`, 20px) above the text

### 5.4 Step Number Badges

Each step card shows a small step-number badge (`1`, `2`, `3`...) in the top-right corner during non-drag normal state:
- `width: 16px`, `height: 16px`, `border-radius: 50%`, `fontSize: 9px`, `font-bold`
- `background: rgba(0,0,0,0.3)`, `color: white`
- Positioned `top: 4px right: 4px` using `position: absolute`

### 5.5 Action Bar

Below the sequence lane. Buttons are **right-aligned**, `width: auto` (content-based), never full-width.

```
                      [💾 Save Progression]    [🗑 Clear All]    [📂 Load Saved ▾]
```

**Button specs** (all `height: 32px`, `border-radius: 8px`, `font-size: 12px`, `font-semibold`, `px-3`):

| Button | Style | Condition | Action |
|---|---|---|---|
| 💾 Save Progression | `background: linear-gradient(135deg, theme.accentPrimary, theme.accentSecondary)`, white text | Disabled + reduced opacity when `steps.length < 2` | Opens inline name dialog |
| 🗑 Clear All | `background: theme.bgTertiary`, `border: 1px solid theme.border`, `color: theme.textSecondary` | Disabled when `steps.length === 0` | Clears sequence (no confirmation dialog — immediate, with undo toast for 4s) |
| 📂 Load Saved ▾ | `background: theme.bgTertiary`, `border: 1px solid theme.border`, `color: theme.textPrimary` | Always enabled | Toggles history popover |

**Save name dialog**: Appears as an inline slide-down strip directly below the action bar (not a modal). Contains:
- `<input placeholder="Name this progression..." />` — `width: 220px`, same theme styling
- `[Save ✓]` confirm button (accent gradient)
- `[Cancel]` dismiss link
- On confirm → POST to `/api/custom-progressions/save` → success toast "Progression saved ✓" → strip collapses

**Undo toast for Clear All**: `"Progression cleared — Undo"` toast with an `Undo` link for 4 seconds. If Undo clicked, restores the sequence from a `lastSequence` ref.

### 5.6 Unsaved Work Warning Strip

When `sequence.length >= 2` and no save has been performed since the last edit, an amber warning strip slides in **above** the action bar:

```
⚠  You have an unsaved progression   [💾 Save Now]   [Discard]
```

- `background: ${theme.accentPrimary}18` (warm amber tint), `border-left: 3px solid #f59e0b`
- `fontSize: 11px`, `padding: 6px 12px`, `border-radius: 6px`
- Triggered when: user switches sub-tab, or loads a different saved progression without saving
- **Not** triggered on every keystroke — only on navigation/load events

---

## 6. Drag-Reorder System

**File**: `hooks/custom-progressions/useIntervalSequenceDrag.ts`

A lightweight **list-index drag hook** (not timeline/pixel-based). Directly mirrors the event capture pattern of `useChordDragOptimized` and `useScaleModeDragOptimized` but operates on an **ordered array index** — no snap grid, no pixel positions, no multi-select needed.

### 6.1 State Shape

```ts
interface SequenceDragState {
  isDragging: boolean;
  dragIndex: number | null;      // index of the card being dragged
  hoverIndex: number | null;     // current insertion-point indicator (0 = before first, N = after last)
  startX: number;                // clientX at drag start
  currentX: number;              // clientX at last move event
}
```

### 6.2 Card Ref Registry

The hook receives a `cardRefs: React.RefObject<HTMLDivElement>[]` array (one ref per step card) so it can calculate each card's midpoint without needing DOM queries during drag:

```ts
function useIntervalSequenceDrag(
  steps: IntervalStep[],
  cardRefs: React.RefObject<HTMLDivElement>[],
  onSequenceChange: (reordered: IntervalStep[]) => void,
): {
  dragState: SequenceDragState;
  onDragStart: (index: number, clientX: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
  getCardStyle: (index: number) => React.CSSProperties;
  insertionGhostIndex: number | null;
}
```

### 6.3 Behaviour (mirrors `useChordDragOptimized` pattern exactly)

1. **`onDragStart(index, clientX)`**
   - Store `dragIndex = index`, `startX = clientX`
   - Capture `originalSteps` snapshot in a ref (for abort/reset)
   - Add global `mousemove` + `mouseup` listeners (same as `useChordDragOptimized` line-by-line pattern)
   - `touch-action: none` already set on handle via CSS

2. **`onDragMove(clientX)`**
   - `deltaX = clientX - startX`
   - Iterate `cardRefs` to find which gap (before/after each card midpoint) `currentX` falls into → set `hoverIndex`
   - No React state update for `currentX` — stored in a `currentXRef` to avoid re-render on every pixel move (same optimization as `useChordDragOptimized`)

3. **`onDragEnd()`**
   - Commit reorder: splice `dragIndex` out of a copy of `originalSteps`, insert at `hoverIndex`
   - Call `onSequenceChange(reorderedSteps)` — single React state update
   - Remove global listeners, reset drag state
   - No memory leak: listeners removed in `onDragEnd` and also in the cleanup of a `useEffect` that tracks `isDragging`

4. **`getCardStyle(index)`** — returns CSS for the card at `index`:
   - If `index === dragState.dragIndex`: `{ opacity: 0.45, transform: 'scale(0.97)', transition: 'none' }`
   - Otherwise: `{ opacity: 1, transform: 'translateX(0)', transition: 'transform 120ms ease-out' }`

### 6.4 Insertion Ghost

During drag, render a `2px wide × 78px tall` vertical ghost line at the `insertionGhostIndex` position between cards:
- Color: `TRIAD_PALETTE[steps[dragState.dragIndex].degreeIndex]`
- `border-radius: 2px`, `opacity: 0.85`
- Positioned between arrow separators (not overlapping them) using `position: relative` on the lane and `position: absolute` ghost elements aligned to card boundaries

### 6.5 Touch Support

`touchstart` / `touchmove` / `touchend` events are wired to the **drag handle** element via `onTouchStart`:

```ts
const handleTouchStart = (e: React.TouchEvent, index: number) => {
  e.preventDefault(); // prevents scroll hijack
  onDragStart(index, e.touches[0].clientX);
};
```

Global `touchmove` + `touchend` added to `window` with `{ passive: false }` during drag, removed on `touchend`. This mirrors exactly the mouse listener pattern used in `useChordDragOptimized`.

### 6.6 Memory Leak Prevention

```ts
useEffect(() => {
  if (!dragState.isDragging) return;
  // listeners already added in onDragStart
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };
}, [dragState.isDragging]);
```

All listener references are stable `useCallback` functions stored in refs — never recreated on render.

---

## 7. Step Edit Capability

**File**: `components/custom-progressions/IntervalStepCard.tsx` (edit mode state) + `components/custom-progressions/DegreePickerPopover.tsx` (inline picker)

Clicking the **body** of a step card (not the drag handle, not the ✕ button) enters **edit mode** for that step, allowing the user to swap it for a different scale degree without removing and re-adding it.

### 7.1 Trigger Zones

```
┌──────────────────┐
│   ⠿ ⠿ ⠿ ⠿ ⠿ ⠿   │  ← drag handle zone — onMouseDown starts drag, no edit
│                  │
│  [EDIT ZONE ─────│─── clicking anywhere in here triggers edit mode]
│       IV         │
│        F         │
│              [✕] │  ← remove zone — onClick removes step, no edit
└──────────────────┘
```

The edit zone covers the card body between the drag handle (top ~18px) and the ✕ button (bottom-right ~20px × 20px).

### 7.2 Edit Mode — Degree Picker Popover

On click of the edit zone:
1. The step card's border changes to the **selected/editing state** (white border + outer glow)
2. A `DegreePickerPopover` anchored to the card opens **below** the card (or above if near bottom edge)
3. The popover shows the same 7 degree chips as the palette (same visual, same `72px × 52px` spec)
4. The currently selected degree chip is highlighted with a white checkmark overlay
5. Clicking a chip: replaces the step's degree, rootNote, color, quality with the new selection → popover closes → card updates with a brief flash animation
6. Clicking outside the popover or pressing `Escape`: cancels edit → popover closes, card returns to resting state

### 7.3 `DegreePickerPopover` Component

```tsx
interface DegreePickerPopoverProps {
  theme: ThemeConfig;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;   // the step card element
  diatonicDegrees: DiatonicTriad[];
  currentDegreeIndex: number;
  onSelect: (degree: DiatonicTriad) => void;
  onClose: () => void;
}
```

**Popover layout**:
- `width: fit-content`, `padding: 10px`, `border-radius: 12px`
- `background: theme.bgSecondary`, `border: 1px solid theme.border`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.4)`
- Header label: `"Choose a degree"` — `10px`, uppercase, `theme.textSecondary`
- 7 chips in a `flex-row gap-2 flex-wrap` (same chip spec as palette)
- Currently selected chip: `ring: 2px solid white` overlay, `opacity: 1` (others at `opacity: 0.8`)
- Positioned using `getBoundingClientRect()` of anchor — `position: fixed` to escape any `overflow: hidden` parent

### 7.4 State in `IntervalStepCard`

```ts
const [isEditing, setIsEditing] = useState(false);

const handleCardBodyClick = (e: React.MouseEvent) => {
  // Ignore if clicking drag handle or remove button
  if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
  if ((e.target as HTMLElement).closest('[data-remove-btn]')) return;
  setIsEditing(true);
};

const handleDegreeSelect = (degree: DiatonicTriad) => {
  onEdit({ ...step, degree: degree.degree, degreeIndex: degree.degreeIndex, rootNote: degree.rootNote, color: degree.color, quality: degree.quality });
  setIsEditing(false);
};
```

### 7.5 `onEdit` Prop on `IntervalStepCard`

```ts
interface IntervalStepCardProps {
  // ...existing props
  onEdit: (updatedStep: IntervalStep) => void;   // NEW
  diatonicDegrees: DiatonicTriad[];              // NEW — needed by picker
}
```

In `IntervalSequenceBuilder`, `onEdit` handler updates the sequence array immutably:
```ts
const handleStepEdit = (index: number, updatedStep: IntervalStep) => {
  setSequence(prev => prev.map((s, i) => i === index ? updatedStep : s));
};
```

---

## 8. AI Generator Panel

**File**: `components/custom-progressions/AIIntervalProgressionGenerator.tsx`

Mirrors `components/chord-progression/AIProgressionGenerator.tsx` in structure and interaction pattern. Key difference: generates **interval/degree sequences** (Roman numeral progressions), not chord symbols.

### 8.1 Panel Layout

```
┌ Panel header ──────────────────────────────────────────────────────┐
│  ✨ AI Interval Progression Generator                               │
│  Key: C Major  ← live reactive badge                               │
└────────────────────────────────────────────────────────────────────┘

Prompt textarea:
  placeholder: "e.g. dark minor descent that resolves to an unexpected major chord"
  height: 72px auto-grows, max-height: 140px
  style: theme.bgTertiary bg, theme.border border, theme.textPrimary color
  resize: vertical

Sentiment presets row:
  [Melancholic & emotional]  [Uplifting & hopeful]  [Dark & cinematic]
  [Jazzy & complex]  [Epic & dramatic]

Controls + Generate row (all inline, left-to-right, gap-3, NOT full-width):
  [Steps – 4 +]    [Results – 5 +]               [ ✨ Generate Progressions ]

Progress / loading state (replaces cards area while generating):
  ┌ animated bars ─────────────────────────┐
  │  ░░░░░░░░░░░░░░  Analyzing key context  │
  │  ░░░░░░░░░░  Exploring emotional space  │
  │  ░░░░░░░░░░░░░░  Crafting progressions  │
  └────────────────────────────────────────┘

5 Recommendation Cards (grid, after generation):
  grid-template-columns: repeat(auto-fill, 200px)
  gap: 12px

[📂 Load History]  (bottom-right link, 11px, theme.textSecondary)
```

### 8.2 Sentiment Presets

Five pill buttons that fill the textarea on click (same interaction as `AIProgressionGenerator.tsx`):

```ts
const SENTIMENT_PRESETS = [
  { label: 'Melancholic & emotional',  value: 'melancholic, emotionally resonant, introspective' },
  { label: 'Uplifting & hopeful',      value: 'uplifting, hopeful, bright and resolving' },
  { label: 'Dark & cinematic',         value: 'dark, cinematic, tense with dramatic resolution' },
  { label: 'Jazzy & complex',          value: 'jazzy, harmonically complex, sophisticated and unexpected' },
  { label: 'Epic & dramatic',          value: 'epic, powerful, sweeping and emotionally overwhelming' },
];
```

Pills are `height: 28px`, `border-radius: 20px`, `font-size: 11px`, `padding: 0 12px`. Active (matching current textarea value): `background: theme.accentPrimary` tint, border accent. Inactive: `background: theme.bgTertiary`, `border: 1px solid theme.border`.

### 8.3 Stepper Controls

Both steppers use the same compact `[ – N + ]` pattern:
- Container: `display: flex; align-items: center; gap: 6px; height: 32px`
- `–` / `+` buttons: `width: 24px; height: 24px; border-radius: 6px; background: theme.bgTertiary; border: 1px solid theme.border`
- Value display: `width: 28px; text-align: center; font-size: 13px; font-bold; color: theme.textPrimary`
- Label above: `font-size: 10px; color: theme.textSecondary; letter-spacing: 0.06em; text-transform: uppercase`

**Steps stepper**: range `2–8`, default `4`. Labeled `"Steps"`.
**Results stepper**: range `3–5`, default `5`. Labeled `"Results"`. (5 is the default as requested.)

### 8.4 Generate Button

- `width: 180px; height: 36px; border-radius: 10px`
- `background: linear-gradient(135deg, theme.accentPrimary, theme.accentSecondary)`
- Icon: `Sparkles` (lucide, 14px) + `"Generate Progressions"` label
- Loading state: replaces icon with `Loader2` spinner, label → `"Generating..."`; button disabled during generation
- An `AbortController` ref (`abortRef`) allows cancelling in-flight requests if user navigates away — same pattern as `AIProgressionGenerator.tsx`

### 8.5 Request Payload (to `/api/interval-progression/generate-recommendations`)

```ts
{
  currentKey: string;          // e.g. 'C'
  currentScale: string;        // e.g. 'Major'
  userPrompt: string;          // from textarea
  numSteps: number;            // 2–8, default 4
  numRecommendations: number;  // 3–5, default 5
}
```

### 8.6 Response

```ts
{
  recommendations: AIIntervalProgressionRecommendation[];
  // Each has: id, name, degrees[], rationale, emotionalContext, mood, complexity, musicTheoryBasis
}
```

### 8.7 localStorage Cache

Key: `'interval-progression-recommendations'`. Stores the last set of generated recommendations for session persistence (survives page refresh). Cleared and replaced on each new generation. Same pattern and key as `RECOMMENDATIONS_STORAGE_KEY` in `AIProgressionGenerator.tsx`.

When the component mounts, if localStorage has cached results, they are loaded immediately into `aiRecommendations` state — no API call on mount.

### 8.8 Key Change Notice

When `currentKey` or `currentScale` changes after recommendations have been generated, show a non-blocking inline notice above the recommendations grid:

```
ℹ  Key changed to G Major — results shown are for the previous key.  [Regenerate]
```
- `background: theme.bgTertiary`, `border-left: 3px solid theme.accentPrimary`, `font-size: 11px`
- `[Regenerate]` button triggers generate with the last prompt and new key
- Dismissed automatically when user clicks Generate again

### 8.9 Loading / Error / Empty States

**Loading** (while generating):
```
  [ animated progress bars — same 3-bar animation as AIProgressionGenerator.tsx ]
  "Analyzing key context"     ░░░░░░░░░░░░░░░░░░░░░░░░
  "Exploring emotional space" ░░░░░░░░░░░░░░░
  "Crafting progressions"     ░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**Error**:
```
  ⚠ Failed to generate progressions. [Try Again]
```
Red border-left strip, `theme.textPrimary` text, retry fires the same request.

**No results yet** (initial state):
```
         ✨
  Describe the feeling or mood
  of your progression above and
  click Generate to get 5 ideas.
```
Centered, `theme.textSecondary`, `font-size: 12px`, `Sparkles` icon 24px above text.

---

## 9. Recommendations Display

**File**: `components/custom-progressions/IntervalProgressionRecommendations.tsx`

Mirrors `components/chord-progression/ChordProgressionRecommendations.tsx` layout. All 5 cards are shown simultaneously — no pagination.

### 9.1 Card Grid

```css
display: grid;
grid-template-columns: repeat(auto-fill, 200px);
gap: 12px;
justify-content: start;    /* never stretches cards to fill row */
```

On very narrow containers (tab panel < 500px wide): `grid-template-columns: repeat(auto-fill, minmax(160px, 200px))`

### 9.2 Recommendation Card Anatomy

```
┌──────────────────────────────────────┐  width: 200px  border-radius: 12px
│ [😔 Melancholic]          [★ Save]   │  ← mood badge (left) + save icon (right)
│                                      │
│  "Melancholic Descent"               │  ← name: 13px, font-semibold, textPrimary
│  complexity ★★★☆☆  (3/5)            │  ← star rating: 10px, gold fill
│                                      │
│  ┌──┐  ┌──┐  ┌──┐  ┌──┐            │  ← degree pills row
│  │ I│→ │vi│→ │IV│→ │ V│            │
│  └──┘  └──┘  └──┘  └──┘            │
│   C     Am    F     G               │  ← note names row: 10px, textSecondary
│                                      │
│  "Starts on the tonic, dips to      │  ← rationale: 10px, textSecondary, 3-line clamp
│   relative minor, resolves via      │
│   subdominant-dominant pair..."     │
│                                      │
│             [→ Load to Builder]     │  ← CTA button: right-aligned, width: auto
└──────────────────────────────────────┘
```

**Background**: `theme.bgSecondary`; `border: 1px solid theme.border`
**Hover**: `border-color: theme.accentPrimary` at 50%, `box-shadow: 0 4px 20px rgba(0,0,0,0.25)`, `transform: translateY(-2px)`

**Degree pills**:
- Each pill: `background: TRIAD_PALETTE[degreeIndex]`, `border-radius: 5px`, `min-width: 22px`, `height: 22px`, `font-size: 11px`, `font-bold`, `color: white`, `text-align: center`, `padding: 0 4px`
- Between pills: `→` in `theme.textSecondary`, `font-size: 12px`, `opacity: 0.6`

**Note names row**: horizontally aligned with their respective pills. `font-size: 10px`, `color: theme.textSecondary`, `text-align: center`. Derived client-side from current `diatonicDegrees`.

**Mood badge**: `font-size: 10px`, pill `border-radius: 20px`, `padding: 2px 8px`, `background: ${theme.accentPrimary}22`, `color: theme.accentPrimary`. Mood string from AI response.

**Complexity stars**: 5 stars filled to `Math.round(complexity / 2)` level. `font-size: 10px`. Gold: `#f59e0b`.

**★ Save button**:
- `BookmarkPlus` icon (lucide, 15px), `color: theme.textSecondary`
- On click: a small inline name input row fades in below the card title: `<input width: 160px />` + `[✓]` confirm + `[✕]` cancel
- On confirm → POST to `/api/custom-progressions/save` with `source: 'ai'` and `ai_metadata`
- After save: icon swaps to `BookmarkCheck` in `theme.accentPrimary` — persists for the session

**"Load to Builder" CTA**:
- `height: 28px`, `border-radius: 8px`, `font-size: 11px`, `font-semibold`, `padding: 0 12px`
- `background: linear-gradient(135deg, ${theme.accentPrimary}33, ${theme.accentSecondary}33)`, `border: 1px solid ${theme.accentPrimary}66`, `color: theme.accentPrimary`
- Hover: `background: linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary})`, `color: white`
- On click: resolves `degrees[]` to `IntervalStep[]` using `diatonicDegrees` → calls `onLoadToBuilder(steps)` → parent switches sub-tab to `'builder'` → brief "Loaded ✓" text replaces button text for 1.5s

### 9.3 Empty / Loading / Error States

See Section 8.9 — those states are rendered by `AIIntervalProgressionGenerator` wrapping this component.

---

## 10. Save & History System

### 10.1 Save Flow

**From Builder** (manual save):
1. User clicks **💾 Save Progression** (disabled if `steps.length < 2`)
2. Inline slide-down name input appears below the action bar (not a modal)
3. User types name → clicks `[Save ✓]` or presses Enter
4. POST to `/api/custom-progressions/save` with `source: 'manual'`
5. Success: toast "Progression saved ✓" · save dialog collapses · `savedProgressions` list refreshes
6. Error: inline error text "Save failed — try again"

**From AI card** (★ save):
1. Inline name input fades in below the card title
2. POST to `/api/custom-progressions/save` with `source: 'ai'` and `ai_metadata`
3. Success: toast · icon → `BookmarkCheck`

### 10.2 History / Load Interface

Triggered by **"📂 Load Saved ▾"** (Builder action bar) or **"📂 Load History"** (AI panel footer link). Both open the same `HistoryPopover` component.

**Popover spec**:
- Component: `components/custom-progressions/HistoryPopover.tsx`
- Anchored to the trigger button using `getBoundingClientRect()`, `position: fixed`
- `width: 380px`, `max-height: 340px`, `overflow-y: auto`
- `background: theme.bgSecondary`, `border: 1px solid theme.border`, `border-radius: 14px`
- `box-shadow: 0 12px 40px rgba(0,0,0,0.5)`

**Header**:
```
📂 Saved Progressions   ×
```
`font-semibold`, `font-size: 13px`, `theme.textPrimary`. `×` closes popover.

**History item row** (each `height: auto`, `padding: 10px 12px`, `border-bottom: 1px solid theme.border`):
```
┌─────────────────────────────────────────────────────────┐
│ [I][IV][V][I]  "My Dark Descent"                [Load]  │
│                C Major · 4 steps · Jun 22 2026   [🗑]   │
└─────────────────────────────────────────────────────────┘
```

- **Degree chip mini-preview**: `TRIAD_PALETTE[deg]` background, `width: 20px; height: 20px; border-radius: 4px; font-size: 9px; font-bold; color: white` — up to 5 chips, `+N` overflow badge if more
- **Name**: `font-size: 12px; font-semibold; color: theme.textPrimary`
- **Meta**: `font-size: 10px; color: theme.textSecondary` — `{key} {scale} · {steps.length} steps · {date}`
- **[Load]**: `height: 24px; border-radius: 6px; font-size: 11px; background: theme.accentPrimary; color: white; padding: 0 10px` — on click: populates Builder sequence lane, switches sub-tab to `'builder'`, closes popover
- **[🗑]**: `Trash2` icon (lucide, 13px), `color: theme.textSecondary`, hover → red. On click: optimistic removal from list + DELETE to `/api/custom-progressions/{id}`

**Empty state**: `"No saved progressions yet.\nSave your first progression using the builder or AI generator."` — centered, `theme.textSecondary`, 12px.

**Loading state**: while fetching: `Loader2` spinner centered, `"Loading history..."`.

### 10.3 History Data Loading Strategy

History is **lazy-loaded** — fetched only when the popover is first opened, never on component mount. `React Query` (`useQuery`) with key `['custom-progressions', userId]`:

```ts
const { data: savedProgressions, isLoading, refetch } = useQuery({
  queryKey: ['custom-progressions', userId],
  queryFn: () => fetch('/api/custom-progressions/list', { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()).then(d => d.progressions),
  enabled: historyOpen,   // only fetch when popover is open
  staleTime: 30_000,      // 30s cache — don't refetch on every open
});
```

On successful save, `queryClient.invalidateQueries(['custom-progressions', userId])` triggers a refresh.

---

## 11. API Layer

### 11.1 New Endpoint: Generate Interval Progression Recommendations

**File**: `app/api/interval-progression/generate-recommendations/route.ts`

```
POST /api/interval-progression/generate-recommendations
Authorization: Bearer {supabase-access-token}  (optional — generation works unauthed, saving requires auth)
Body: { currentKey, currentScale, userPrompt, numSteps, numRecommendations }
Response: { recommendations: AIIntervalProgressionRecommendation[] }
```

**Implementation**:
- Uses `openai` (gpt-4o-mini) — already installed and configured in the project
- System + user prompt design (below)
- Returns exactly `numRecommendations` (default 5) progressions
- Response parsed with `JSON.parse`; falls back to extracting JSON from markdown code blocks if model wraps in backticks (same resilience pattern as `generate-recommendations` chord route)
- `AbortController` wired to `req.signal` so browser navigation mid-request doesn't leave the connection hanging
- Error: returns `{ error: string }` with appropriate HTTP status

**Refined AI Prompt Engineering**:

```
SYSTEM:
You are a music theory expert specializing in scale degree interval progressions for all
musical genres. You generate Roman numeral progressions that create specific emotional
and sonic experiences. Use standard Roman numeral notation (uppercase = major, lowercase = minor,
° = diminished). You may include borrowed chords from parallel modes when musically appropriate.
Always return valid JSON only — no markdown, no explanation outside the JSON structure.

USER:
Generate {numRecommendations} distinct interval progressions for:
  Key: {currentKey}
  Scale: {currentScale}
  Mood / emotional intent: "{userPrompt || 'any expressive style'}"
  Steps per progression: {numSteps}

Each progression must be emotionally distinct. Use the full range of scale degrees.
Vary complexity, direction (ascending/descending patterns), and resolution strategies.

Return this exact JSON structure:
{
  "recommendations": [
    {
      "id": "unique-string",
      "name": "Short evocative name (3–5 words)",
      "degrees": ["I", "vi", "IV", "V"],
      "rationale": "1-2 sentence description of the harmonic logic and emotional effect",
      "emotionalContext": "single word or short phrase describing the core emotion",
      "mood": "single mood word for the badge (e.g. Melancholic, Uplifting, Tense)",
      "complexity": 4,
      "musicTheoryBasis": "brief theory note (e.g. 'Classic I-vi-IV-V with pop cadence')"
    }
  ]
}

Complexity is 1–10. Degrees must be valid for {currentScale} scale, with optional borrowed chords noted.
```

### 11.2 New Endpoint: Save Custom Progression

**File**: `app/api/custom-progressions/save/route.ts`

```
POST /api/custom-progressions/save
Authorization: Bearer {supabase-access-token}
Body: {
  name: string,
  steps: IntervalStep[],
  key: string,
  scale: string,
  source: 'manual' | 'ai',
  aiMetadata?: { prompt, rationale, emotionalContext, mood, complexity, musicTheoryBasis }
}
Response: { id: string }
```

- Validates `name` not empty, `steps.length >= 1`, `source` enum
- Uses Supabase admin client for the INSERT
- Extracts `user_id` by verifying the JWT from `Authorization` header server-side (using `@supabase/ssr` `createServerClient` + `getUser()`)
- Never trusts a `user_id` from the request body

### 11.3 New Endpoint: List User's Saved Progressions

**File**: `app/api/custom-progressions/list/route.ts`

```
GET /api/custom-progressions/list
Authorization: Bearer {supabase-access-token}
Response: { progressions: IntervalProgression[] }
```

- Admin client SELECT with `eq('user_id', userId)`, `order('created_at', { ascending: false })`, `limit(50)`
- Maps DB rows to `IntervalProgression` shape (snake_case → camelCase)

### 11.4 New Endpoint: Delete Progression

**File**: `app/api/custom-progressions/[id]/route.ts`

```
DELETE /api/custom-progressions/{id}
Authorization: Bearer {supabase-access-token}
Response: { success: true }
```

- Verifies ownership: admin SELECT first to confirm `row.user_id === userId` extracted from JWT
- If ownership mismatch: `403 Forbidden`
- Admin client DELETE on verified `id`

---

## 12. Supabase Schema

**Table**: `custom_interval_progressions`

```sql
CREATE TABLE IF NOT EXISTS public.custom_interval_progressions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  name          text NOT NULL,
  steps         jsonb NOT NULL,         -- IntervalStep[]
  key           text NOT NULL,          -- e.g. 'C'
  scale         text NOT NULL,          -- e.g. 'Major'
  source        text NOT NULL CHECK (source IN ('manual','ai')),
  ai_metadata   jsonb,                  -- AIIntervalProgressionRecommendation fields (nullable)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user-scoped listing
CREATE INDEX idx_cip_user_created ON public.custom_interval_progressions (user_id, created_at DESC);

-- RLS
ALTER TABLE public.custom_interval_progressions ENABLE ROW LEVEL SECURITY;

-- Service role full access (admin operations)
CREATE POLICY "service_role_all" ON public.custom_interval_progressions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users read/write own rows (for direct Supabase client calls if needed)
CREATE POLICY "users_own_rows" ON public.custom_interval_progressions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

> **All API routes use the Supabase service role admin client** — never the user's session client. `user_id` is extracted server-side from the Authorization header JWT, never trusted from the request body.

---

## 13. State Architecture

### 13.1 State Lifted to `app/page.tsx` (minimal — only what's needed cross-component)

```ts
// Replace showChordToneProgressions boolean:
type HarmonizationTabKey = 'harmonization' | 'recommended' | 'custom';
const [harmonizationTab, setHarmonizationTab] =
  useSupabaseStorage<HarmonizationTabKey>('guitar-app-harmonization-tab', 'harmonization');
```

That is the **only** change to `page.tsx` state. `CustomProgressionsTab` is a fully self-contained island.

### 13.2 State Inside `CustomProgressionsTab`

```ts
// Sub-tab
type CustomSubTab = 'builder' | 'ai';
const [subTab, setSubTab] = useState<CustomSubTab>('builder');

// Builder sequence (the live editable progression)
const [sequence, setSequence] = useState<IntervalStep[]>([]);
const lastSequenceRef = useRef<IntervalStep[]>([]); // for undo after Clear All
const [isSaved, setIsSaved] = useState(true);       // tracks unsaved changes

// Builder save dialog (inline strip)
const [saveDialogOpen, setSaveDialogOpen] = useState(false);
const [saveName, setSaveName] = useState('');
const [isSaving, setIsSaving] = useState(false);

// History popover
const [historyOpen, setHistoryOpen] = useState(false);

// AI panel
const [aiPrompt, setAiPrompt] = useState('');
const [numSteps, setNumSteps] = useState(4);
const [numResults, setNumResults] = useState(5);
const [aiGenerating, setAiGenerating] = useState(false);
const [aiRecommendations, setAiRecommendations] = useState<AIIntervalProgressionRecommendation[]>(
  () => {
    // Restore from localStorage on mount — no API call
    try { return JSON.parse(localStorage.getItem('interval-progression-recommendations') || '[]'); }
    catch { return []; }
  }
);
const [aiError, setAiError] = useState<string | null>(null);
const [keyChangedSinceGeneration, setKeyChangedSinceGeneration] = useState(false);
const abortRef = useRef<AbortController | null>(null);
```

`isSaved` is set to `false` whenever `sequence` changes (via `useEffect` watching `sequence`) and set back to `true` after a successful save. This drives the unsaved warning strip.

### 13.3 Derived (useMemo — zero API calls)

```ts
// Scale degrees for current key+scale — pure function, no network
const diatonicDegrees = useMemo(
  () => computeDiatonicTriads(currentKey, currentScale),
  [currentKey, currentScale]
);
```

### 13.4 Key+Scale Change Effect

```ts
// When key or scale changes: keep degree identity, update rootNote + color
useEffect(() => {
  if (sequence.length === 0) return;
  setSequence(prev => prev.map(step => {
    const deg = diatonicDegrees.find(d => d.degree === step.degree);
    // If degree doesn't exist in new scale (e.g. borrowed chord), keep as-is
    return deg ? { ...step, rootNote: deg.rootNote, color: deg.color, quality: deg.quality } : step;
  }));
  // Mark AI recommendations as stale
  if (aiRecommendations.length > 0) setKeyChangedSinceGeneration(true);
}, [currentKey, currentScale]); // diatonicDegrees is derived in sync — no extra dep needed
```

---

## 14. Component Architecture

### 14.1 New Files

```
components/
└── custom-progressions/
    ├── CustomProgressionsTab.tsx             # Island: sub-tab switcher + state hub
    ├── IntervalSequenceBuilder.tsx           # Manual builder: key header + palette + lane + action bar
    ├── IntervalStepCard.tsx                  # Single draggable/editable step card
    ├── DegreePaletteChip.tsx                 # Clickable chip in the palette
    ├── DegreePickerPopover.tsx               # Inline degree swap picker (for step edit)
    ├── HistoryPopover.tsx                    # Shared save history popover
    ├── AIIntervalProgressionGenerator.tsx    # AI prompt panel
    └── IntervalProgressionRecommendations.tsx # 5-card recommendation grid

hooks/
└── custom-progressions/
    └── useIntervalSequenceDrag.ts            # List-index drag hook (mirrors useChordDragOptimized)

lib/
└── custom-progressions/
    └── types.ts                              # IntervalStep, IntervalProgression, AIIntervalProgressionRecommendation

app/api/
├── interval-progression/
│   └── generate-recommendations/
│       └── route.ts                          # GPT-4o-mini: generates 5 degree progressions
└── custom-progressions/
    ├── save/
    │   └── route.ts                          # POST: insert progression
    ├── list/
    │   └── route.ts                          # GET: user's saved progressions
    └── [id]/
        └── route.ts                          # DELETE: remove progression (ownership verified)
```

### 14.2 Modified Files

| File | Change | Lines affected |
|---|---|---|
| `app/page.tsx` | Replace `showChordToneProgressions` boolean → `harmonizationTab` 3-value enum; update tab header array (2→3 tabs); update tab body conditionals; update `SongProgressionChordTonesTabs` `progressionsOpen` binding | ~6 lines changed, ~15 lines added |

**All other existing files are untouched.**

### 14.3 Component Props Contracts

#### `CustomProgressionsTab`
```ts
interface CustomProgressionsTabProps {
  theme: ThemeConfig;
  currentKey: string;    // rootNote from page.tsx — live reactive
  currentScale: string;  // scaleName from page.tsx — live reactive
}
```

#### `IntervalSequenceBuilder`
```ts
interface IntervalSequenceBuilderProps {
  theme: ThemeConfig;
  diatonicDegrees: DiatonicTriad[];
  sequence: IntervalStep[];
  isSaved: boolean;
  onSequenceChange: (steps: IntervalStep[]) => void;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
  onHistoryOpen: () => void;
  currentKey: string;
  currentScale: string;
}
```

#### `IntervalStepCard`
```ts
interface IntervalStepCardProps {
  theme: ThemeConfig;
  step: IntervalStep;
  index: number;
  diatonicDegrees: DiatonicTriad[];
  isDragging: boolean;
  style?: React.CSSProperties;                 // from getCardStyle(index)
  cardRef: React.RefObject<HTMLDivElement>;
  onDragStart: (index: number, clientX: number) => void;
  onRemove: (index: number) => void;
  onEdit: (index: number, updated: IntervalStep) => void;
}
```

#### `DegreePaletteChip`
```ts
interface DegreePaletteChipProps {
  theme: ThemeConfig;
  degree: DiatonicTriad;
  onClick: (degree: DiatonicTriad) => void;
  isSelected?: boolean;                        // for DegreePickerPopover usage
}
```

#### `DegreePickerPopover`
```ts
interface DegreePickerPopoverProps {
  theme: ThemeConfig;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;
  diatonicDegrees: DiatonicTriad[];
  currentDegreeIndex: number;
  onSelect: (degree: DiatonicTriad) => void;
  onClose: () => void;
}
```

#### `HistoryPopover`
```ts
interface HistoryPopoverProps {
  theme: ThemeConfig;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onLoad: (progression: IntervalProgression) => void;
  onDelete: (id: string) => Promise<void>;
  // React Query provides data — passed in from CustomProgressionsTab
  progressions: IntervalProgression[];
  isLoading: boolean;
}
```

#### `AIIntervalProgressionGenerator`
```ts
interface AIIntervalProgressionGeneratorProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  diatonicDegrees: DiatonicTriad[];
  recommendations: AIIntervalProgressionRecommendation[];
  isGenerating: boolean;
  error: string | null;
  keyChangedSinceGeneration: boolean;
  onGenerate: (prompt: string, numSteps: number, numResults: number) => Promise<void>;
  onLoadToBuilder: (degrees: string[]) => void;
  onSaveRecommendation: (rec: AIIntervalProgressionRecommendation, name: string) => Promise<void>;
  onHistoryOpen: () => void;
}
```

#### `IntervalProgressionRecommendations`
```ts
interface IntervalProgressionRecommendationsProps {
  theme: ThemeConfig;
  recommendations: AIIntervalProgressionRecommendation[];
  diatonicDegrees: DiatonicTriad[];
  onLoadToBuilder: (degrees: string[]) => void;
  onSave: (rec: AIIntervalProgressionRecommendation, name: string) => Promise<void>;
}
```

---

## 15. UX Behaviour & Flows

### 15.1 Flow A — Manual Build & Save

```
1. User has selected a key (e.g. C Major) in the main webapp
2. User clicks "Custom Progressions" tab → defaults to Builder sub-panel
3. Key header reads "Key: C Major"
4. Palette shows 7 chips: I(C) ii(Dm) iii(Em) IV(F) V(G) vi(Am) vii°(Bdim)
5. User clicks "I" chip → first step card appears in lane
6. User clicks "IV" chip → second step card
7. User clicks "V" chip → third step card
8. User clicks "I" chip again → fourth step card (same degree OK)
9. Lane shows: [I·C] → [IV·F] → [V·G] → [I·C]  [+]
10. User grabs the drag handle on [V·G] and drags it left past [IV·F]
    → insertion ghost appears between [I·C] and [IV·F]
    → on release: [I·C] → [V·G] → [IV·F] → [I·C]
11. User clicks the body of [IV·F] → edit mode: DegreePickerPopover opens
12. User selects "vi" → step changes to [vi·Am]
13. Lane: [I·C] → [V·G] → [vi·Am] → [I·C]
14. User clicks "💾 Save Progression" → inline save strip slides down
15. User types "My Pop Turnaround" → clicks [Save ✓]
16. Toast: "Progression saved ✓" · strip collapses · isSaved = true
```

### 15.2 Flow B — AI Generate & Load to Builder

```
1. User clicks "AI Generator" sub-tab
2. Sees: prompt textarea, 5 sentiment presets, Steps stepper (4), Results stepper (5)
3. User clicks [Uplifting & hopeful] preset → textarea fills
4. User changes Steps to 6
5. User clicks [✨ Generate Progressions]
   → progress bars animate
   → 5 recommendation cards appear after 3–8 seconds
6. Each card shows: [mood badge] [★] · name · complexity stars · degree pills → note names · rationale · [Load to Builder]
7. User clicks "Load to Builder" on Card 3
   → sub-tab switches to Builder
   → sequence lane populates with Card 3's degrees resolved to current key
   → brief "Loaded ✓" text on that card (only visible if user switches back to AI tab)
8. User can now edit, reorder, remove steps in the Builder
9. User saves with a custom name
```

### 15.3 Flow C — Load Saved History

```
1. From Builder: user clicks [📂 Load Saved ▾]
2. HistoryPopover opens, fetches list (React Query, lazy)
3. List shows 3 saved progressions (most recent first):
   [I][IV][V][I]  "My Pop Turnaround"   C Major · 4 steps · Jun 22
   [i][VII][VI]   "Dark Descent"        A Minor · 3 steps · Jun 20
   [I][iii][IV]   "Sunrise Arc"         G Major · 3 steps · Jun 18
4. User clicks [Load] on "Dark Descent"
   → unsaved warning strip fires IF sequence has ≥2 unsaved steps
   → user confirms "Discard" or saves first
   → sequence lane populated with [i·Am] → [VII·G] → [VI·F]
   → popover closes
5. User clicks 🗑 on "Sunrise Arc"
   → optimistic: row removed from popover list immediately
   → DELETE fires in background; if error, row reappears with toast "Delete failed"
```

### 15.4 Flow D — Key Change While Builder Has Steps

```
1. User has [I·C] → [IV·F] → [V·G] built for C Major
2. User changes key to G Major using the main webapp key selector
3. Builder sequence lane updates immediately:
   [I·G] → [IV·C] → [V·D]
   (degree labels unchanged; note names updated)
4. Key header: "Key: G Major"
5. Palette rebuilds: I(G) ii(Am) iii(Bm) IV(C) V(D) vi(Em) vii°(F#dim)
6. AI Generator shows: "ℹ Key changed to G Major — results shown are for the previous key. [Regenerate]"
```

### 15.5 Empty-Key Guard

If `!currentKey || !currentScale`, render a full-panel centered message in **both** sub-panels:

```
     🎵
  Select a key and scale
  on the fretboard above to use
  Custom Progressions
```
`Music` icon (lucide, 28px), `font-size: 13px`, `theme.textSecondary`, all interactive elements disabled.

### 15.6 Unsaved Work Protection Trigger Points

The unsaved warning strip fires **only** on explicit navigation events, not passively:
- Switching from Builder sub-tab → AI Generator sub-tab (when `!isSaved && sequence.length >= 2`)
- Clicking [Load] in history popover (when `!isSaved && sequence.length >= 2`)
- Clicking "Load to Builder" on an AI card (when `!isSaved && sequence.length >= 2`)

**Not** triggered by:
- Key change (builder content updates in-place, not replaced)
- Switching the main webapp tab (nothing to save yet, feature is isolated)
- Adding/removing steps (the strip shows, it doesn't block)

---

## 16. Visual Design System

### 16.1 Degree Color Palette

Directly reuse `TRIAD_PALETTE` — imported from `lib/music-theory/triad-membership/types.ts`. **Do not hardcode these hex values** — always reference through `TRIAD_PALETTE[degreeIndex]`.

| Index | Degree | Palette Color | Hex |
|---|---|---|---|
| 0 | I   | Muted Indigo-Violet | `#7F77DD` |
| 1 | ii  | Teal-Green          | `#1D9E75` |
| 2 | iii | Amber               | `#EF9F27` |
| 3 | IV  | Dusty Rose          | `#D4537E` |
| 4 | V   | Muted Yellow-Green  | `#97C459` |
| 5 | vi  | Medium Purple       | `#C56BD6` |
| 6 | vii°| Teal-Cyan           | `#4FB3C4` |

Usage pattern:
```ts
const color = TRIAD_PALETTE[step.degreeIndex];

// Step card gradient fill:
background: `linear-gradient(160deg, ${color}dd, ${color}99)`

// Palette chip fill:
background: `${color}22`
border: `1.5px solid ${color}66`

// Palette chip hover:
border: `1.5px solid ${color}`
box-shadow: `0 4px 12px ${color}44`

// Step card ambient glow:
box-shadow: `0 2px 8px ${color}33`

// Step card hover glow:
box-shadow: `0 4px 16px ${color}66`

// Insertion ghost line:
background: color
opacity: 0.85

// Recommendation card degree pill:
background: color
```

### 16.2 Sub-Tab Pill Row

The two sub-tabs (Manual Builder / AI Generator) are rendered as pill-shaped toggle buttons, **not** full-width tabs:

```ts
// Container
display: flex; gap: 4px; padding: 4px; border-radius: 10px;
background: theme.bgTertiary; border: 1px solid theme.border;
width: fit-content;   // NOT full-width

// Active pill
background: linear-gradient(135deg, theme.accentPrimary, theme.accentSecondary);
color: white;
border-radius: 7px; height: 30px; padding: 0 14px; font-size: 12px; font-semibold;

// Inactive pill
background: transparent; color: theme.textSecondary;
border-radius: 7px; height: 30px; padding: 0 14px; font-size: 12px;
hover: color: theme.textPrimary
```

### 16.3 Panel Container

The entire `CustomProgressionsTab` panel:
```ts
padding: 0;             // padding is inside each sub-panel, not on the wrapper
display: flex;
flex-direction: column;
gap: 0;
min-height: 200px;
```

Sub-tab content area:
```ts
padding: 12px 0 8px 0;
```

### 16.4 Sizing Standards

All elements are **purposefully sized** — none stretch to fill container width except textareas and the panel wrapper itself.

| Element | Width | Height | Border-radius |
|---|---|---|---|
| Palette chip | `72px` | `52px` | `10px` |
| Sequence step card | `68px` | `78px` | `10px` |
| Sequence `+` add button | `56px` | `78px` | `10px` |
| Arrow separator `→` | `auto` (content) | — | — |
| AI recommendation card | `200px` | `auto` (~190px) | `12px` |
| Degree pill in AI card | `auto ≥22px` | `22px` | `5px` |
| Sub-tab pill | `auto` (content) | `30px` | `7px` |
| Action bar buttons | `auto` (content) | `32px` | `8px` |
| Generate button | `180px` | `36px` | `10px` |
| Stepper `–/+` button | `24px` | `24px` | `6px` |
| History popover | `380px` | `max 340px` | `14px` |
| Degree picker popover | `fit-content` | `auto` | `12px` |
| Save name input | `220px` | `32px` | `8px` |

### 16.5 Typography Scale

| Use | Size | Weight | Color |
|---|---|---|---|
| Section labels | `10px` | semibold | `theme.textSecondary` (uppercase, letter-spacing 0.08em) |
| Chip degree label | `10px` | semibold | `white` |
| Chip note name | `17px` | bold | `white` |
| Chip quality | `9px` | normal | `rgba(255,255,255,0.55)` |
| Step card degree | `13px` | bold | `white` |
| Step card note name | `18px` | bold | `white` |
| Step number badge | `9px` | bold | `white` |
| Rec card name | `13px` | semibold | `theme.textPrimary` |
| Rec card rationale | `10px` | normal | `theme.textSecondary` |
| Mood badge | `10px` | semibold | `theme.accentPrimary` |
| History item name | `12px` | semibold | `theme.textPrimary` |
| History item meta | `10px` | normal | `theme.textSecondary` |
| AI prompt textarea | `13px` | normal | `theme.textPrimary` |
| Sentiment preset pill | `11px` | medium | `theme.textPrimary` |

### 16.6 Premium Visual Touches

These details elevate the panel from functional to visually premium:

1. **Step card gradient fill**: not flat color — `linear-gradient(160deg, ${color}dd, ${color}99)` gives depth
2. **Sequence lane scroll fade**: pseudo-element `::after` on the lane wrapper — a `linear-gradient` to transparent on the right edge (~32px) indicating more cards are scrollable
3. **Card entrance animation**: when a chip is clicked and a new step card is added, it enters with `opacity: 0 → 1` + `transform: scale(0.85) → scale(1)` over `150ms ease-out`
4. **Drag ghost glow**: during drag, the insertion ghost line has a subtle radial glow: `box-shadow: 0 0 8px 2px ${color}66`
5. **Palette chip press pulse**: on click, the chip briefly scales `1 → 1.08 → 1` in `80ms` — tactile feedback
6. **Recommendation card hover lift**: `transform: translateY(-2px)` + enhanced shadow — reinforces card selection affordance
7. **Generate button shimmer**: while generating, the button background animates with a moving shimmer gradient overlay (same `animate-shimmer` as used elsewhere in the app)
8. **History popover entrance**: slides down + fades in `transform: translateY(-6px) → 0` + `opacity: 0 → 1` in `160ms ease-out`
9. **Unsaved strip slide-in**: `max-height: 0 → 36px` + `opacity: 0 → 1` in `200ms ease-out`
10. **[Load to Builder] success flash**: button background briefly flashes to `#22c55e` (success green) for `400ms` before resetting

---

## 17. Animation & Motion Spec

All animations use CSS transitions on the DOM element directly (not Framer Motion) to keep bundle size minimal and match the existing app motion style.

| Element | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Step card enter | `opacity`, `transform` | `150ms` | `ease-out` | Added to sequence |
| Step card exit | `opacity`, `transform` | `120ms` | `ease-in` | Removed from sequence |
| Step card (non-dragged, during drag) | `transform` | `120ms` | `ease-out` | Drag hover-index change |
| Dragged step card | `opacity` | `0ms` | — | Drag start (instant) |
| Insertion ghost | `opacity` | `80ms` | `ease-out` | Hover-index change |
| Degree picker popover | `opacity`, `transform` | `120ms` | `ease-out` | Open/close |
| History popover | `opacity`, `transform` | `160ms` | `ease-out` | Open/close |
| Save strip slide-down | `max-height`, `opacity` | `200ms` | `ease-out` | Save dialog open |
| Unsaved warning strip | `max-height`, `opacity` | `200ms` | `ease-out` | isSaved change |
| Key change notice (AI) | `opacity` | `300ms` | `ease-in-out` | keyChangedSinceGeneration |
| Sentiment preset select | `background`, `border-color` | `120ms` | `ease` | Click |
| Load to Builder flash | `background` | `400ms` | `ease-out` | After load confirm |
| Palette chip press | `transform` (scale) | `80ms` | `ease-out` | mousedown / mouseup |
| Palette chip hover lift | `transform`, `box-shadow` | `120ms` | `ease-out` | hover enter/leave |
| Rec card hover lift | `transform`, `box-shadow` | `120ms` | `ease-out` | hover enter/leave |

**No animation runs on every render**. All transitions are triggered by state changes, not continuous loops — `animation` keyframes are only used for the generate button shimmer and progress bars.

---

## 18. Implementation Phases

### Phase 1 — Types + Tab Integration
**New files**: 2 | **Modified files**: 1 | **Estimate**: ~65 lines net

1. Create `lib/custom-progressions/types.ts` — `IntervalStep`, `IntervalProgression`, `AIIntervalProgressionRecommendation`
2. Update `app/page.tsx`:
   - Replace `showChordToneProgressions` boolean with `harmonizationTab` 3-value enum
   - Import `Sliders` from `lucide-react`
   - Update tab header array (2 → 3 entries)
   - Update tab body (2 `if` branches → 3)
   - Update `SongProgressionChordTonesTabs` `progressionsOpen` binding
3. Create `components/custom-progressions/CustomProgressionsTab.tsx` — shell only: sub-tab pill switcher renders, body is `null` placeholder

**Result**: "Custom Progressions" tab appears in UI, body is empty.

---

### Phase 2 — Manual Sequence Builder (no persistence)
**New files**: 5 | **Modified files**: 1 | **Estimate**: ~260 lines net

1. Create `hooks/custom-progressions/useIntervalSequenceDrag.ts`
2. Create `components/custom-progressions/DegreePaletteChip.tsx`
3. Create `components/custom-progressions/DegreePickerPopover.tsx`
4. Create `components/custom-progressions/IntervalStepCard.tsx` (drag + edit + remove)
5. Create `components/custom-progressions/IntervalSequenceBuilder.tsx` (palette + lane + action bar, no save/load yet)
6. Wire Builder into `CustomProgressionsTab` Builder sub-panel

**Result**: Full manual build + drag-reorder + edit + remove works. No persistence yet.

---

### Phase 3 — Supabase + Save/Load
**New files**: 4 (3 API routes + 1 Supabase migration) | **Modified files**: 2 | **Estimate**: ~200 lines net

1. Apply migration: `custom_interval_progressions` table + index + RLS policies
2. Create `app/api/custom-progressions/save/route.ts`
3. Create `app/api/custom-progressions/list/route.ts`
4. Create `app/api/custom-progressions/[id]/route.ts` (DELETE)
5. Create `components/custom-progressions/HistoryPopover.tsx`
6. Wire save dialog + history popover into `IntervalSequenceBuilder` and `CustomProgressionsTab`
7. Add React Query `useQuery` for history, `useMutation` for save/delete

**Result**: Full save + history popover + delete works. Progressions persist across sessions.

---

### Phase 4 — AI Generator
**New files**: 3 | **Modified files**: 1 | **Estimate**: ~300 lines net

1. Create `app/api/interval-progression/generate-recommendations/route.ts` (GPT-4o-mini)
2. Create `components/custom-progressions/IntervalProgressionRecommendations.tsx` (5-card grid)
3. Create `components/custom-progressions/AIIntervalProgressionGenerator.tsx` (full AI panel)
4. Wire AI sub-panel into `CustomProgressionsTab` AI sub-panel
5. Connect `onLoadToBuilder` → sequence lane population + sub-tab switch
6. Connect `onSave` (★ on card) → `/api/custom-progressions/save` with `source: 'ai'`
7. `localStorage` session cache for recommendations

**Result**: Full AI generation, 5 cards, Load to Builder, star-save from AI card all work.

---

### Phase 5 — Polish & Hardening
**New files**: 0 | **Modified files**: ~5 | **Estimate**: ~90 lines net

1. Key-change reactivity: `useEffect` updating sequence `rootNote` on key/scale change
2. Key-changed notice in AI panel (`keyChangedSinceGeneration` state)
3. Empty-key guard in both sub-panels
4. Unsaved work warning strip + undo toast for Clear All
5. Touch drag support in `useIntervalSequenceDrag`
6. All loading/error/empty states verified for all async paths
7. All motion spec animations implemented (entrance, exit, drag, hover)
8. Scroll-fade pseudo-element on sequence lane

**Result**: Feature-complete, production-ready, visually premium.

---

## Appendix: Key Design Decisions

| Decision | Rationale |
|---|---|
| 3-value enum replaces boolean for harmonization tab | Boolean cannot cleanly represent 3 states; `useSupabaseStorage` enum persists tab across sessions |
| `CustomProgressionsTab` is a self-contained island | Zero prop-drilling from `page.tsx` beyond 3 props; feature is orthogonal to all fretboard state; easy to test in isolation |
| `TRIAD_PALETTE` reused for all step/chip colors | Semantic color consistency — users familiar with the triad arc band immediately recognize degree colors |
| List-index drag (not timeline/pixel drag) | Interval steps are discrete ordered items, not positioned on a time axis; simpler hook, no snap grid, no width calculations |
| `useChordDragOptimized` as the drag pattern | Same mouse-event capture → global listener → ref-based position tracking → single state update on release pattern. Proven in production, no re-render on every pixel move |
| Step cards fixed `68×78px` | Degree labels (I–vii°) and note names are short strings; fixed size maintains visual grid rhythm; predictable midpoint calculation for insertion ghost |
| Edit via click (not double-click) | Drag handle is the only alternative action on a card; single click on body is unambiguous for edit intent. No tooltip delay needed |
| `DegreePickerPopover` as `position: fixed` | Escapes any `overflow: hidden` parent in the tab card; anchors correctly regardless of scroll position |
| AI generates degree strings only | Resolved to `IntervalStep` objects client-side using `computeDiatonicTriads` — keeps API payload small and key-agnostic; changing key after generation doesn't invalidate the progression concept |
| Key-change retains degree identity | User who built "I→IV→V" in C and switches to G gets "I→IV→V" in G automatically — the musical idea survives key transposition |
| localStorage cache for AI results | Zero API calls on mount; last session's results immediately visible; cleared on new generate |
| React Query lazy-loaded history | History only fetched when popover opens; 30s stale time prevents refetch on every open; `invalidateQueries` after save keeps list fresh |
| All API routes use admin Supabase client | Service role key never exposed to browser; `user_id` always extracted server-side from JWT; ownership verified before DELETE |
| History as popover (not page navigation) | User stays in context — progression tab and current builder state preserved; load replaces sequence in-place |
| Unsaved strip (not blocking modal) | Non-blocking — user can still click around; the strip is a reminder, not a gate; saves frustration while preventing data loss |
