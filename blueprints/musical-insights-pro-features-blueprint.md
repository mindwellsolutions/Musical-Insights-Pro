# Musical Insights Pro — Feature Development Blueprint

> **Purpose**: Complete GUI/UX and implementation specification for the three features below. Written for an AI agent to build each feature fully and functionally from this single file.

---

## Codebase Architecture Overview

| Layer | Key Files |
|-------|-----------|
| App root state | `app/page.tsx` (~4 222 lines) |
| Settings sidebar | `components/AudioSidebar.tsx` |
| Fretboard render | `components/Fretboard.tsx` (fixed 70 px fret cells) |
| Supabase persistence | `hooks/useSupabaseStorage.ts` + `lib/supabase/settings-service.ts` |
| MIDI types | `lib/midi/midiTypes.ts` |
| MIDI context | `components/midi/MIDIContext.tsx` |
| MIDI handlers | `hooks/useMIDIButtonHandlers.ts` |
| Compatible Scales | `components/audio/CompatibleScalesSection.tsx` |
| Triads display | `components/TabbedSettingsCard.tsx`, `components/scale-triads/TriadFocusSelector.tsx` |

### Supabase Storage Pattern
- Hook: `useSupabaseStorage<T>(localStorageKey, defaultValue)` → `[value, setter, displayOnlySetter]`
- Map new key→column in `KEY_TO_COLUMN_MAP` inside `hooks/useSupabaseStorage.ts`
- Add column to Supabase via MCP: `apply_migration` on project
- Add column to `UserSettings` interface & `DEFAULT_SETTINGS` in `lib/supabase/settings-service.ts`

### Theme Object Shape (ThemeConfig)
All UI uses `theme.bgSecondary`, `theme.bgTertiary`, `theme.border`, `theme.textPrimary`, `theme.textSecondary`, `theme.buttonPrimary`, `theme.accentPrimary`.

---

## Feature 1 — Per-User Fret Width Setting

### Goal
Each logged-in user can set fretboard fret cell width (20 %–100 %, default 50 %) saved to Supabase. Applies to **every** Fretboard instance on all pages.

### Database
- Migration: `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fret_width integer DEFAULT 50;`
- Column: `fret_width` INTEGER (stores 20–100 representing percentage)

### TypeScript
1. `lib/supabase/settings-service.ts`: add `fret_width: number` to `UserSettings` + `DEFAULT_SETTINGS` (value `50`).
2. `hooks/useSupabaseStorage.ts` `KEY_TO_COLUMN_MAP`: `'guitar-app-fret-width': 'fret_width'`.

### App State (`app/page.tsx`)
```ts
const [fretWidth, setFretWidth] = useSupabaseStorage('guitar-app-fret-width', 50);
```
Pass `fretWidth` prop to **every** `<Fretboard ... />` instance in the file.

### Fretboard Component (`components/Fretboard.tsx`)
1. Add `fretWidth?: number` (default `50`) to `FretboardProps`.
2. Inside the function, convert to pixel width:
   ```ts
   const fretWidthPx = Math.round(70 * (fretWidth / 50)); // 50% = 70px baseline
   ```
3. Replace every hardcoded `width: '70px'` and `minWidth: '70px'` for fret cells (NOT the nut cell which stays `40px`) with `width: `${fretWidthPx}px``.
4. The `translateX` transforms that are `35px` (half of 70) should become `${fretWidthPx / 2}px`.

### Settings UI (`components/AudioSidebar.tsx`)
- Add props `fretWidth?: number` and `onFretWidthChange?: (v: number) => void` to `AudioSidebarProps`.
- Render a labeled range slider in the **Fretboard Settings** section (after fret count input, before Invert button):
  ```
  Label: "Fret Width"   Value badge: "50%"
  Slider: min=20 max=100 step=5 value={fretWidth}
  ```
  Style matches existing sliders (gradient track, same color as `theme.buttonPrimary`).
- Wire in `page.tsx`: pass `fretWidth={fretWidth}` and `onFretWidthChange={setFretWidth}` to `<AudioSidebar>`.

