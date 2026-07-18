# Target Notes System — Full GUI/UX & Development Blueprint

**For:** Musical Insights Pro  
**Scope:** Target Notes panel (fretboard page), AI-generated target note recommendations (page + AI Assistant sidebar)  
**Model:** Sonnet 4.6 implementation guide  
**Date:** 2026-07-18

---

## 0. WHAT THIS SYSTEM DOES (Plain English)

Users can define a feeling, mood, emotion, scene, or soundscape (e.g. "tense cinematic darkness", "warm jazz evening", "hopeful sunrise") and receive **5 AI-generated sets of target notes** — each set is a curated subset of notes from the currently displayed key/scale that best evokes that feeling. The user can:

1. **Browse AI recommendation cards** — each card shows the note set, music-theory rationale, and a "Load" button
2. **Load a set** — the selected notes appear as foreground notes on the fretboard (just like triads in scale mode), with all other scale notes dimmed in the background
3. **Manually pick their own target notes** — a modern note-picker UI lets them toggle individual scale notes as targets
4. **Use target notes from the AI Assistant sidebar** — the chat window renders target-note recommendation cards with the same "Load" action

The system introduces one new top-level state concept: **`targetNoteHighlight`** — a nullable `{ notes: string[], label: string, color: string }` object. When set, the Fretboard renders those notes as foreground and all other scale notes as dimmed background, reusing the existing `selectedChordNotes` + `patternBgNotesOpacity` pipeline.

---

## 1. DATA TYPES

### 1a. New Types — `lib/target-notes/types.ts` (NEW FILE)

```typescript
export interface TargetNoteSet {
  id: string;                    // e.g. "ai-rec-0"
  label: string;                 // e.g. "Lydian Shimmer" 
  notes: string[];               // subset of current scale notes, e.g. ["C", "E", "B"]
  rationale: string;             // 2-4 sentence music theory explanation
  moodKeywords: string[];        // e.g. ["ethereal", "floating", "cinematic"]
  theoryBasis: string;           // e.g. "Scale degrees 1, 3, 7 — the tonic triad + leading tone"
  color: string;                 // accent color for the card, e.g. "#7F77DD"
  source: 'ai' | 'manual';
}

// Slim version returned by AI (tokens minimized), enriched client-side
export interface TargetNoteSetSlim {
  label: string;
  notes: string[];               // note names only, must be valid scale notes
  rationale: string;
  moodKeywords: string[];
  theoryBasis: string;
}

// AI assistant message attachment
export interface AITargetNoteRecommendation extends TargetNoteSetSlim {
  id: string;
}

// State shape for the active target note highlight
export interface TargetNoteHighlight {
  notes: string[];
  label: string;
  color: string;
  source: 'ai' | 'manual';
}
```

### 1b. Extend `lib/ai-assistant/types.ts`

Add to `AIAssistantResponse`:
```typescript
targetNoteRecommendations?: AITargetNoteRecommendation[];
```

Add to `ChatMessage`:
```typescript
targetNoteRecommendations?: AITargetNoteRecommendation[];
```

---

## 2. NEW STATE IN `app/page.tsx`

Add near the Triads in Scale state block (after line ~154):

```typescript
// ── Target Note Highlight ──────────────────────────────────────────────────
const [targetNoteHighlight, setTargetNoteHighlight] = useState<TargetNoteHighlight | null>(null);
const [targetNoteBgOpacity, setTargetNoteBgOpacity] = useLocalStorage('guitar-app-target-note-bg-opacity', 25);
// ───────────────────────────────────────────────────────────────────────────
```

### 2a. Update Fretboard `selectedChordNotes` priority chain

Current chain (line ~3951 of page.tsx):
```typescript
selectedChordNotes={customHighlightNotes ?? patternHighlightNotes ?? zoneHighlightedChordNotes ?? activeChordNotes}
```

New chain — insert `targetNoteHighlight?.notes` at highest priority:
```typescript
selectedChordNotes={
  targetNoteHighlight?.notes ??
  customHighlightNotes ??
  patternHighlightNotes ??
  zoneHighlightedChordNotes ??
  activeChordNotes
}
```

### 2b. Pass `patternBgNotesOpacity` for target note mode

