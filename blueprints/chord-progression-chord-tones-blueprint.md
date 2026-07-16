# Chord Progression Builder — Chord Tones Display Blueprint

## Overview
Two tasks implemented together in the `/chord-progression-builder` page:
1. **Bug Fix** — `+ Add Chord` / `+ Add Scale/Mode` buttons unclickable on empty timelines
2. **Chord Tones in Blocks** — Display interval-colored chord-tone badges inside each chord block

---

## PHASE 1 — Bug Fix: Empty Timeline Button Clickability

### Root Cause
In both `ChordProgressionTrack.tsx` and `ScaleModeTrack.tsx`, an empty-state `<div>` rendered **after** the Add button in JSX with `absolute inset-0` covers the entire track, intercepting all pointer events before they reach the button.

### Fix
Add `pointer-events-none` to the empty-state `<div>` in both files so clicks pass through to the underlying button.

**Files:** `components/chord-progression/ChordProgressionTrack.tsx` and `ScaleModeTrack.tsx`

```diff
- <div className="absolute inset-0 flex items-center justify-center text-[#666666]">
+ <div className="absolute inset-0 flex items-center justify-center text-[#666666] pointer-events-none">
```

---

## PHASE 2 — Chord Tones Computation Utility

### New File: `lib/chord-progression/chord-tones-utils.ts`

Pure synchronous TypeScript module. No external fetching. No React hooks.

**Exports:**
```typescript
interface ChordToneDisplay {
  note: string;           // Sharp-notation note name (e.g., "D#", "A")
  semitone: number;       // Semitone from root 0–11 (octave-normalized)
  fullSemitone: number;   // Full semitone incl. extensions (e.g. 14 for 9th)
  intervalLabel: string;  // Short label: "R", "3", "b3", "5", "b7", "9", etc.
  noteColor: string;      // NOTE_COLORS[note] — badge background
  intervalColor: string;  // ALL_INTERVAL_COLORS[semitone] — badge border/glow
}

function computeChordTones(chordSymbol: string): ChordToneDisplay[]
```

**Parsing Logic:**
1. Extract root note (letter + optional `#` or `b` accidental)
2. Extract quality suffix (everything after root)
3. Look up interval pattern from `CHORD_QUALITY_INTERVALS` table
4. Transpose intervals to actual notes using chromatic scale
5. Map note → `NOTE_COLORS`, semitone → `ALL_INTERVAL_COLORS`

**Chord Types Covered (all categories in chord-library.ts):**
| Category | Examples |
|----------|---------|
| Triads | `major`, `m`, `dim`, `aug` |
| 7th Chords | `7`, `maj7`, `m7`, `dim7`, `m7b5` |
| Extended | `9`, `maj9`, `m9`, `11`, `maj11`, `m11`, `13`, `maj13`, `m13` |
| Altered | `7b5`, `7#5`, `7b9`, `7#9`, `7#11`, `7alt` |
| Sus | `sus2`, `sus4`, `7sus4` |
| Add | `add9`, `add11`, `madd9` |

**Note Index Map:** Handles both sharp (`C#`, `D#`) and flat (`Db`, `Eb`, `Bb`) root notes.

---

## PHASE 3 — ChordCard Chord Tones Display

### Modified File: `components/chord-progression/ChordCard.tsx`

**Height:** `70px` → `90px`

**New Layout (absolute positioning within 90px card):**
- Drag handle: `top-[6px]` center
- Edit/Delete buttons: `top-[6px] right-[6px]` (hover only, z-20)
- Chord name: `absolute inset-x-0 top-[10px] bottom-[26px] flex items-center justify-center`
- **Chord Tone Badges row:** `absolute bottom-[5px] inset-x-[4px] flex justify-center gap-[3px] overflow-hidden pointer-events-none`
- Resize buttons: `bottom-[5px]` (hover only, z-20, overlaps badges intentionally)

**Badge Styling (matching homepage Chord Tones card):**
```tsx
<div
  className="rounded text-[9px] font-bold leading-none shrink-0 text-white"
  style={{
    backgroundColor: tone.noteColor,
    border: `1px solid ${tone.intervalColor}80`,
    boxShadow: `0 0 5px ${tone.intervalColor}60`,
    padding: '2px 5px',
  }}
>
  {tone.note}
</div>
```

**Responsive Badge Count:**
- Width < 64px: Show 0 badges (too narrow)
- Width 64–100px: Show up to 2 badges (root + one characteristic tone)
- Width 100–160px: Show up to 3 badges
- Width 160px+: Show all chord tones (capped at chord's actual note count)

---

## PHASE 4 — ScaleModeCard Height Equalization

**Modified File:** `components/chord-progression/ScaleModeCard.tsx`

Height: `70px` → `90px` — matching ChordCard for visual track consistency.
No chord tone badges on scale blocks (scale modes show name + compatibility score).
Internal layout adjustments to keep content centered in the taller card.

---

## PHASE 5 — Track & Sidebar Height Synchronization

All height references updated together to avoid visual misalignment:

| File | Change |
|------|--------|
| `ChordProgressionTrack.tsx` | Track height `90` → `112` (card 90px + 11px padding each side) |
| `ScaleModeTrack.tsx` | Track height `90` → `112` |
| `TrackSidebar.tsx` | Track row `h-[90px]` → `h-[112px]` |
| `TimelineVisualization.tsx` | PlaybackCursor `height={228}` → `height={272}` (48 ruler + 112 + 112) |

---

## Design Reference — Homepage Chord Tones Color System

Source: `lib/musicTheory.ts`

```typescript
// Badge background: NOTE_COLORS[note]
NOTE_COLORS = { 'C': '#ef4444', 'C#': '#f97316', 'D': '#f59e0b', ... }

// Badge border/glow: ALL_INTERVAL_COLORS[semitone % 12]
ALL_INTERVAL_COLORS = {
  0: '#E85555',  // Root      — Red
  3: '#86EFAC',  // b3        — Light Green
  4: '#F5BC3C',  // 3rd       — Yellow/Gold
  7: '#5DB572',  // 5th       — Green
  10: '#FB923C', // b7        — Amber-Orange
  11: '#A07ED4', // 7th       — Lavender
}
```

---

## Performance Notes
- `computeChordTones` is a pure function with O(1) lookup — zero async, zero side effects
- ChordCard calls it once per render (memoized via `useMemo` keyed on `chord.chordSymbol`)
- No new API calls, no database fetches, no additional state

---

## Files Modified/Created Summary

| Action | File |
|--------|------|
| CREATE | `blueprints/chord-progression-chord-tones-blueprint.md` (this file) |
| CREATE | `lib/chord-progression/chord-tones-utils.ts` |
| MODIFY | `components/chord-progression/ChordProgressionTrack.tsx` |
| MODIFY | `components/chord-progression/ScaleModeTrack.tsx` |
| MODIFY | `components/chord-progression/ChordCard.tsx` |
| MODIFY | `components/chord-progression/ScaleModeCard.tsx` |
| MODIFY | `components/chord-progression/TrackSidebar.tsx` |
| MODIFY | `components/chord-progression/TimelineVisualization.tsx` |