---

## Feature 2 — Opacity Slider Reset-to-Default Buttons

### Goal
Every opacity/brightness slider gets a small **RotateCcw** (Lucide) icon button to the right that, when clicked, shows a compact **inline confirmation** (not a full modal — just a tiny popover or inline "Reset? [Yes] [No]" that disappears after 2 s or on confirm/cancel). On confirm, the slider resets to its default value.

### Opacity Sliders to Target (file:line)

| State var | Default | File | Rendered near |
|-----------|---------|------|---------------|
| `glowOpacity` | 40 | `page.tsx` passed to `AudioSidebar` | AudioSidebar glow opacity slider |
| `circleFretboardGlowOpacity` | 60 | `page.tsx` | AudioSidebar circle glow opacity |
| `sharedNoteRingOpacity` | 60 | `page.tsx` | Fretboard inline controls |
| `nonTriadOpacity` | 30 | `page.tsx` line ~3519 | Inline fretboard toolbar |
| `patternBgNotesOpacity` | 70 | `page.tsx` line ~3394 | Inline fretboard toolbar |
| `chordToneBgNotesOpacity` | 70 | `page.tsx` line ~3478 | Inline fretboard toolbar |
| `stringBrightness` | 100 | `page.tsx`→`AudioSidebar` | AudioSidebar brightness slider |
| `cagedBrightness` | 100 | `page.tsx` | TabbedSettingsCard |

### Reusable Reset Button Component
Create `components/shared/SliderResetButton.tsx`:
```tsx
// Props: onReset: () => void, theme: ThemeConfig
// Renders: RotateCcw icon (w-3.5 h-3.5), on click shows inline "Reset? ✓ ✗" for 3 s
// Inline confirm styled: small pill with Yes (green) / No (red) buttons
// No separate modal needed — keep it tight in the toolbar row
```

### Implementation Steps
1. Create the `SliderResetButton` component.
2. In `page.tsx`, for each inline slider (nonTriadOpacity, patternBgNotesOpacity, chordToneBgNotesOpacity, sharedNoteRingOpacity) place `<SliderResetButton onReset={() => setXxx(DEFAULT)} theme={theme} />` immediately after the `<span>` showing the current value.
3. In `AudioSidebar.tsx`, add reset props `onResetGlowOpacity`, `onResetCircleGlowOpacity`, `onResetStringBrightness` that call the parent's reset handlers. Place `SliderResetButton` after each value badge.

---

## Feature 3 — MIDI Pedal Section Selector System

### Goal
Any "controllable section" displayed on the page can be claimed as the active MIDI target. Only one section can be MIDI-active at a time (radio style). A compact **MIDI pedal icon toggle** button lives inside each compatible section's header/toolbar. When active, the section's items respond to pedal presses (item-left / item-right). Sections that aren't visible on screen cannot be selected.

### New MIDI Action Types (`lib/midi/midiTypes.ts`)
```ts
export type MIDIButtonAction =
  | 'prev' | 'next'               // legacy manual selection
  | 'scale-left' | 'scale-right' // legacy compatible scales
  | 'item-left' | 'item-right'   // navigate items within active section
  | 'section-left' | 'section-right' // future: cycle between sections
  | 'none';
```
Update `MIDI_ACTION_LABELS` accordingly.