Wherever `patternBgNotesOpacity` is calculated for the main Fretboard (line ~3972), add a branch:
```typescript
patternBgNotesOpacity={
  targetNoteHighlight ? targetNoteBgOpacity :
  patternHighlightNotes && !showTriadArcBands ? patternBgNotesOpacity :
  // ... rest of existing logic
  100
}
```

---

## 3. API ROUTE — `app/api/target-notes/generate/route.ts` (NEW FILE)

**Method:** POST  
**Auth:** Same bearer-token pattern as other routes  
**Rate limit:** Mirror the chord progression route (per-IP)

### Request Body:
```typescript
interface GenerateTargetNotesRequest {
  currentKey: string;           // e.g. "C"
  currentScale: string;         // e.g. "Dorian"
  scaleNotes: string[];         // computed client-side, e.g. ["C","D","Eb","F","G","A","Bb"]
  userPrompt: string;           // mood/feeling description
  userSkillLevel?: string;      // 'beginner' | 'intermediate' | 'advanced'
}
```

### System Prompt (exact text for route.ts):
```
You are an expert music theory assistant specializing in fretboard visualization and note selection for guitarists.

The user has a guitar fretboard displaying the ${currentKey} ${currentScale} scale.
Scale notes available: ${scaleNotes.join(', ')}

The user wants to highlight specific "target notes" on their fretboard to express a particular mood or feeling.
Your job: recommend 5 distinct groupings of 2–5 notes from ONLY the available scale notes above.
Each grouping should evoke the user's requested mood through specific music theory reasoning.

RULES:
- Every note you recommend MUST appear in the scale notes list above. No exceptions.
- Each set must be meaningfully different from the others (different degrees, different intervals).
- Note names must match exactly as given in the scale notes list.
- Vary the number of notes per set (some 2-note sets, some 3-note, some 4-note).
- Think in terms of: intervals, scale degrees, tension/resolution, color tones, characteristic tones.

Return ONLY a valid JSON array of exactly 5 objects. No markdown, no explanation outside the JSON.
Each object: { "label": string, "notes": string[], "rationale": string, "moodKeywords": string[], "theoryBasis": string }
- label: short evocative name (2-4 words)
- notes: array of note names from the scale
- rationale: 2-3 sentences explaining why this set evokes the mood
- moodKeywords: 3-5 single words describing the emotional quality
- theoryBasis: one sentence naming the exact scale degrees/intervals used
```

### Response shape:
```typescript
{
  recommendations: TargetNoteSetSlim[],    // 5 items
  currentKey: string,
  currentScale: string,
  scaleNotes: string[]
}
```

### Implementation notes:
- Model: `gpt-4o-mini`, temperature: 0.85, max_tokens: 1500
- Parse JSON same way as chord progression route (handle markdown code blocks)
- Validate each returned note is in `scaleNotes` — filter out invalid notes silently
- Assign `id` and `color` from a palette (CARD_COLORS array of 5 colors) client-side after receiving

---

## 4. TARGET NOTES PANEL — `components/target-notes/TargetNotesPanel.tsx` (NEW FILE)

This panel lives on the main fretboard page, in the same controls area as "Triads in Scale". It has two sections: **AI Generator** (top) and **Manual Picker** (bottom).

### 4a. Panel Location in `app/page.tsx`

Insert the `<TargetNotesPanel>` component inside the existing right-side controls area, near the Triads in Scale block. Conditionally render it only when `rootNote && scaleName` are set (same guard as Triads in Scale). Pass:

```tsx
<TargetNotesPanel
  currentKey={manualKey || rootNote}
  currentScale={manualScaleName || scaleName}
  scaleNotes={getScaleNotes(manualKey || rootNote, manualScaleName || scaleName)}
  activeHighlight={targetNoteHighlight}
  onLoadHighlight={(highlight) => {
    setTargetNoteHighlight(highlight);
    // Clear conflicting modes
    setShowTriadArcBands(false);
    setTriadFocusOn(false);
  }}
  onClearHighlight={() => setTargetNoteHighlight(null)}
  bgOpacity={targetNoteBgOpacity}
  onBgOpacityChange={setTargetNoteBgOpacity}
  theme={theme}
/>
```

