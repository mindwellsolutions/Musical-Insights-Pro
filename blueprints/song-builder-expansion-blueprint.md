# Song Builder System — Feature Expansion Blueprint

**Project:** Musical Insights Pro
**Date:** 2026-07-16
**Purpose:** Detailed feature recommendations for expanding the Song Builder (Chord Progression Builder) system. Each entry includes a 1–10 value score, rationale, use-case coverage, and the implementation details an AI agent needs to build it fully.

---

## Current System Capabilities

The Song Builder (`/chord-progression-builder`) currently provides:
- **Multi-verse timeline** — drag-and-drop chord & scale-mode blocks on a pixel-per-beat timeline
- **AI Progression Generator** — GPT-powered chord progression suggestions (AI-Assisted + Genre presets)
- **Playback engine** — BPM-accurate instrument audio (piano, guitar, bass, etc.), MIDI output
- **Scale/Mode Recommendations** — compatible scales per active chord
- **Chord Diagrams tab** — real-time guitar voicing diagrams per chord
- **Compatibility Score** — harmonic tension/resolution scoring for the full progression
- **Undo/redo command stack**, keyboard shortcuts, save/load projects (Supabase)
- **Playing Chord Tones HUD** — animated fretboard during playback

---

## Feature Recommendations

### F-01 · Song Form / Arrangement Structure
**Value: 10/10**
**Rationale:** Currently verses exist but there is no higher-level arrangement view showing Intro → Verse → Chorus → Bridge → Outro flow. This is the single biggest gap for a complete song-writing tool.
**Target users:** Composers, songwriters, live performers setting up full sets.

**Implementation details:**
- Add a top-level `SongArrangement` entity above `VerseData[]`
- UI: a horizontal "Section Arranger" bar (drag-to-reorder colored section pills: Intro / Verse / Pre-Chorus / Chorus / Bridge / Outro / Solo / Coda)
- Each section type maps to one of the verses/sections in the tab manager
- A section can appear multiple times (Verse 1, Verse 1 repeat, Chorus 1, Chorus 2…) — reference by ID, not copy
- Export this structure as a human-readable song form string: `Intro–V1–V1–C1–V2–C1–B–C1–Outro`
- Add a "Play Arrangement" button in PlaybackControls that sequences all sections in order
- Supabase: add `song_arrangement: SectionRef[]` to the project table
- Types: `SectionRef { sectionId: string; label: string; sectionType: SectionType }`

---

### F-02 · Real-Time Chord Function Analysis (Roman Numeral Overlay)
**Value: 10/10**
**Rationale:** Musicians need to understand *why* chords work, not just *what* chords play. Showing I–IV–V–I, ii–V–I, or borrowed chords in real time is fundamental to music theory education and improv guidance.
**Target users:** Teachers, students, improvisers, composers.

**Implementation details:**
- For each `ChordInstance`, compute its Roman numeral function relative to `verse.key` and `verse.scale` using the existing `lib/musicTheory` functions
- Detect borrowed chords (secondary dominants, Neapolitan, modal interchange) — flag them with a subtle indicator
- Display above each ChordCard on the timeline: `I`, `IV`, `V7`, `ii`, `♭VII` etc.
- Toggle visibility via a toolbar button in TimelineVisualization
- Color-code by function: tonic (blue), subdominant (green), dominant (orange), borrowed (purple)
- Hook: `useChordFunctionAnalysis(chords, key, scaleName): ChordFunctionMap`
- The hook should use the diatonic chord database already present in the app


---

### F-03 · Modulation / Key Change Blocks on Timeline
**Value: 9/10**
**Rationale:** Songs change key. Currently the entire verse has one key. A third track (below Scale track) for key modulations allows representing real-world songs, and enables analysis tools to correctly recompute Roman numerals and recommendations per section.
**Target users:** Advanced composers, teachers, transcribers.

**Implementation details:**
- Add a `KeyChangeInstance { id, startTime, position, width, fromKey, toKey, modulationType }` type
- Types of modulation: Direct, Pivot chord, Common tone, Sequential
- Render as a thin third track in `TimelineVisualization` with a key change arrow icon
- `useChordFunctionAnalysis` becomes key-change-aware: it segments chords by key region
- When a key change block exists, Generator Panel and Scale Recommendations automatically respect the new key from that time point
- Scale Recommendations panel highlights which chords create smooth pivot modulations