### New Context: `contexts/MIDISelectionContext.tsx`
```ts
type MIDISectionId = 'compatible-scales' | 'triads' | 'manual-selection' | 'chord-neighborhood' | string;

interface MIDISelectionContextValue {
  activeSectionId: MIDISectionId | null;
  setActiveSectionId: (id: MIDISectionId | null) => void;
  registerSection: (id: MIDISectionId) => void;   // sections call this when mounted
  unregisterSection: (id: MIDISectionId) => void; // sections call this on unmount
  registeredSections: Set<MIDISectionId>;
}
```
- Implement with `useState` + `useCallback`.
- Wrap app root in `<MIDISelectionProvider>` inside `app/layout.tsx` (or `app/page.tsx` if layout doesn't exist).

### MIDI Pedal Icon Toggle UI (per section)
Create `components/midi/MIDISectionToggle.tsx`:
```tsx
interface Props {
  sectionId: MIDISectionId;
  theme: ThemeConfig;
  className?: string;
}
// Renders a small button with a MIDI pedal / foot-switch SVG icon (or use 🦶/⊞ from Lucide 'Footprints' or custom SVG)
// ACTIVE state: glowing accent color, pulsing ring animation
// INACTIVE state: muted gray, no ring
// On click: setActiveSectionId(sectionId) — if already active, deactivate (toggle off)
// Radio behavior enforced by context (setting a new one clears old automatically)
// Uses useEffect + registerSection/unregisterSection for visibility tracking
```

### Sections to Add Toggle To
| Component | Section ID | Prop/callback for left/right |
|-----------|-----------|------------------------------|
| `CompatibleScalesSection` | `compatible-scales` | already has `onMIDINavigateLeft/Right` |
| `TriadFocusSelector` | `triads` | add `onMIDILeft`/`onMIDIRight` props |
| `ManualSelectionList` | `manual-selection` | already has prev/next via `useMIDIButtonHandlers` |
| `TabbedSettingsCard` triad tabs | `triad-tabs` | add tab navigation callbacks |

### `useMIDIButtonHandlers.ts` Update
```ts
interface MIDIButtonHandlersCallbacks {
  onPrev?: () => void;
  onNext?: () => void;
  onScaleLeft?: () => void;
  onScaleRight?: () => void;
  onItemLeft?: () => void;   // NEW
  onItemRight?: () => void;  // NEW
}
```
- Read `activeSectionId` from `useMIDISelectionContext()`.
- When `item-left`/`item-right` fires, call the corresponding callback in the active section.
- Routing: maintain a `sectionCallbackRegistry: Map<MIDISectionId, { onLeft, onRight }>`. Each section registers its callbacks via a `useRegisterMIDICallbacks(sectionId, { onLeft, onRight })` hook.

### New Hook: `hooks/useRegisterMIDICallbacks.ts`
```ts
// Each section calls this hook with its sectionId and callbacks.
// The hook stores them in a shared ref (or context) so useMIDIButtonHandlers can route to them.
// Clean up on unmount.
```

### Default Button Mappings
When new MIDI buttons are detected, auto-suggest:
- Button 1 → `item-left`
- Button 2 → `item-right`
- Button 3 → `section-left`
- Button 4 → `section-right`

### MIDIConfigModal Update
- Add `item-left`, `item-right`, `section-left`, `section-right` to the action dropdown in `components/midi/MIDIConfigModal.tsx`.

### Visual Design of Section Toggle
- Size: 24×24 px button
- Icon: Use `Music2` or a custom SVG of a MIDI foot pedal (two rectangles representing pedal)
- Active: `background: theme.accentPrimary`, `boxShadow: '0 0 8px ${theme.accentPrimary}'`, subtle CSS pulse animation
- Inactive: `background: theme.bgSecondary`, `border: 1px solid ${theme.border}`, low opacity icon
- Tooltip: "MIDI Active: {sectionName}" or "Click to control with MIDI pedal"
- Placement: right-aligned in section header bar, before any collapse toggle

---

## Build Order

1. **Feature 1**: DB migration → TypeScript types → `useSupabaseStorage` map → `Fretboard.tsx` → `AudioSidebar.tsx` → `page.tsx`
2. **Feature 2**: `SliderResetButton.tsx` → inline sliders in `page.tsx` → AudioSidebar sliders
3. **Feature 3**: `MIDISelectionContext.tsx` → `MIDISectionToggle.tsx` → `useRegisterMIDICallbacks.ts` → update `useMIDIButtonHandlers.ts` → update `midiTypes.ts` → add toggles to each section → update `MIDIConfigModal.tsx`

---

*Blueprint generated 2026-07-16. Repo: mindwellsolutions/Musical-Insights-Pro*