### 4b. Panel Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Target Notes                              [Clear] [▼/▲] │
├─────────────────────────────────────────────────────────────┤
│  AI GENERATOR                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  "What mood or feeling do you want to express?"        │ │
│  │  [textarea, 2 rows, placeholder: "dark cinematic..."]  │ │
│  │                              [Generate Recommendations] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  [Loading spinner or 5 recommendation cards carousel]       │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ...  │
│  │ card 1   │ │ card 2   │ │ card 3   │ │ card 4   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  ──────────────────────────────────────────────────         │
│  MANUAL TARGET NOTES (C Dorian)                            │
│  [C] [D] [Eb] [F] [G] [A] [Bb]  ← toggle buttons          │
│  Selected: C, G, Bb              [Reset]                    │
│                                  [Load to Fretboard]        │
│                                                             │
│  Background opacity: ──●──── 25%                           │
└─────────────────────────────────────────────────────────────┘
```

### 4c. Recommendation Card Design — `components/target-notes/TargetNoteCard.tsx`

Each card (displayed in a horizontal scrollable strip):

```
┌─────────────────────────────────────────────────────┐
│  ● ● ● ●  (colored accent bar at top, card.color)   │
│                                                     │
│  "Lydian Shimmer"                    [Load ▶]       │
│                                                     │
│  Notes:  [C] [E] [B]   ← pill badges, note colors   │
│                                                     │
│  "The major 7th creates a floating, unresolved      │
│   tension ideal for cinematic scenes. Combined      │
│   with the tonic and major 3rd..."                  │
│                                                     │
│  Theory: Scale degrees 1, 3, 7                      │
│  Tags: #ethereal #floating #cinematic               │
└─────────────────────────────────────────────────────┘
```

**Card states:**
- Default: dark card with colored top bar
- Active/loaded: glowing border matching card color, "Active ✓" replacing "Load ▶"
- Hover: slight lift (`translateY(-2px)`) + increased glow

**Card colors palette** (5 fixed colors, cycled by index):
```typescript
const CARD_COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#D4537E', '#4FB3C4'];
```

### 4d. Manual Note Picker Design

Scale note buttons displayed inline, styled like the CAGED shape toggles:

```
Scale: C Dorian  →  [C] [D] [Eb] [F] [G] [A] [Bb]
```

- Each button: `width: 38px, height: 38px`, circular, colored with `NOTE_COLORS[note]` when selected, `theme.bgTertiary` when unselected
- Selected state: glowing ring matching `NOTE_COLORS[note]`, full opacity
- Unselected: 40% opacity, no ring
- Below the buttons: selected note list as small pills
- "Load to Fretboard" button (gold, disabled if 0 notes selected)
- "Reset" button (clears selection)

---

## 5. AI ASSISTANT — TARGET NOTE RECOMMENDATION CARDS

### 5a. Update `lib/ai-assistant/types.ts`

Already specified in Section 1b. Add `targetNoteRecommendations?: AITargetNoteRecommendation[]` to `AIAssistantResponse` and `ChatMessage`.

### 5b. Update AI Assistant system prompt in `lib/ai-assistant/openai-service.ts`

In the system prompt that defines what JSON the AI returns, add a `targetNoteRecommendations` array:

```
When the user asks about target notes, note emphasis, note selection for a mood/feeling, or soundscape:
Include a "targetNoteRecommendations" array in your JSON response with 3-5 items.
Each item: { "id": "tn-0", "label": string, "notes": string[], "rationale": string, "moodKeywords": string[], "theoryBasis": string }
Notes MUST only come from the current scale: ${currentScale} in key of ${currentKey}.
Current scale notes: [computed from context]
```

### 5c. Parse target note recommendations in `lib/ai-assistant/openai-service.ts`

In the response parsing function (where `scaleRecommendations` and `progressionRecommendations` are extracted), add:
```typescript
const targetNoteRecommendations = parsed.targetNoteRecommendations 
  ? validateTargetNoteRecs(parsed.targetNoteRecommendations, scaleNotes)
  : [];