---

### F-04 · Tension / Resolution Graph (Harmonic Arc Visualizer)
**Value: 9/10**
**Rationale:** Great songs have intentional tension arcs. A visual line graph over the timeline showing relative tension (dissonance score over time) gives composers a bird's-eye harmonic fingerprint of their song.
**Target users:** Composers, producers, educators.

**Implementation details:**
- For each chord, compute a `tensionScore` (0–10): interval dissonance count, distance from tonic, tritone presence, sus/dim/aug modifiers
- Render as an SVG line chart overlay above the timeline (toggleable), gradient fill (green=resolved, amber=mild tension, red=high tension)
- Mark cadence points automatically: V→I (authentic), IV→I (plagal), V→vi (deceptive)
- Component: `HarmonicArcOverlay` renders as absolute-positioned SVG inside the timeline scroll container
- On hover: tooltip shows chord name, tension score, functional label, and suggested resolution chord

---

### F-05 · Lyric Track / Lyric Syncing
**Value: 9/10**
**Rationale:** Songwriters write lyrics alongside chords. A fourth "Lyric" track lets them type/paste lyrics and align them with the chord timeline, then view them during playback as a scrolling teleprompter.
**Target users:** Singer-songwriters, composers, performers.

**Implementation details:**
- New track type: `LyricBlock { id, startTime, position, width, text, syllableBreaks? }`
- Lyric blocks snap to beats; double-click to edit inline
- Playback HUD: add a lyrics panel that scrolls the current lyric block into view using playback time
- Export: generate a `.lrc` (LRC lyric format) file for use in music players / karaoke software
- Supabase: store as `verse.lyricBlocks: LyricBlock[]` alongside `chordProgression`
- Components: `LyricTrack` (mirrors `ChordProgressionTrack`), `LyricCard` inline editor

---

### F-06 · Improv Mode / Jam Assistant
**Value: 9/10**
**Rationale:** Live improvisers need guidance in real time: what scale RIGHT NOW, what the next chord is, which notes are safe vs. avoid. Transforms the builder into a live performance companion.
**Target users:** Live performers, improvisers, jam session players.

**Implementation details:**
- "Jam Mode" toggle in PlaybackControls → full-screen HUD overlay
- Large current chord display + countdown to next chord (in beats)
- "Safe notes" fretboard: highlights chord tones + passing tones; avoid notes shown dim red
- Scrolling next-up chord preview queue: upcoming 3 chords
- BPM tap tempo button for setting live tempo
- MIDI input: highlight played notes on fretboard; show whether chord tone, scale tone, or avoid note
- Component: `JamModeHUD` renders as full-screen overlay `z-index: 9999`

---

### F-07 · Chord Substitution AI Engine
**Value: 9/10**
**Rationale:** Composers need variation without changing a passage's feel. Substitutions (tritone sub, relative minor/major, secondary dominant, passing dim) teach theory in context.
**Target users:** Composers, jazz musicians, advanced students.

**Implementation details:**
- Right-click context menu on any ChordCard → "Suggest Substitutions"
- Rules engine: tritone sub, relative chord swap, secondary dominant, passing diminished, diatonic interchange
- AI fallback: existing `/api/chord-progression` endpoint with substitution intent prompt
- Results: mini-panel below chord with chips; hover shows "Why this works" tooltip
- "Apply" replaces chord; "Preview" plays substitution before committing
- Hook: `useChordSubstitutions(chord, key, scaleName): SubstitutionSuggestion[]`

---

### F-08 · Export to MIDI / MusicXML / Chord Chart PDF
**Value: 9/10**
**Rationale:** Musicians need to take work into DAWs, notation software (MuseScore, Sibelius, Dorico), and karaoke systems. Without export the app is a dead end for professional workflows.
**Target users:** All users, especially professionals and teachers.

