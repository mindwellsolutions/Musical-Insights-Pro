# Musical Insights Pro — Full Webapp Overview & Song Builder Technical Reference

**Repository:** `mindwellsolutions/Musical-Insights-Pro`  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Stripe · OpenAI GPT-4o  
**Date:** 2026-07-16  
**Purpose:** Complete reference for an AI agent expanding the Song Builder system. Covers the entire webapp first, then deep-dives into every aspect of the current Song Builder before any expansion features are added.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Tech Stack & Infrastructure](#2-tech-stack--infrastructure)
3. [User Personas & Use Cases](#3-user-personas--use-cases)
4. [Main App — `/` (Circle of 5ths Dashboard)](#4-main-app----circle-of-5ths-dashboard)
5. [AI Assistant](#5-ai-assistant)
6. [Fretboard Learning Module](#6-fretboard-learning-module)
7. [Note Detector](#7-note-detector)
8. [Song Builder — Architecture Deep-Dive](#8-song-builder--architecture-deep-dive)
9. [Song Builder — Data Model](#9-song-builder--data-model)
10. [Song Builder — Audio Engine](#10-song-builder--audio-engine)
11. [Song Builder — UI Panels & Components](#11-song-builder--ui-panels--components)
12. [Song Builder — State & Persistence](#12-song-builder--state--persistence)
13. [Song Builder — MIDI System](#13-song-builder--midi-system)
14. [Subscription & Admin System](#14-subscription--admin-system)
15. [Shared Systems & Libraries](#15-shared-systems--libraries)

---

## 1. Application Overview

Musical Insights Pro is a **browser-based music theory and guitar visualization platform** targeting guitarists and musicians at every skill level — from absolute beginners to professional session players. It is not a DAW replacement; it is an interactive theory companion that bridges the gap between abstract music theory knowledge and practical playing on the instrument.

### Core philosophy
- **Visual-first:** All music theory is shown spatially on a guitar fretboard or circle diagram rather than as text or standard notation.
- **Real-time & contextual:** Recommendations, compatible scales, and chord diagrams update instantly as the user selects keys, scales, and chords.
- **AI-augmented:** GPT-4o powers chord generation, scale recommendations, theory explanations, and a full conversational AI assistant.
- **Persistence-first:** All user settings, projects, and AI conversation history are synced to Supabase so the app is identical across devices.

### Navigation structure
```
/ (Main App — Circle of 5ths Dashboard)
/chord-progression-builder  (Song Builder)
/learn/fretboard            (Fretboard Learning)
/learn/fretboard/note-a-day
/learn/fretboard/octave-shapes
/learn/fretboard/single-string
/note-detector              (Real-time pitch detection)
/pricing                    (Stripe subscription plans)
/subscription/manage
/subscription/required
/reviews                    (Social proof)
/admin/dashboard            (Admin-only)
```

---

## 2. Tech Stack & Infrastructure

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (server + client components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + shadcn/ui component library |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (email/password + magic link) |
| Payments | Stripe (subscriptions + webhooks) |
| AI | OpenAI GPT-4o via `openai` npm package |
| Audio | Web Audio API + `smplr` (Soundfont sampler) + `tone.js` |
| Pitch Detection | `pitchy` (autocorrelation) + `essentia.js` (ML-based) |
| State | React `useState` / `useReducer` + custom hooks; no global store |
| Data Fetching | `@tanstack/react-query` for admin/user settings |
| Persistence | `useSupabaseStorage` (custom hook — Supabase-first, localStorage fallback) |
| UI Components | Radix UI primitives via shadcn/ui |
| Icons | `lucide-react` |
| Email | Custom SMTP via `subscription-emails.ts` |

### Supabase tables (key ones)
| Table | Purpose |
|---|---|
| `user_settings` | Per-user persisted UI settings (key, scale, theme, fret width…) |
| `chord_progression_projects` | Saved Song Builder projects (`verses: JSONB`) |
| `custom_progressions` | User-saved chord progressions from the main app Neighborhood panel |
| `ai_conversations` / `ai_messages` | Full chat history for the AI Assistant |
| `midi_profiles` | User MIDI controller mappings |
| `reviews` | User-submitted reviews (moderated) |
| `subscriptions` | Stripe subscription records |

---

## 3. User Personas & Use Cases

### 3a. The Self-Taught Guitarist (Beginner–Intermediate)
**Needs:** Understand which scales fit which chords, see all scale positions on the neck, get visual chord fingerings.  
**Uses:** Main fretboard view (scale positions), Compatible Scales panel, Chord Diagrams, Onboarding Guide.  
**Value of Song Builder:** Generates progressions for them to practice over; sees compatible scales per chord.

### 3b. The Songwriter / Composer (Intermediate–Advanced)
**Needs:** Build multi-section song progressions, understand harmonic function, experiment with keys.  
**Uses:** Song Builder heavily — multi-verse timeline, AI generator, genre presets, key selector, scale-mode recommendations.  
**Value of Song Builder:** The full composition workflow from blank canvas to audible playback.

### 3c. The Live Performer / Improviser
**Needs:** Quick key/scale lookup during a gig, MIDI pedal integration for hands-free control.  
**Uses:** Circle of 5ths (quick visual reference), MIDI section selector, Triad Focus mode.  
**Value of Song Builder:** Build setlist progressions ahead of time; use playback as a backing track.

### 3d. The Music Teacher
**Needs:** Demonstrate theory concepts visually, create examples for students to explore.  
**Uses:** All sections — fretboard, circle, chord neighborhood, Song Builder for lesson demos.

### 3e. The Jazz Musician / Advanced Theory Student
**Needs:** Extended chord voicings, mode relationships, harmonic analysis, chord substitutions.  
**Uses:** Chord Neighborhood (nearby chords by voice-leading distance), overlapping chords, CAGED system, Circle of 5ths.

---

## 4. Main App — `/` (Circle of 5ths Dashboard)

This is the primary view. It is a single-page React app with many interactive sections that all respond to one shared state: the currently selected **root note + scale/mode**.

### 4a. Control Panel (Left sidebar)
**File:** `components/ControlPanel.tsx`  
- Select root note (all 12 chromatic notes + enharmonic equivalents: C, C#/Db, D…)
- Select scale/mode (Major, Natural Minor, Dorian, Mixolydian, Lydian, Phrygian, Locrian, Harmonic Minor, Melodic Minor, and many more)
- String count: 6-string or 7-string guitar
- Tuning selector (Standard, Drop D, Open G, Open E, DADGAD, and custom)
- Fretboard display toggles: show chord tones, guide tones, glow, fret dot colors, middle dots, fret count (up to 24 frets), fret width slider (20–100%, default 50% = 70px per fret)
- "Only Chord Tones" mode — hides non-chord notes from the fretboard
- All Intervals Mode — selectively show any interval degree (root, 2nd, 3rd, 4th, 5th, 6th, 7th) independently
- Invert fretboard toggle (nut at right vs. left)
- Color picker for chord tone / guide tone highlight colors
- All settings persisted to Supabase via `useSupabaseStorage`

### 4b. Fretboard (Center, top)
**File:** `components/Fretboard.tsx`  
- SVG-based guitar fretboard rendering (6 or 7 strings, 1–24 frets)
- Draws scale positions as colored dots at the correct MIDI-computed fret/string intersections
- Color system: each note name (C, D, E…) has a fixed color (`NOTE_COLORS` in `lib/musicTheory.ts`) so the same note is always the same color across the entire app
- Chord tones (root, third, fifth, seventh) highlighted with extra glow/border when `showChordTones` is enabled
- Guide tones (3rd and 7th) highlighted in a separate user-chosen color
- CAGED overlay: shows which CAGED shape each dot belongs to (C, A, G, E, D) with transparent colored bands
- Triad overlay: when Triad Mode is on, draws the triad of the selected inversion across the neck
- Pentatonic overlay: a secondary fretboard below showing pentatonic positions that overlap with the main scale
- Fret Zone Chord HUD: a small floating panel showing chords available in the currently hovered fret zone
- Live note overlay: when Note Detector is active, highlighted notes from the microphone appear on the fretboard

### 4c. Circle of 5ths
**File:** `components/CircleOf5ths.tsx`  
- Interactive SVG circle showing all 12 major keys around the perimeter
- Active key highlighted; clicking changes the root note
- Shows relative minor keys (inner ring)
- Color-coded by key: each key slice uses its root note's `NOTE_COLORS` color
- Used both on the main dashboard AND embedded in the Song Builder (same component, different props)

### 4d. HarmonizationTabs
**File:** `components/HarmonizationTabs.tsx`  
- Tabbed panel below the fretboard with several sub-views
- **Diatonic Chords tab:** Shows all 7 diatonic chords in the current key/scale with color dots and chord symbols (I, ii, iii, IV, V, vi, viiº)
- **Chord Progressions tab:** Shows pre-built common progressions (I–V–vi–IV, ii–V–I, 12-bar blues, etc.) with "play" preview
- **Custom Progressions tab:** User builds their own progressions by selecting scale degrees; can save/load to Supabase (`custom_progressions` table)
- **Triad Positions tab:** Shows all triad inversions (root, 1st inversion, 2nd inversion) across the neck for the selected chord type

### 4e. Chord Tones Progression Carousel
**File:** `components/ChordToneProgressionCarousel.tsx`  
- Horizontal scrolling carousel showing how the 1–3–5–7 chord tones of the selected chord move across the neck position by position
- Useful for visualizing voice leading and chord tone arpeggios

### 4f. Triad System (Triad Mode)
**Files:** `components/triad-system/`, `lib/music-theory/triads/`  
- When Triad Mode is toggled ON, a dedicated triad fretboard replaces / supplements the main view
- CAGED shape selector: shows triad shapes for C, A, G, E, D positions
- Inversion filter: Root position, 1st inversion, 2nd inversion
- String set filter: treble strings (1–3), middle strings (2–4), bass strings (4–6), etc.
- Two-note mode: shows just the guide tones (3rd + 7th) for comping
- Zone Navigator: shows which fret zone the current shape occupies
- Triad Focus Selector (`components/scale-triads/TriadFocusSelector.tsx`): switches focus to any of the 7 diatonic triads (I, ii, iii, IV, V, vi, viiº), updates fretboard to highlight that specific triad across the neck with other notes dimmed

### 4g. Overlapping Chords System
**Files:** `components/overlapping-chords/`, `lib/music-theory/overlapping-chords/`  
- Finds all chords that share 2+ notes with the current selected chord
- Two modes: CAGED area mode (chords within a fretboard zone) and Scale mode (all diatonic chords)
- Renders each overlapping chord in a distinct color on the fretboard simultaneously
- Overlap criteria: "all overlapping" or "two or more shared notes"
- Chord Browser Sidebar: lists all found chords with their shared note count

### 4h. Chord Neighborhood Panel
**Files:** `components/chord-neighborhood/`, `lib/music-theory/neighborhood/`  
- Voice-leading-based nearby chord discovery
- User clicks a chord on the fretboard → app computes all "nearby" chords reachable with minimal finger movement
- Distance metric: total semitones moved across all voices
- Shows nearby chords as colored overlays on the fretboard; clicking a nearby chord makes it the new anchor
- Chord Progression builder within the neighborhood: add chords to a linear progression, preview playback, save/load progressions to Supabase
- Common tone indicators: dots showing which notes remain stationary between chord changes
- Diatonic filter: option to show only diatonic chords within the neighborhood search radius

### 4i. Compatible Scales Section
**File:** `components/audio/CompatibleScalesSection.tsx`  
- Driven by `lib/musicalCompatibility.ts` and the pre-computed `lib/music-theory-database/` compatibility database
- Lists all scales/modes compatible with the current root + scale, scored 1–10
- Color-coded by compatibility: green (very compatible), yellow (somewhat), red (avoid)
- Skill-level filter: Beginner / Intermediate / Advanced (filters out exotic scales for beginners)
- Clicking a compatible scale updates the fretboard to show that scale's positions

### 4j. AI Assistant Sidebar
**File:** `components/ai-assistant/AIAssistantSidebar.tsx`  
- Full conversational chat interface powered by GPT-4o
- Context-aware: the AI knows the current key, scale, and active chord
- Returns structured chord recommendations (with diagram popover), scale recommendations, and progression recommendations as rendered UI cards, not just text
- Full conversation history: multiple named conversations saved to Supabase (`ai_conversations`, `ai_messages` tables)
- Quick Actions panel: pre-built prompts ("Explain this mode", "Suggest improv scales", "What chords fit this scale?")
- Token usage tracker per conversation

### 4k. MusicTheoryTabs Panel
**File:** `components/MusicTheoryTabs.tsx`  
- Secondary tabbed panel (right or bottom depending on viewport)
- **Scale Recommendations:** Database-driven compatible scale list
- **Chord Recommendations:** GPT-generated chord suggestions for the current key/scale
- **Chord Scale Compatibility:** Cross-matrix showing which chords work with which scales

### 4l. MIDI Section Selector
**Files:** `components/midi/`, `contexts/MIDISelectionContext.tsx`, `hooks/useMIDIButtonHandlers.ts`  
- Connects to external MIDI controllers (foot pedals, pad controllers)
- MIDI pedal mapping: Buttons 1/2 scroll through items (chords, scales) within the active section; Buttons 3/4 change which UI section is currently MIDI-controlled
- Sections that can be MIDI-controlled: Compatible Scales, Triad Focus Selector, Chord Progressions, Custom Progressions
- `MIDISectionToggle` component: radio-style buttons that show which section is currently listening to MIDI
- MIDI config stored in Supabase (`midi_profiles` table)

### 4m. Note Notation Context
**File:** `contexts/NoteNotationContext.tsx`; hook `hooks/useNoteDisplay.ts`  
- Global toggle: show notes as sharps (#) or flats (♭)  
- Applied everywhere (fretboard labels, chord symbols, key selectors)

---

## 5. AI Assistant

**Files:** `components/ai-assistant/`, `app/api/ai-assistant/`, `lib/ai-assistant/`

The AI assistant is a full GPT-4o chat interface with structured music-theory-aware outputs.

### How it works
1. User types a question or clicks a Quick Action
2. `prompt-builder.ts` assembles a system prompt containing: current key, scale, active chord, recent conversation context, and the app's music theory context
3. Request goes to `app/api/ai-assistant/chat/route.ts` which calls the OpenAI Chat Completions API
4. Response is parsed by `chord-parser.ts`, `scale-parser.ts` to extract structured data embedded in the response (chord symbols, scale names with scores)
5. `chord-enrichment.ts` and `scale-enrichment.ts` add voicing data, fretboard positions, and compatibility scores to parsed recommendations before they reach the UI
6. The UI renders plain text responses alongside interactive `ChordRecommendationCard`, `ScaleCard`, and `ProgressionRecommendationCard` components

### Key files
| File | Role |
|---|---|
| `lib/ai-assistant/prompt-builder.ts` | Builds the system prompt with music theory context |
| `lib/ai-assistant/chord-parser.ts` | Extracts chord symbols from GPT text |
| `lib/ai-assistant/chord-enrichment.ts` | Adds voicings + fretboard data to parsed chords |
| `lib/ai-assistant/scale-enrichment.ts` | Adds positions + compatibility scores to parsed scales |
| `lib/ai-assistant/openai-service.ts` | OpenAI API call wrapper |
| `app/api/ai-assistant/chat/route.ts` | Streaming chat API endpoint |
| `app/api/ai-assistant/conversations/` | CRUD for conversation history |

---

## 6. Fretboard Learning Module

**Path:** `/learn/fretboard` and sub-routes  
**Files:** `app/learn/fretboard/`, `components/fretboard-learning/`, `lib/fretboard-learning/`

Three structured training programs:

### 6a. Note-a-Day (`/learn/fretboard/note-a-day`)
- Daily challenge: find all positions of a randomly selected note on the fretboard within a time limit
- Progressive difficulty: starts with open strings, moves to higher frets
- Session summary with score and streak tracking

### 6b. Octave Shapes (`/learn/fretboard/octave-shapes`)
- Teaches the 5 core octave shape patterns across the neck
- Interactive: highlights the root note and the octave positions for a selected shape
- Practice mode: test yourself by identifying octave positions

### 6c. Single String (`/learn/fretboard/single-string`)
- Trains note recall on a single string at a time
- Randomly selects a note; user clicks the correct fret
- Useful for building fretboard mental maps string by string

---

## 7. Note Detector

**Path:** `/note-detector`  
**Files:** `app/note-detector/page.tsx`, `components/audio/`, `lib/audio/`

Real-time pitch detection via the browser microphone.

### How it works
1. User grants microphone access
2. `lib/audio/pitchyDetector.ts` or `lib/audio/essentiaAnalyzer.ts` processes the audio stream (configurable)
3. Detected frequency → note name via `lib/audio/frequencyToNote.ts` (uses equal temperament mapping with cents deviation)
4. Detected note position mapped to the main fretboard via `lib/audio/frequencyPositionMatcher.ts`
5. `KeyDetectionEngine` (`lib/audio/keyDetectionEngine.ts`) accumulates played notes over a time window and suggests the likely key/scale using a weighted compatibility algorithm
6. Compatible scales displayed in real-time alongside the detected key

### UI components
- `NoteDetectorSidebar` — control panel for mic input, tuner mode, detection algorithm selector
- `GuitarTuner` — chromatic tuner display with pitch deviation indicator (cents flat/sharp)
- `NoteDisplay` — large current note + octave display
- `KeyDetectionDisplay` — shows detected key with confidence score
- `AudioInputSelector` — choose audio input device (for multi-interface setups)
- `ScaleModeCards` — real-time compatible scale suggestions based on detected notes

---

## 8. Song Builder — Architecture Deep-Dive

**Path:** `/chord-progression-builder`  
**Root page:** `app/chord-progression-builder/page.tsx` → renders `ChordProgressionBuilder`  
**Main component:** `components/chord-progression/ChordProgressionBuilder.tsx` (1,235 lines)

The Song Builder is a self-contained mini-application within the Next.js app. It has its own audio engine, state management, undo/redo system, persistence layer, and full UI.

### High-level component hierarchy
```
ChordProgressionBuilder (main container, 1,235 lines)
├── Header bar
│   ├── HamburgerMenu (nav back to main app)
│   ├── CompatibilityScore (AI harmony analysis)
│   ├── PlayingChordTonesHUD (live chord tones during playback)
│   ├── Save/Load/History buttons
│   └── Keyboard shortcuts button
├── VerseTabsManager (section tabs: Verse 1, Chorus, Bridge…)
├── TimelineVisualization
│   ├── TrackSidebar (track labels + mute/solo controls)
│   ├── TimeRuler (beat/bar ruler with click-to-seek)
│   ├── ChordProgressionTrack (main chord blocks track)
│   │   └── ChordCard (individual chord block — draggable, resizable)
│   ├── ScaleModeTrack (scale/mode assignment blocks track)
│   │   └── ScaleModeCard (individual scale block)
│   ├── PlaybackCursor (animated playhead line)
│   └── SnapGuides (visual snap indicators during drag)
├── PlaybackControls (transport: play/pause/stop/replay, BPM, instrument, volume)
└── GeneratorPanel (always-visible bottom panel)
    └── ChordProgressionGenerator
        ├── Tab: Play Song (PlaySongPanel — full-screen section overview)
        ├── Tab: Chord Progressions (AI generator + genre presets)
        │   ├── Sub-tab: AI-Assisted (AIProgressionGenerator)
        │   └── Sub-tab: Genre-Based (GenreProgressionSelector)
        ├── Tab: Scale / Mode (ScaleModeRecommendations)
        │   ├── Sub-tab: Compatible Scales (database-driven list)
        │   └── Sub-tab: AI Recommended (AIScaleModeRecommendations)
        ├── Tab: Chord Diagrams (ChordDiagramsTab)
        └── Tab: Song Details (ChordTonesTab — chord tone info)
```

### Layout structure
- **Header:** Fixed 48px bar at the top with title, compatibility score, HUD, and action buttons
- **Verse tabs bar:** Horizontal scrolling tab strip; each tab = one song section
- **Timeline area:** Scrollable horizontally, fixed height per track (88px chord track + 56px scale track)
- **Playback controls:** Fixed 48px bar above the generator panel
- **Generator panel:** Always-visible bottom panel (~400–500px), full-width, tabbed

---

## 9. Song Builder — Data Model

All data lives in TypeScript interfaces (`lib/chord-progression/types.ts`).

### `VerseData` — A single song section
```typescript
interface VerseData {
  id: string;                          // UUID
  name: string;                        // "Verse 1", "Chorus", "Bridge"
  key: string;                         // "C", "D#", "F#"
  bpm: number;                         // 60–240
  timeSignature: { numerator: number; denominator: number }; // default 4/4
  chordProgression: ChordInstance[];   // All chord blocks in this section
  scaleModeAssignments: ScaleModeInstance[]; // All scale blocks in this section
  aiScaleVisionText?: string;          // User description for AI scale recommendations
  aiScaleRecommendations?: AIScaleModeRecommendation[];
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
}
```

### `ChordInstance` — A single chord block on the timeline
```typescript
interface ChordInstance {
  id: string;                          // Unique ID
  chordSymbol: string;                 // "C", "Am7", "Gmaj7"
  chordQuality: ChordQuality;          // "major", "minor7", "dom7", etc.
  notes: string[];                     // ["C", "E", "G"]
  rootNote: string;                    // "C"
  startTime: number;                   // Start position in beats
  duration: number;                    // Length in beats
  position: number;                    // Visual x-position in pixels
  width: number;                       // Visual width in pixels
  color: string;                       // Root note color from NOTE_COLORS
  voicingIndex: number;               // Selected guitar voicing index
}
```

### `ScaleModeInstance` — A scale/mode block on the timeline
```typescript
interface ScaleModeInstance {
  id: string;
  chordId: string;           // Links to a ChordInstance.id
  scaleName: string;         // "Dorian", "Mixolydian", "Pentatonic Minor"
  rootNote: string;          // Root of the scale
  compatibilityScore: number; // 1–10
  startTime: number;         // Mirrors the linked chord's startTime
  duration: number;
  position: number;
  width: number;
}
```

### `ChordQuality` type
```
'maj' | 'min' | 'dim' | 'aug' |
'maj7' | 'min7' | 'dom7' | 'dim7' | 'min7b5' |
'maj9' | 'min9' | 'dom9' |
'maj11' | 'min11' | 'dom11' |
'maj13' | 'min13' | 'dom13' |
'sus2' | 'sus4' | '6' | 'min6' | 'add9' | 'minadd9'
```

### `PlaybackState`
```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;        // Current position in beats
  playbackPosition: number;   // Visual position in pixels
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}
```

### `UserChordProgression` — Saved project (Supabase row)
```typescript
interface UserChordProgression {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  verses: VerseData[];       // Full JSONB blob of all sections
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 10. Song Builder — Audio Engine

**Files:** `lib/chord-progression/audio-engine-smplr.ts`, `hooks/chord-progression/useTimelinePlayback.ts`

### Stack
- **`smplr`** (`Soundfont` class): loads and plays General MIDI soundfont samples via Web Audio API
- **`tone.js`**: used for scheduling and timing utilities
- **`AudioContext`** (Web Audio API): raw audio graph, mixes all voices

### Instrument library
The engine supports 5 instrument types mapped to GM soundfont names:
| `InstrumentType` | GM Instrument |
|---|---|
| `piano` | `acoustic_grand_piano` |
| `guitar` | `acoustic_guitar_nylon` |
| `strings` | `string_ensemble_1` |
| `brass` | `trumpet` |
| `synth` | `synth_strings_1` |

### Playback flow
1. User presses Play
2. `useTimelinePlayback` calls `audioEngineRef.current.initialize()` to load the soundfont (lazy, first play only)
3. `MusicalTimeTracker` tracks musical position (beats, bars) relative to `AudioContext.currentTime`
4. `PlayheadAnimator` drives the visual playhead using `requestAnimationFrame` synced to `AudioContext.currentTime`
5. `BeatCounter` fires callbacks at each beat boundary
6. For each chord in the progression, a Web Audio scheduled event triggers `audioEngine.playChord(chordNotes, time, duration)`
7. MIDI output: if `midiEnabled`, the engine also sends MIDI note-on/note-off messages to the connected MIDI output

### Key classes
| Class | File | Role |
|---|---|---|
| `ChordProgressionAudioEngineSmplr` | `audio-engine-smplr.ts` | Main audio engine: initialize, play, stop, change instrument |
| `MusicalTimeTracker` | `musical-time-tracker.ts` | Beat/bar position tracking |
| `PlayheadAnimator` | `playhead-animator.ts` | rAF-based playhead visual position |
| `BeatCounter` | `beat-counter.ts` | Fires beat callbacks for UI sync |

### Volume & output routing
- Volume: 0–100 slider; mapped to Web Audio `GainNode`
- Audio output device: selectable via `MediaDeviceInfo` enumeration (for multi-output setups like audio interfaces)
- MIDI enable/disable toggle: sends MIDI alongside or instead of audio

---

## 11. Song Builder — UI Panels & Components

### 11a. VerseTabsManager
**File:** `components/chord-progression/VerseTabsManager.tsx`

- Horizontal strip of clickable tabs, one per `VerseData`
- Default start: one verse named "Verse 1" in key of C
- Click tab → switches active verse (all timeline content updates)
- **Right-click context menu** on any tab: Rename, Duplicate, Delete
- **"+" button:** Opens a dialog to name a new section and optionally pick its key
- Key badge on each tab: shows the verse's root key (e.g., "C") colored by `NOTE_COLORS`
- Key change: clicking the key badge on the active tab opens a 12-key selector grid

### 11b. TimelineVisualization
**File:** `components/chord-progression/TimelineVisualization.tsx`

**Layout:** Fixed-left sidebar (80px) + horizontally scrollable content area

**Tracks:**
- **TimeRuler:** Top bar showing beat numbers (1, 2, 3, 4, 5…) and bar markers. Click anywhere on the ruler to seek playback to that position.
- **ChordProgressionTrack (88px tall):** The main chord editing area. Chord blocks are rendered as colored rectangular cards.
- **ScaleModeTrack (56px tall):** Thin track below the chords where scale/mode blocks align with their linked chords.

**TrackSidebar (left column):**
- Track labels ("Chords", "Scales")
- Mute button (M) per track — mutes playback without removing blocks
- Solo button (S) per track — solos that track's playback
- AI Insights button — opens modal with GPT analysis of the track's harmonic content
- Add button (+) per track — opens the Add Chord or Add Scale Mode modal

**Zoom / pixelsPerBeat:**
- Zoom slider in the timeline header: 5 zoom levels (`ZOOM_LEVELS` array)
- Default: 40 `pixelsPerBeat`
- Range: 20 (very zoomed out) → 100 (very zoomed in)
- All `position` and `width` values on chord/scale blocks are derived from `startTime * pixelsPerBeat` and `duration * pixelsPerBeat`

**Empty state (when no chords exist):**
- Full-height visual panel inside the chord track
- Dark grid background with animated dot pattern + blue radial glow
- Music icon with a gold sparkle badge
- Three CTA cards:
  1. **Add Chord** (blue) → opens `AddChordModal`
  2. **Generate with AI** (amber/gold) → scrolls to + switches generator panel to AI tab
  3. **Genre Presets** (purple) → switches generator panel to Genre tab
- Shows current key so users have context

### 11c. ChordCard
**File:** `components/chord-progression/ChordCard.tsx`

A single chord block on the timeline.

- **Background color:** Root note color from `NOTE_COLORS` (faint, ~30% opacity) with colored left border
- **Content:** Chord symbol (e.g., "Am7") in large text, duration in beats below
- **Drag:** Click and drag horizontally to move the chord to a new start position. Snaps to beat grid.
- **Resize:** Drag the left or right edge to change duration. Left-edge drag with Shift shifts all earlier chords. Right-edge drag with Shift extends and pushes subsequent chords.
- **Click (single):** Selects the chord; updates the Chord Diagrams tab and triggers AI compatibility re-analysis
- **Click (shift):** Multi-select (cross-track selection: can select both chords and scales together)
- **Double-click:** Opens edit modal to change the chord symbol
- **Right-click:** Context menu (Edit, Duplicate, Delete)

### 11d. ScaleModeCard
**File:** `components/chord-progression/ScaleModeCard.tsx`

Scale block visually aligned below its linked chord.

- Shows scale name (e.g., "D Dorian") and compatibility score badge
- Color: tinted by root note color, thinner than chord cards
- Same drag/resize mechanics as ChordCard
- Clicking opens edit modal to change the scale assignment

### 11e. PlaybackControls
**File:** `components/chord-progression/PlaybackControls.tsx`

Fixed 48px bar between the timeline and the generator panel.

- **Transport:** ⏮ (restart to beat 0) | ▶/⏸ (play/pause toggle) | ⏹ (stop and reset) | 🔁 (replay from start)
- **BPM:** Current BPM displayed with –/+ buttons; range 60–240. Also accepts direct text input.
- **Instrument selector:** Drop-down for Piano / Guitar / Strings / Brass / Synth; changes on the fly (re-initializes the smplr sampler)
- **Volume:** Slider 0–100
- **MIDI toggle:** Enable/disable MIDI output alongside audio
- **Audio output device:** Drop-down for all available audio output devices (populated via `navigator.mediaDevices.enumerateDevices()`)

### 11f. Playing Chord Tones HUD
**File:** `components/chord-progression/PlayingChordTonesHUD.tsx`

Lives in the center of the header bar.

- During playback, shows the chord currently under the playhead (e.g., "Am7")
- Displays each chord tone (root, 3rd, 5th, 7th) as a color-coded badge using the `NOTE_COLORS` system
- When not playing, shows a muted "standby" state
- Toggle button: hide the HUD to a compact "Chord Tones" restore button (state persisted to `localStorage`)

### 11g. CompatibilityScore
**File:** `components/chord-progression/CompatibilityScore.tsx`

Lives in the header bar, left of center.

- Polls `/api/chord-progression/analyze-compatibility` whenever the chord progression changes (debounced)
- Shows a 0–100 score badge with color: green ≥80, blue ≥60, amber ≥40, red <40
- Icon: ✓ (very compatible), ↗ (good), ⚠ (tension)
- Clicking the dropdown chevron expands a floating portal panel below the header showing:
  - Full AI rationale text for the score
  - Specific recommendations for improving harmonic cohesion
  - "✨ Suggest Updates" button → calls `/api/chord-progression/generate-progression-updates` and displays suggested chord replacements in the generator panel
- "AI Suggest" button: re-triggers analysis immediately

### 11h. Generator Panel Tabs (ChordProgressionGenerator)
**File:** `components/chord-progression/ChordProgressionGenerator.tsx`

Always-visible panel below the playback controls. Contains 5 tabs:

#### Tab 1: Play Song (PlaySongPanel)
**File:** `components/chord-progression/PlaySongPanel.tsx`
- Overview of all sections (verses) with their chords displayed as chord symbol badges
- "Play full arrangement" button sequences through all sections during playback
- Quick section-jump: clicking a section's area seeks to that section's start

#### Tab 2: Chord Progressions
Two sub-tabs:

**Sub-tab A: AI-Assisted (`AIProgressionGenerator`)**
- Text area: "Describe your musical vision" (free text, e.g., "melancholic jazz progression in a minor key")
- Complexity slider: 1–10
- Length slider: 2–8 chords
- Number of suggestions: 2–6
- "Generate" button → calls `/api/chord-progression/generate-recommendations` → returns `GeneratedProgression[]`
- Results rendered as cards showing: progression name, chord symbols with colored badges, Roman numerals, genre tags, famous songs that use this progression, and "Load" button
- "Load" places all chords on the timeline at the default beat spacing for the current `pixelsPerBeat`

**Sub-tab B: Genre-Based (`GenreProgressionSelector`)**
- Genre selector pills: Rock, Pop, Jazz, Blues, Country, R&B, Folk, Metal, Classical, Latin, Reggae, EDM (and more from the static genre database `lib/chord-progression/genre-loader.ts`)
- Search bar: filter progressions by name, character, or description
- Results list: each progression shows name, description, difficulty badge (Easy/Medium/Hard), musical character, and famous songs
- "Load" button: transposes the progression to the current verse key and loads it onto the timeline

#### Tab 3: Scale / Mode (ScaleModeRecommendations)
Two sub-tabs:

**Sub-tab A: Compatible Scales**
- Loads from `lib/music-theory-database/compatibility-service.ts` — a pre-computed database of 1000s of scale/chord compatibility ratings
- Lists scales with: name, root note, compatibility score (1–10) color-coded bar, description
- Skill level filter: Beginner / Intermediate / Advanced
- "Add to Timeline" button: creates a `ScaleModeInstance` block at the end of the scale track for the current verse

**Sub-tab B: AI Recommended (`AIScaleModeRecommendations`)**
- User writes a "vision text" (e.g., "dark and mysterious, jazz-influenced sound")
- "Generate AI Recommendations" → calls `/api/scale-mode-recommendations/generate` with the chord progression + vision text
- Returns 4–6 scale recommendations with name, root note, rationale, and compatibility score
- Recommendations persist on the `VerseData.aiScaleRecommendations` field (saved with the project)

#### Tab 4: Chord Diagrams (ChordDiagramsTab)
- Shows guitar chord voicing diagrams for the **currently selected or currently playing chord**
- Uses `calculateChordVoicings()` from `lib/chord-voicings.ts` to compute all playable voicings (up to fret 15)
- Renders `ChordDiagram` components (same SVG fretboard diagram component used across the main app)
- When playback is running: automatically switches to showing the chord under the playhead
- When paused: shows the last clicked/selected chord

#### Tab 5: Chord Tones Tab (ChordTonesTab)
- Shows chord tone information for the selected chord: root, 3rd, 5th, 7th, extensions
- Each tone color-coded using the app-wide `NOTE_COLORS` system
- Displays the chord's `notes[]` array with interval labels (R, M3/m3, P5, M7/m7 etc.)

### 11i. AddChordModal
**File:** `components/chord-progression/AddChordModal.tsx`
- Dialog with a searchable chord selector
- Root note picker: 12-button grid (all notes in NOTE_COLORS colors)
- Quality picker: All 24 `ChordQuality` options grouped by type (triads, 7ths, 9ths, extensions, suspended)
- Duration picker: 1, 2, 4, or 8 beats
- Voicing preview: shows a chord diagram for the selected chord before adding
- "Add to Timeline" button appends the chord at the end of the progression (rightmost position + 0)

### 11j. AddScaleModeModal
**File:** `components/chord-progression/AddScaleModeModal.tsx`
- Scale/mode selector for manually adding a scale block to the timeline
- Scale name picker: all modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) + Natural Minor, Harmonic Minor, Melodic Minor, Major Pentatonic, Minor Pentatonic, Blues, and more
- Root note picker
- Links to a specific chord (by chord ID) to auto-set start/duration

### 11k. Save/Load Project System
**Files:** `components/chord-progression/SaveProjectDialog.tsx`, `LoadProjectDialog.tsx`, `lib/chord-progression/database-service.ts`

- **Save:** Names the project, optionally adds a description. Calls `database-service.saveProject()` → Supabase `chord_progression_projects` upsert.
- **Quick Save:** Header button (floppy disk icon) re-saves the current project without opening the dialog (only works after a named save).
- **Load:** Shows a list of all the user's saved projects with name, last updated date, and section count. Clicking loads all `VerseData[]` back into state.
- Data format: `verses: JSONB` column stores the complete serialized `VerseData[]` array.

---

## 12. Song Builder — State & Persistence

### State management hook: `useChordProgressionState`
**File:** `hooks/chord-progression/useChordProgressionState.ts`

- Stores `{ verses: VerseData[]; activeVerseId: string | null }` in React state
- **localStorage autosave:** On every state change, saves to `localStorage` key `chord-progression-builder-state` as JSON
- **localStorage autoload:** On mount, restores from `localStorage` so work-in-progress survives page refreshes
- Exposes: `verses`, `activeVerse`, `activeVerseId`, `addVerse`, `updateVerse`, `deleteVerse`, `setActiveVerse`, `updateChords`, `updateScaleModes`, `setVerses`

### Undo/Redo System
**Files:** `hooks/chord-progression/useUndoRedo.ts`, `lib/chord-progression/commands.ts`, `lib/chord-progression/undo-redo-manager.ts`

- **Command pattern:** All mutations (add chord, delete chord, move chord, resize chord, update scale modes) are wrapped in `Command` objects with `execute()` and `undo()` methods
- **Stack depth:** 50 commands
- **Commands defined:**
  - `UpdateChordsCommand` — wraps any chord array change
  - `UpdateScaleModesCommand` — wraps any scale mode array change
- `useUndoRedo` exposes: `execute`, `undo`, `redo`, `canUndo`, `canRedo`, `lastUndoDescription`, `lastRedoDescription`, `getUndoHistory`, `getRedoHistory`, `restoreToUndoState`, `restoreToRedoState`

### Keyboard Shortcuts
**File:** `hooks/chord-progression/useKeyboardShortcuts.ts`
| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Space` | Play/Pause toggle |
| `Ctrl+S` | Quick save (if project named) |
| `Delete` / `Backspace` | Delete selected chord(s) |
| `Escape` | Deselect all |
| `Ctrl+D` | Duplicate selected chord |
| Arrow keys | Nudge selected chord left/right by 1 beat |

### Timeline utilities
**File:** `lib/chord-progression/timeline-utils.ts`
- `DEFAULT_ZOOM_LEVEL`: 40 `pixelsPerBeat`
- `ZOOM_LEVELS`: array of `{ pixelsPerBeat, label }` objects
- `beatsToPixels(beats, ppb)`: `beats * ppb`
- `pixelsToBeats(px, ppb)`: `px / ppb`
- `snapToGrid(beats, timeSignature)`: snaps to nearest beat boundary
- `getTotalDuration(blocks)`: finds the rightmost end position across all blocks

### Drag & Drop
**Files:** `hooks/chord-progression/useChordDragOptimized.ts`, `useChordDragResize.ts`, `useChordInteractions.ts`, `useScaleModeDragOptimized.ts`, `useScaleModeInteractions.ts`

- Mouse-event-driven drag: `mousedown` → capture → `mousemove` → update position → `mouseup` → commit
- Snap-to-grid: all positions snapped to beat boundaries
- Drag types: `move`, `resize-left`, `resize-right`, `resize-left-push` (shifts preceding chords), `resize-right-push` (pushes following chords)
- Snap guides: visual lines appear at beat boundaries during drag (`SnapGuides` component)
- Collision detection: blocks cannot overlap; they push each other when resized with Shift

---

## 13. Song Builder — MIDI System

**Files:** `components/midi/`, `app/api/midi/`, `hooks/useMIDIButtonHandlers.ts`

### MIDI output during playback
- The audio engine sends MIDI note-on/note-off messages to the connected MIDI output device
- MIDI channel 1 (default)
- Note velocities derived from the chord voicing

### MIDI controller input (pedal control)
- The main app's MIDI Section Selector (`MIDISectionToggle`) is **not connected to the Song Builder's playback controls** — that is a main-app-only feature
- The Song Builder itself does not currently have MIDI pedal control for play/pause/next-chord

### MIDI config persistence
- MIDI device mappings stored in Supabase `midi_profiles` table
- `app/api/midi/config/route.ts`: GET/POST for user MIDI config
- `app/api/midi/profiles/route.ts`: manage multiple saved MIDI profiles

---

## 14. Subscription & Admin System

### Subscription tiers (Stripe)
- **Free tier:** Limited access (some features gated)
- **Pro tier:** Full access to all features including AI assistant, MIDI, Song Builder
- Subscription status checked via `contexts/SubscriptionContext.tsx` — a global React context loaded on every page
- Gated routes redirect to `/subscription/required` if user lacks the required tier
- `middleware.ts`: protects routes server-side

### Admin system
**Path:** `/admin/dashboard`, `/adminaccesspoint/`
- User management: view all users, edit subscription status, invite new users, delete accounts
- Subscription analytics: revenue, churn, MRR charts (`SubscriptionAnalytics` component)
- System settings: global feature flags (e.g., disable subscription enforcement for testing)
- Reviews moderation: approve/reject/unapprove user-submitted reviews
- Admin check: `lib/auth/admin-check.ts` — verifies admin role from Supabase `user_settings` table

---

## 15. Shared Systems & Libraries

### Music Theory Core (`lib/musicTheory.ts`)
The single most-imported file in the project. Exports:
- `NOTES`: chromatic scale array `['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`
- `NOTE_COLORS`: fixed color per note name (used everywhere for visual consistency)
- `CHORD_TONE_COLORS`: fixed colors for root, 3rd, 5th, 7th
- `calculateScalePositions(rootNote, scaleName, stringCount, tuning)`: core function that returns all note positions on the fretboard
- `getScaleNotes(rootNote, scaleName)`: returns the note names in a scale
- `getChordTones(rootNote, quality)`: returns notes in a chord
- `getTonicChordTones(rootNote, scaleName)`: returns chord tones of the tonic chord for a given scale
- `getGuideTones(rootNote, quality)`: returns just the 3rd and 7th
- `TUNINGS`: standard and alternate guitar tuning definitions

### `useSupabaseStorage` hook
**File:** `hooks/useSupabaseStorage.ts`
- Drop-in replacement for `useState` that persists to Supabase `user_settings` table
- **Behavior:** Read from Supabase on mount → update local React state → debounce writes back to Supabase (300ms)
- **Cache:** Falls back to `localStorage` if the user is not authenticated or Supabase is slow
- **Pattern:** `const [value, setValue] = useSupabaseStorage<T>('key', defaultValue)`
- Each key maps to a column in `user_settings`

### Genre Progression Database
**File:** `lib/chord-progression/genre-loader.ts`
- Static JSON database of genre-tagged progressions
- Each progression includes: name, description, chord symbols (in abstract Roman numeral terms), difficulty (1–3), musical character, famous songs
- `convertProgressionToChords(progression, key, pixelsPerBeat, beatDuration)`: transposes the abstract progression to the actual key and returns `ChordInstance[]`
- Available genres: Rock, Pop, Jazz, Blues, Country, R&B, Folk, Metal, Classical, Latin, Reggae, EDM + more

### Compatible Scales Database
**Files:** `lib/music-theory-database/`, `lib/musicalCompatibility.ts`
- Pre-computed compatibility matrix: for every key × scale combination, scores all other scales 1–10
- Built by offline scripts (`scripts/generateCompatibilityData.ts`)
- Loaded lazily at runtime via `compatibility-service.ts`
- Returns `ScaleCompatibilityRating[]` with: `scaleName`, `rootNote`, `score`, `description`, `colorCode`

### Chord Voicings Database
**Files:** `lib/chord-voicings.ts`, `lib/chord-voicings-database.ts`, `lib/enhanced-chord-voicings-database.ts`
- For any chord (root + quality), returns an array of guitar voicings
- Voicing format: array of fret numbers per string (from low E to high e), -1 = muted string, 0 = open string
- `calculateChordVoicings(notes, rootNote, tuning, maxFret)`: algorithmic voicing generator
- Used everywhere: chord diagram popover on main app, AI assistant chord cards, Song Builder Chord Diagrams tab

### Note Notation System
**File:** `contexts/NoteNotationContext.tsx`, `hooks/useNoteDisplay.ts`
- Global context: `notationMode: 'sharp' | 'flat'`
- `useNoteDisplay` hook: `getNoteDisplayName(note)` → converts internal sharp representation to the user's preferred notation
- Example: internal `'A#'` → displays as `'A#'` (sharp mode) or `'Bb'` (flat mode)
- Applied to all note labels, chord symbols, key selectors, and fretboard dots

### Color System (`NOTE_COLORS`)
Every note name maps to a fixed color used consistently across the entire app:
- C → `#ef4444` (red)
- C# → `#f97316` (orange)
- D → `#eab308` (yellow)
- D# → `#22c55e` (emerald)
- E → `#06b6d4` (cyan)
- F → `#3b82f6` (blue)
- F# → `#8b5cf6` (violet)
- G → `#ec4899` (pink)
- G# → `#f43f5e` (rose)
- A → `#10b981` (green)
- A# → `#6366f1` (indigo)
- B → `#a855f7` (purple)

This system allows musicians to instantly recognize the same note across fretboard positions, chord diagrams, timeline blocks, and any other visual representation.

---

## Appendix A — Key API Routes (Song Builder relevant)

| Route | Method | Purpose |
|---|---|---|
| `/api/chord-progression/generate-recommendations` | POST | GPT-4o: generate chord progressions from vision text |
| `/api/chord-progression/analyze-compatibility` | POST | GPT-4o: score a progression's harmonic cohesion |
| `/api/chord-progression/generate-progression-updates` | POST | GPT-4o: suggest chord replacements to improve a progression |
| `/api/chord-progression/generate-additional-recommendations` | POST | GPT-4o: more variation progressions |
| `/api/chord-progression/recommend-next-chord` | POST | GPT-4o: suggest what chord should come next |
| `/api/scale-mode-recommendations/generate` | POST | GPT-4o: recommend scales for the current progression + vision |
| `/api/chord-progression/generate-similar-variations` | POST | GPT-4o: create variations on an existing progression |
| `/api/ai-insights` | POST | GPT-4o: general harmonic insights for a chord sequence |

---

## Appendix B — Song Builder Component File Map

```
components/chord-progression/
├── ChordProgressionBuilder.tsx      Main container (1,235 lines)
├── TimelineVisualization.tsx        Timeline with tracks and ruler
├── ChordProgressionTrack.tsx        Chord blocks track
├── ScaleModeTrack.tsx               Scale blocks track
├── ChordCard.tsx                    Individual chord block
├── ScaleModeCard.tsx                Individual scale block
├── OverlappingChordCard.tsx         Multi-chord overlay (for chords from Neighborhood)
├── TrackSidebar.tsx                 Left sidebar with track controls
├── TimeRuler.tsx                    Beat/bar ruler + seek
├── PlaybackCursor.tsx               Animated playhead
├── SnapGuides.tsx                   Beat snap indicators during drag
├── PlaybackControls.tsx             Transport bar
├── PlayingChordTonesHUD.tsx         Live chord tones in header
├── CompatibilityScore.tsx           AI harmony score in header
├── VerseTabsManager.tsx             Section tab strip
├── GeneratorPanel.tsx               Bottom panel wrapper
├── ChordProgressionGenerator.tsx    Tabbed generator (5 tabs)
├── AIProgressionGenerator.tsx       AI chord generation sub-tab
├── GenreProgressionSelector.tsx     Genre presets sub-tab
├── ScaleModeRecommendations.tsx     Scale recommendations tab
├── AIScaleModeRecommendations.tsx   AI scale sub-tab
├── ChordDiagramsTab.tsx             Guitar diagram tab
├── ChordTonesTab.tsx                Chord tone info tab
├── PlaySongPanel.tsx                Song overview tab
├── AddChordModal.tsx                Add chord dialog
├── AddScaleModeModal.tsx            Add scale dialog
├── SaveProjectDialog.tsx            Save to Supabase dialog
├── LoadProjectDialog.tsx            Load from Supabase dialog
├── KeyboardShortcutsDialog.tsx      Shortcuts reference dialog
├── AIInsightsModal.tsx              Track-level AI analysis modal
├── InstrumentSelector.tsx           Instrument picker dialog
├── DualFretboardDisplay.tsx         Dual fretboard view for song
├── ScaleFretboard.tsx               Scale fretboard for song context
├── TriadFretboard.tsx               Triad fretboard for song context
├── NearbyProgressionChords.tsx      Nearby chord suggestions panel
├── SongChordDiagramSidebar.tsx      Chord diagram sidebar in song view
├── SongOverlappingChordsSidebar.tsx Overlapping chords in song view
├── SongProgressionDisplay.tsx       Full song progression overview
├── ChordProgressionRecommendations.tsx Recommendation cards panel
├── RecommendationChordDiagramSidebar.tsx Sidebar for recommendation chords
├── ReplaceProgressionModal.tsx      Confirm replace timeline content
└── ErrorBoundary.tsx                Error recovery wrapper

hooks/chord-progression/
├── useChordProgressionState.ts      Core state + localStorage persistence
├── useTimelinePlayback.ts           Audio engine + playback control
├── useUndoRedo.ts                   Command stack management
├── useKeyboardShortcuts.ts          Keyboard shortcut handlers
├── useChordProgressionCompatibility.ts  AI score polling
├── useChordDragOptimized.ts         Chord block drag logic
├── useChordDragResize.ts            Chord block resize logic
├── useChordInteractions.ts          Click/select/context menu
├── useScaleModeDragOptimized.ts     Scale block drag logic
├── useScaleModeInteractions.ts      Scale block interactions
├── useTimelineSelection.ts          Cross-track selection state
└── useVerseManager.ts               Verse CRUD helpers

lib/chord-progression/
├── types.ts                         All TypeScript types
├── audio-engine-smplr.ts            smplr-based audio engine
├── audio-engine-client.ts           Client-safe audio engine wrapper
├── musical-time-tracker.ts          Beat/bar position tracking
├── playhead-animator.ts             rAF-based playhead animation
├── beat-counter.ts                  Beat-boundary callback system
├── commands.ts                      Undo/redo command classes
├── undo-redo-manager.ts             Command stack manager
├── chord-utils.ts                   Chord symbol parsing utilities
├── chord-colors.ts                  Chord color assignment
├── chord-library.ts                 Chord type definitions and metadata
├── chord-tones-utils.ts             Compute chord tones from symbol
├── database-service.ts              Supabase project save/load
├── database-loader.ts               Async project data loading
├── genre-loader.ts                  Genre progression database reader
├── timeline-utils.ts                Pixel/beat conversion utilities
├── nearby-progressions-service.ts   Nearby chord suggestions
├── song-progression-utils.ts        Full-song playback sequencing
└── playback-context.ts              Playback state context
```

---

*Overview written: 2026-07-16. Repo: `mindwellsolutions/Musical-Insights-Pro`.*
*All expansion blueprints: `blueprints/song-builder-expansion-blueprint.md`*