```

Add `validateTargetNoteRecs(recs, scaleNotes)` helper — filters out any notes not in `scaleNotes`, assigns colors from CARD_COLORS palette.

### 5d. New component — `components/ai-assistant/TargetNoteRecommendationCarousel.tsx`

Mirrors `ProgressionRecommendationCarousel.tsx` structure. Renders inside `UnifiedRecommendationDisplay.tsx` as a new fourth tab "Target Notes" (🎯).

```
Tab bar:  [Scales]  [Chords]  [Progressions]  [🎯 Target Notes]
```

Card layout inside the carousel: same as `TargetNoteCard.tsx` (Section 4c) — reuse the same component.

Each card has:
- "Load to Fretboard" button → calls `onLoadTargetNotes(noteSet)` prop (passed from `AIAssistantSidebar` → `page.tsx`)
- Active state when `activeHighlight?.notes` matches the card's notes

### 5e. Update `components/ai-assistant/UnifiedRecommendationDisplay.tsx`

Add `targetNoteRecommendations` prop and fourth tab. The tab only shows if `targetNoteRecommendations?.length > 0`.

### 5f. Wire callback from `AIAssistantSidebar.tsx` to `page.tsx`

`AIAssistantSidebar` already receives `onLoadScale`. Add parallel:
```typescript
onLoadTargetNotes?: (highlight: TargetNoteHighlight) => void;
```

In `page.tsx` where `<AIAssistantSidebar>` is rendered, add:
```tsx
onLoadTargetNotes={(highlight) => {
  setTargetNoteHighlight(highlight);
  setShowTriadArcBands(false);
  setTriadFocusOn(false);
}}
```

---

## 6. FRETBOARD INTEGRATION (NO NEW FRETBOARD PROPS NEEDED)

The existing `selectedChordNotes` + `patternBgNotesOpacity` pipeline handles everything. The only change is the priority chain in `page.tsx` (Section 2a).

When `targetNoteHighlight` is active:
- `selectedChordNotes` = `targetNoteHighlight.notes` → those notes render as foreground (full opacity, colored rings)
- `patternBgNotesOpacity` = `targetNoteBgOpacity` (default 25) → all other scale notes dim
- The Fretboard's existing chord tone color hierarchy (`CHORD_TONE_COLORS`) applies to the target notes

**Clearing target note highlight:**
- When user enables "Triads in Scale" mode → clear `targetNoteHighlight`
- When user loads a chord progression pattern → clear `targetNoteHighlight`
- "Clear" button in `TargetNotesPanel` → `setTargetNoteHighlight(null)`

---

## 7. ACTIVE STATE INDICATOR IN PAGE UI

When `targetNoteHighlight` is active, show a dismissible pill in the controls area (same row as the Triads in Scale toggle):

```
🎯 Target: "Lydian Shimmer"  [C] [E] [B]  [✕]
```

Style: `background: targetNoteHighlight.color + '20'`, border: `1px solid targetNoteHighlight.color + '60'`, gold accent.

---

## 8. IMPLEMENTATION ORDER (for Sonnet 4.6)

Execute in this exact order to avoid broken intermediate states:

### Step 1 — Types (no UI impact)
- Create `lib/target-notes/types.ts`
- Extend `lib/ai-assistant/types.ts`

### Step 2 — API Route
- Create `app/api/target-notes/generate/route.ts`
- Test with curl: `POST /api/target-notes/generate` with sample body

### Step 3 — State & Fretboard wiring in `page.tsx`
- Add `targetNoteHighlight` state + `targetNoteBgOpacity`
- Update `selectedChordNotes` priority chain
- Update `patternBgNotesOpacity` calculation
- Import `TargetNotesPanel` (stub initially)

### Step 4 — `TargetNoteCard.tsx` component
- Pure presentational, no state, easy to build in isolation
- Props: `noteSet: TargetNoteSet`, `isActive: boolean`, `onLoad: () => void`, `theme: ThemeConfig`

### Step 5 — `TargetNotesPanel.tsx` component
- AI generator section (textarea + button + loading + cards carousel)
- Manual picker section (note buttons + load button + reset + opacity slider)
- Uses `TargetNoteCard` for AI results

### Step 6 — Render `TargetNotesPanel` in `page.tsx`
- Insert below the Triads in Scale block, same conditional guard (`rootNote && scaleName`)
- Wire all callbacks

### Step 7 — AI Assistant integration
- Update `openai-service.ts` system prompt
- Add parsing for `targetNoteRecommendations`
- Create `TargetNoteRecommendationCarousel.tsx`
- Update `UnifiedRecommendationDisplay.tsx` (add 4th tab)
- Update `AIAssistantSidebar.tsx` (add `onLoadTargetNotes` prop + pass through)
- Wire `onLoadTargetNotes` in `page.tsx`

### Step 8 — Active state indicator
- Add dismissible pill to the controls row in `page.tsx`
- Clear logic when Triads in Scale or pattern mode activates

---

## 9. COMPLETE PROPS INTERFACES

### `TargetNotesPanel` props:
```typescript
interface TargetNotesPanelProps {
  currentKey: string;
  currentScale: string;
  scaleNotes: string[];
  activeHighlight: TargetNoteHighlight | null;
  onLoadHighlight: (highlight: TargetNoteHighlight) => void;
  onClearHighlight: () => void;
  bgOpacity: number;
  onBgOpacityChange: (v: number) => void;
  theme: ThemeConfig;
}
```

### `TargetNoteCard` props:
```typescript
interface TargetNoteCardProps {
  noteSet: TargetNoteSet;
  isActive: boolean;
  onLoad: () => void;
  theme: ThemeConfig;
}
```

### `TargetNoteRecommendationCarousel` props:
```typescript
interface TargetNoteRecommendationCarouselProps {
  recommendations: AITargetNoteRecommendation[];
  activeHighlight: TargetNoteHighlight | null;
  onLoadTargetNotes: (highlight: TargetNoteHighlight) => void;
  theme: ThemeConfig;
  scaleNotes: string[];  // for validation display
}
```

---

## 10. KEY CONSTRAINTS & GOTCHAS

1. **Note validation is critical** — AI will occasionally return a note not in the current scale. Always filter `rec.notes.filter(n => scaleNotes.includes(n))` before loading. If filtered set is empty, disable the Load button and show a warning.

2. **State conflicts** — When `targetNoteHighlight` is set, `showTriadArcBands` should be `false` (they use the same foreground/background channel). Enforce mutual exclusion in both directions.

3. **`getScaleNotes` import in API route** — The API route cannot import from client-side `lib/musicTheory.ts` if it uses browser APIs. Compute `scaleNotes` client-side and pass it in the request body (already specified in Section 3 request shape).

4. **Color hierarchy in chord tone mode** — When target notes load via `selectedChordNotes`, the existing `getChordToneColor()` color hierarchy applies. This is desirable (root = warm, 3rd = mid, etc.) and requires no additional code.

5. **`patternHighlightRootNote`** — When loading target notes that include the scale root, pass `patternHighlightRootNote={manualKey || rootNote}` to the Fretboard so the root note gets the correct color hierarchy treatment.

6. **Manual picker `useLocalStorage`** — Persist `manualTargetNotes: string[]` to localStorage so the manual selection survives page refresh. Key: `'guitar-app-manual-target-notes'`.

7. **AI assistant context** — The AI chat endpoint already receives `currentKey` and `currentScale`. To provide `scaleNotes` to the system prompt in `openai-service.ts`, compute them inside the service using the already-imported `getScaleNotes` function.

8. **Token budget** — Each slim `AITargetNoteRecommendation` is ~80 tokens. 5 recs = ~400 tokens. Fits well within the assistant's 2000 max_tokens limit. No enrichment step needed (notes are already explicit).

---

## 11. STYLING CONVENTIONS (match existing codebase)

- **Container background:** `theme.bgSecondary`, border: `1px solid ${theme.border}`
- **Section headers:** `fontSize: 12, fontWeight: 700, color: theme.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase'`
- **Buttons:** Match existing button patterns — gold (`theme.accentPrimary`) for primary actions, `theme.bgTertiary` for secondary
- **Cards:** `border-radius: 12px`, `padding: 14px`, dark background (`theme.bgPrimary`), colored top accent bar `height: 3px`
- **Note pills:** `border-radius: 999px`, `padding: 2px 8px`, `fontSize: 11`, colored background = `NOTE_COLORS[note] + '30'`, text = `NOTE_COLORS[note]`
- **Horizontal card scroll:** `display: flex, gap: 10, overflowX: 'auto'`, hidden scrollbar, cards `minWidth: 220px, maxWidth: 260px`
- **Loading state:** Spinner or 5 skeleton cards with animated shimmer pulse
- **Transitions:** `transition: 'all 150ms ease-out'` on all interactive elements