**Implementation details:**
- Export dropdown: MIDI file, MusicXML, PDF chord chart, LRC lyrics file
- **MIDI**: use `jsmidgen` npm package; map chords to MIDI note clusters at correct beat position and BPM; output `.mid`
- **MusicXML**: `<harmony>` elements per chord with degree analysis; `<lyric>` elements for lyric blocks
- **Chord chart PDF**: `jsPDF` + `html2canvas`; Nashville Number System or standard chord symbol format
- API routes: `POST /api/export/midi`, `POST /api/export/musicxml` (server-side for memory handling)

---

### F-09 · Practice Loop Mode
**Value: 8/10**
**Rationale:** Musicians learning a song need to repeat sections at varying speeds. Loop mode + gradual tempo acceleration is a proven pedagogical technique.
**Target users:** Students, learners.

**Implementation details:**
- Loop section toggle in PlaybackControls; set loop start/end beat markers by dragging on time ruler
- "Speed Trainer": starts at X% of BPM, increments Y% every N loops until target BPM reached
- Loop markers stored as `{ loopStart: number, loopEnd: number }` on the verse
- Time ruler shows loop region as highlighted band with drag handles
- `useTimelinePlayback` gains `loopStart`, `loopEnd`, `isLooping` state

---

### F-10 · Chord Progression Library / Favorites
**Value: 8/10**
**Rationale:** Users generate great progressions and want to save, recall, and reuse them. Personal library + curated "Famous Progressions" bank increases retention and session depth.
**Target users:** All users.

**Implementation details:**
- Supabase table: `user_progression_library { id, user_id, name, key, chords: ChordSymbol[], created_at, tags[] }`
- Generator Panel: "Save to Library" button; "Library" sub-tab alongside AI-Assisted and Genre-Based
- Curated static JSON: 50+ famous progressions tagged by genre/mood (I–V–vi–IV, ii–V–I, 12-bar blues, etc.)
- Filter/search by tag, key, mood; one-click "Load" populates timeline

---

### F-11 · Multi-Instrument Layer Timeline
**Value: 8/10**
**Rationale:** Songs have bass lines, melodies, counter-melodies. Separate instrument layers make the builder a lightweight multi-track sequencer.
**Target users:** Producers, composers.

**Implementation details:**
- New track type: `MelodyTrack { instrument, notes: MelodyNote[] }` where `MelodyNote { pitch, startBeat, duration }`
- Piano roll UI for melody track (grid below scale track); click to place notes
- Bass auto-generator: given chord progression, auto-generate root-on-1, fifth-on-3, walking bass options
- Playback mixes all layers via existing Web Audio engine
- Each layer has solo/mute controls in `TrackSidebar` (scaffold already exists)

---

### F-12 · AI Song Coach — Contextual Theory Lessons
**Value: 8/10**
**Rationale:** When a user adds an unusual chord or modal swap, the app can explain it — turning every composition decision into a micro theory lesson.
**Target users:** Students, self-taught musicians, curious beginners.

**Implementation details:**
- After any chord add/edit: analyze new chord in context (function, tension, diatonicism)
- If non-diatonic or unusual: show optional non-blocking "Coach" tip card (dismissible)
- Powered by existing AI assistant: short prompt `"Explain [Chord] as [Roman numeral] in [Key] [Scale] in one sentence for a beginner"`
- Tips cached in session to avoid repeated API calls for the same chord
- Settings toggle: "Show Theory Coach tips"

---

### F-13 · Sight-Reading / Notation View
**Value: 7/10**
**Rationale:** Musicians trained in notation want staff notation alongside chord symbols. Bridges the gap between lead-sheet composers and tab players.
**Target users:** Formally trained musicians, teachers, classical/jazz students.

**Implementation details:**
- Use `VexFlow` (MIT) to render chords as staff notation above the timeline
- Each `ChordInstance` renders as a note cluster on the staff at the correct beat position
- Toggle: "Show Notation" button in timeline toolbar
- Use `verse.key` + `verse.scale` to set VexFlow key signature; treble clef default

---

### F-14 · Collaboration / Share Link
**Value: 7/10**
**Rationale:** Musicians write songs together. A shareable URL for read-only playback or forked editing unlocks co-writing, teacher→student sharing, and community sharing.
**Target users:** Co-writers, teachers, community.

