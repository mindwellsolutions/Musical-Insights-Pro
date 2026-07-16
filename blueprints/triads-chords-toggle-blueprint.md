# Triads ↔ Chords Toggle — Play Song Tab
## GUI/UX & Dev Blueprint

---

## Overview
The Play Song tab's 1st fretboard currently shows **Triad** positions for each chord block in the timeline. This feature adds a **Triads ↔ Chords** display-mode toggle so users can switch to **Chord Voicing** mode that shows the specific voicings defined by the user per chord block. A companion **Voicing Outlines** toggle draws rounded SVG rectangles around each chord's fret cluster, so users clearly see which notes belong to which chord.

---

## 1. Toggle Controls Layout (TriadFretboard header row)

```
[ ← ] [ → ]  [ Triads ◄ ●──── ► Chords ]  [ ⊙ Outlines ]  [ 🔍 Show All Positions ──● ]
```

### 1a. Triads ↔ Chords Toggle
- **Left label**: "Triads" (always visible, dimmed when inactive)
- **Center**: standard pill toggle switch (green = Chords on)
- **Right label**: "Chords" (always visible, dimmed when inactive)
- Contained in same styled pill container as Show All Positions
- State: `displayMode: 'triads' | 'chords'` (default: `'triads'`)

### 1b. Voicing Outlines Toggle
- Icon: `Layers` (Lucide) — circling/stacking-items visual
- Pill toggle switch to the right of the icon
- Only meaningful in Chords mode (visible in both, grayed in Triads mode)
- State: `showVoicingOutlines: boolean` (default: `false`)
- Tooltip: "Draw outlines around chord voicing positions"

---

## 2. Chords Display Mode — Fretboard Behavior

When `displayMode === 'chords'`:

### Note Positions Source
For each chord in the timeline (`allChords`):
1. Check `customVoicings.get(chord.id)` for user-defined voicing
2. Fallback: call `calculateChordVoicings(chord.notes, chord.rootNote, tuning, 24)[0]`
3. Convert `ChordVoicing.positions` → `NotePosition[]` with chord-specific color from `NOTE_COLORS[chord.rootNote]`

### Show All vs. Single Position
- **Show All off**: show only the voicing for the currently selected chord (index `selectedChordIndex`)
- **Show All on**: show voicings for all visible chords simultaneously (filtered by `visibleChordIds`)

### Visual Differentiation
- Each chord's notes share the chord's root-note color (from `NOTE_COLORS`)
- Multi-chord shared positions use `sharedChordColors` array (existing ring system)

---

## 3. Voicing Outlines Feature

When `showVoicingOutlines === true` AND `displayMode === 'chords'`:

### Data Flow
`TriadFretboard` computes `voicingOutlineGroups: VoicingOutlineGroup[]`:
```ts
interface VoicingOutlineGroup {
  color: string;   // chord root note color
  label: string;   // chord symbol e.g. "Cmaj7"
  positions: { stringIndex: number; fretIndex: number }[];
}
```

### SVG Overlay in Fretboard
`Fretboard` accepts `voicingOutlineGroups` prop and renders an absolute-positioned `<svg>` overlay using grid math:
- **Note center X**: `leftPad(60) + (fret===0 ? 20 : 40 + (fret-1)*70 + 35)`
- **Note center Y**: `topPad(40) + displayStringIndex * 56 + 22`
- Bounding box: `(minX-20, minY-20)` to `(maxX+20, maxY+20)` → `<rect rx="10" ry="10">`
- Stroke: chord color, fill: chord color @ 8% opacity, strokeWidth: 2
- Label text: chord symbol above the rect

---

## 4. Sidebar Hover Preview (Nearby Chord Diagrams)

When user hovers over a Triad or Chord card in the right sidebar:
- `SongChordDiagramSidebar` calls `onHoverVoicing(voicing, chord)` on `mouseenter`
- Calls `onHoverVoicing(null, null)` on `mouseleave`
- `PlaySongPanel` stores `hoveredSidebarVoicing` state, passes to `DualFretboardDisplay` → `TriadFretboard`
- `TriadFretboard`: when `hoveredSidebarVoicing` is set, override `notePositions` to display ONLY those notes on the 1st fretboard, highlighted in white/bright color
- On mouse leave, restore normal notePositions

---

## 5. File Change Summary

| File | Change |
|------|--------|
| `TriadFretboard.tsx` | Add `displayMode`, `showVoicingOutlines` state; chord mode positions; toggle UI; hover override |
| `Fretboard.tsx` | Add `voicingOutlineGroups` prop; SVG overlay rendering |
| `SongChordDiagramSidebar.tsx` | Add `onHoverVoicing` prop; mouseenter/mouseleave on cards |
| `PlaySongPanel.tsx` | Add `hoveredSidebarVoicing` state; pass to DualFretboardDisplay |
| `DualFretboardDisplay.tsx` | Pass `hoveredSidebarVoicing` through to TriadFretboard |
| `Header.tsx` | Hide Focus Mode button |
