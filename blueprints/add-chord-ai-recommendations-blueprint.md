# Add Chord — AI Smart Modal & Compatibility Score Redesign

## Overview
Upgrade the Add Chord flow in `/chord-progression-builder` to be context-aware. When no chords exist, the modal drives users to generate a full progression or pick from the library. When chords exist, the modal surfaces AI-recommended next/completion chords based on the current timeline, scales, and user vibe descriptors. Also redesign the CompatibilityScore bar into a premium panel.

---

## 1. User Experience Flows

### 1A. Empty Timeline (0 chords)
Modal opens in **"Start Your Progression"** mode:
- **Left panel** — Chord Library (category tabs + grid, pick a single chord to start)
- **Right panel** — AI Full Progression Generator:
  - Vibe/genre/feeling text area
  - Complexity slider (1–10)
  - Length selector (4/6/8 chords)
  - "✨ Generate Full Progression" CTA → calls `/api/chord-progression/generate-recommendations`
  - Results shown as clickable cards; selecting one loads all chords into timeline
- Header label: "Start Your Progression"

### 1B. Has Chords (1+ in timeline)
Modal opens in **"Add Next Chord"** mode with two tabs:

#### Tab: AI Recommend
- Current progression context strip (read-only chips)
- Vibe/genre/feeling text area (optional)
- "🎯 Best Next Chord" hero card — large, prominent, color-coded by chord root; click = adds it
- "Alternatives" grid — up to 6 cards with + add button each
- "Complete My Progression" section — AI-proposed continuation (sequence of 2–4 chords), "Add All" button
- "Generate New Full Progression" secondary button
- Auto-fetches on open; "Refresh" button re-fetches with updated descriptors

#### Tab: Chord Library
- Same category + grid layout as today (unchanged)

---

## 2. New API Route

### `POST /api/chord-progression/recommend-next-chord`
**Request:**
```json
{
  "currentKey": "C",
  "currentProgression": [
    { "chordSymbol": "C", "duration": 4, "startTime": 0 },
    { "chordSymbol": "Am", "duration": 4, "startTime": 4 }
  ],
  "currentScaleModes": [
    { "scaleName": "Ionian", "rootNote": "C", "startTime": 0, "duration": 8 }
  ],
  "userDescriptors": "melancholic jazz",
  "mode": "next"
}
```
**Response:**
```json
{
  "topRecommendation": { "chordSymbol": "F", "confidence": 92, "rationale": "...", "role": "Subdominant" },
  "alternatives": [
    { "chordSymbol": "Fmaj7", "confidence": 87, "rationale": "...", "role": "Subdominant with color" },
    { "chordSymbol": "Dm7", "confidence": 80, "rationale": "...", "role": "Relative minor" }
  ],
  "fullCompletion": ["F", "G"],
  "fullCompletionRationale": "Classic I–vi–IV–V resolution..."
}
```
Uses `gpt-4o-mini`, `response_format: json_object`, `max_tokens: 500`.
Single call returns all three result types to avoid redundant API hits.

---

## 3. Component Changes

### `AddChordModal.tsx` — Full Redesign
**New props:**
```ts
currentProgression: ChordInstance[]   // passed from builder
currentScaleModes: ScaleModeInstance[] // passed from builder
```
**Behavior:**
- Derives `hasChords = currentProgression.length > 0`
- If `hasChords`: fetches `recommend-next-chord` once on open
- If editing an existing chord: shows chord library tab only (no AI)
- Tabs only shown when `hasChords && !editingChord`
- Premium dark glassmorphism design with gradient accents

### `CompatibilityScore.tsx` — Premium Panel
Replace single-row bar with a richer two-row card:
- Row 1: score badge (circle) + rationale headline
- Row 2: 💡 tip text + "✨ Recommendations" button
- Better spacing, rounded card, subtle gradient border

### `ChordProgressionBuilder.tsx`
Pass `currentProgression` and `currentScaleModes` into `AddChordModal`.

---

## 4. Files Modified / Created
| File | Action |
|------|--------|
| `blueprints/add-chord-ai-recommendations-blueprint.md` | CREATE (this file) |
| `app/api/chord-progression/recommend-next-chord/route.ts` | CREATE |
| `components/chord-progression/AddChordModal.tsx` | REWRITE |
| `components/chord-progression/CompatibilityScore.tsx` | REDESIGN |
| `components/chord-progression/ChordProgressionBuilder.tsx` | UPDATE props |

---

## 5. Performance & Design Principles
- Single API call returns `topRecommendation + alternatives + fullCompletion` — no redundant hits
- `AbortController` cleans up in-flight request on modal close
- All chord library data is local (no API) — instant
- No polling; AI call is on-demand (open modal / click Refresh)
- Color coding uses existing `getChordColor()` for visual consistency
- Modal is `max-w-4xl`, height `700px`, dark glassmorphism aesthetic