**Implementation details:**
- Each saved project gets a public slug (UUID stored in Supabase)
- `GET /share/[slug]` — SSR page loads project in read-only playback mode
- "Share" button → copies URL + shows QR code modal
- "Allow editing" forks a copy for the collaborator; Supabase RLS: `is_public boolean` column

---

### F-15 · Vocal / Instrument Range Validator
**Value: 7/10**
**Rationale:** Composers writing for specific singers or instruments need to verify all notes land within playable/singable range. Out-of-range notes waste rehearsal time.
**Target users:** Composers writing for ensembles, teachers.

**Implementation details:**
- Range presets: SATB voice types + guitar, bass, violin, cello (standard MIDI note ranges)
- When active, chord notes outside selected range highlight red in fretboard views
- ChordCards get a warning indicator if any note exceeds range
- Hook: `useRangeValidator(chords, rangePreset): ValidationResult[]`

---

### F-16 · Song Metadata & Mood Tagging System
**Value: 7/10**
**Rationale:** Users with many saved songs need searchability and mood classification to make their library a creative reference tool.
**Target users:** Prolific composers, producers.

**Implementation details:**
- Metadata: `mood: string[]`, `genre: string[]`, `energyLevel: 1-5`, `tempo: 'slow'|'medium'|'fast'`, `tags: string[]`
- AI auto-tag after generation: suggest mood/genre tags based on key, scale, progression type, tempo
- `SaveProjectDialog`: expandable "Metadata" section with tag chips and inspiration notes field
- `LoadProjectDialog`: filter/search by tag, mood, key, tempo
- Supabase: `metadata: JSONB` column on `chord_progression_projects`

---

### F-17 · Circle of 5ths Integration in Song Builder
**Value: 8/10**
**Rationale:** The main app's Circle of 5ths is powerful. Surfacing it contextually in the builder — showing movement paths as chords progress — deepens understanding of harmonic relationships.
**Target users:** All users.

**Implementation details:**
- Collapsible mini Circle of 5ths panel in song builder sidebar
- Active chord highlighted on circle during playback; animated arc shows chord-to-chord movement
- "Circle Distance" score shown for each chord transition in timeline
- Clicking a chord on the circle adds it to the progression
- Reuse existing `CircleOf5ths` component with a `compact` and `standalone` prop mode
- Clockwise arc = moving in 5ths (smooth); counter = 4ths; cross = distant modulation

---

## Summary Table

| ID | Feature | Value | Complexity | Primary Audience |
|----|---------|-------|------------|-----------------|
| F-01 | Song Form / Arrangement Structure | **10** | High | All |
| F-02 | Roman Numeral Overlay | **10** | Medium | Students, Teachers |
| F-03 | Key Change Blocks | 9 | Medium | Advanced Composers |
| F-04 | Tension / Resolution Graph | 9 | Medium | Composers, Educators |
| F-05 | Lyric Track | 9 | Medium | Songwriters |
| F-06 | Improv / Jam Mode | 9 | High | Live Performers |
| F-07 | Chord Substitution AI | 9 | Medium | Jazz, Advanced |
| F-08 | MIDI / MusicXML Export | 9 | High | All Professionals |
| F-09 | Practice Loop Mode | 8 | Low-Medium | Students |
| F-10 | Progression Library | 8 | Low | All |
| F-11 | Multi-Instrument Layers | 8 | Very High | Producers |
| F-12 | AI Song Coach | 8 | Medium | Students, Beginners |
| F-17 | Circle of 5ths in Builder | 8 | Medium | All |
| F-13 | Notation View | 7 | High | Formally Trained |
| F-14 | Collaboration / Share | 7 | Medium | Co-writers, Teachers |
| F-15 | Range Validator | 7 | Low | Ensemble Composers |
| F-16 | Mood / Metadata Tags | 7 | Low | Prolific Composers |

**Recommended build order:** F-02 → F-10 → F-09 → F-17 → F-01 → F-04 → F-07 → F-05 → F-06 → F-08

---

*Blueprint created: 2026-07-16. Maintained in: `blueprints/song-builder-expansion-blueprint.md`*
