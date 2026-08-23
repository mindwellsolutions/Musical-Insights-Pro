# MIDI Section Control System — Blueprint

## Overview

Musical Insights Pro uses a **two-level MIDI control model**:

1. **Enabled Sections** — user toggles a MIDI icon ON/OFF per section; persisted to `localStorage`.
2. **Active Section** — the single section currently receiving Switch Left/Right commands; cycles only through enabled sections via Next/Last Section pedal buttons.

---

## Pedal Button Action Mapping

| Pedal Action | Label | Behavior |
|---|---|---|
| `prev` | **Next Section** | Advance to next enabled section (wraps) |
| `next` | **Last Section** | Go back to previous enabled section (wraps) |
| `scale-left` / `item-left` | **Switch Left** | Move left within active section's options |
| `scale-right` / `item-right` | **Switch Right** | Move right within active section's options |

---

## Architecture

### Context: `contexts/MIDISelectionContext.tsx`

```ts
enabledSectionIds: Set<MIDISectionId>   // which sections are in the cycle pool
activeSectionId: MIDISectionId | null   // currently focused section
toggleEnabled(id)                        // toggle on/off
nextSection() / prevSection()            // cycle through enabled sections
registerCallbacks(id, { onLeft, onRight }) // section registers its nav callbacks
dispatchItemNav('left'|'right')          // fire onLeft/onRight for active section
sectionProfiles: MIDISectionProfile[]    // saved named profiles
saveProfile(name) / loadProfile(id) / deleteProfile(id)
```

### Component: `components/midi/MIDISectionToggle.tsx`

Props: `{ sectionId, label, onLeft, onRight, theme, className? }`

Three visual states:
- **disabled** (MIDI not connected) — dim, no interaction
- **enabled** (in cycle pool, not active) — bright white icon, subtle border
- **focused** (active section) — accent glow + pulse animation

On mount: calls `registerSectionOrder(sectionId)` and `registerCallbacks(sectionId, { onLeft, onRight })`.
On click: calls `toggleEnabled(sectionId)`.

### Hook: `hooks/useMIDIButtonHandlers.ts`

Routes MIDI button presses to context methods:
- `prev` → `nextSection()`
- `next` → `prevSection()`  
- `scale-left` / `item-left` → `dispatchItemNav('left')`
- `scale-right` / `item-right` → `dispatchItemNav('right')`

---

## Section IDs and Placements

| Section | sectionId | File | onLeft | onRight |
|---|---|---|---|---|
| Select Key | `key-select` | `Header.tsx` | prev key | next key |
| Scale/Mode | `scale-mode-select` | `Header.tsx` | prev scale | next scale |
| Compatible Scales & Modes | `compatible-scales` | `CompatibleScalesSection.tsx` | `navigateLeft()` | `navigateRight()` |
| Progression Degrees (I–VII) | `progression-degrees` | `app/page.tsx` | `handleFocusPrevious()` | `handleFocusNext()` |
| Chord Neighborhood | `chord-neighborhood` | `app/page.tsx` | prev nearby chord | next nearby chord |

---

## GUI/UX Design Rules

1. **Toggle icon size**: 24×24px button with 13px pedal icon SVG — compact, non-distracting.
2. **Placement**: Always at the **right end of the section header row**, after the section title or controls.
3. **States**:
   - OFF / MIDI disconnected: `opacity: 0.35`, gray icon
   - ON (enabled, not active): bright `#e2e8f0` icon, subtle border `rgba(255,255,255,0.08)`
   - FOCUSED (active): accent color glow + `midi-toggle-pulse` animation
4. **Tooltip**: Contextual title text explaining current state.
5. **Page isolation**: `nextSection()` / `prevSection()` only cycle through sections registered on the **current page** (sections unmount when leaving the page, automatically unregistering).

---

## Profile Management UI

Located in: `components/midi/MIDIConfigModal.tsx` (or a new `MIDISectionProfileModal.tsx`)

### Save Modal
- Text input for profile name
- "Save" button → calls `saveProfile(name)`

### Load Modal  
- List of saved profiles showing name + creation date
- "Load" button per profile → calls `loadProfile(id)`
- "Delete" button per profile → calls `deleteProfile(id)`

Profiles stored in `localStorage` under key `midi-section-profiles`.

---

## Implementation Checklist

- [x] `MIDISelectionContext` — full context with enabled/active tracking + profile management
- [x] `MIDISectionToggle` component — all three visual states
- [x] `useMIDIButtonHandlers` — routes prev/next to section cycling, scale-left/right to item nav
- [x] `CompatibleScalesSection` — toggle already placed with `navigateLeft`/`navigateRight`
- [ ] `Header.tsx` — add toggles for Key and Scale/Mode; wire key-cycle and scale-cycle callbacks
- [ ] `app/page.tsx` — add toggle for Progression Degrees (both TriadFocusSelector instances)
- [ ] `app/page.tsx` — add toggle for Chord Neighborhood
- [ ] Profile save/load UI — modal or panel in MIDI settings
