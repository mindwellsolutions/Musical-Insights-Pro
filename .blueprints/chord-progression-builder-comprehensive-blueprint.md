# 🎵 Chord Progression Builder System - Comprehensive Development Blueprint

## 📋 Executive Summary

This blueprint provides complete specifications for implementing a professional-grade Chord Progression Builder system for the Musical Insights webapp. The system enables musicians to compose, practice, and perform with an intuitive timeline-based interface inspired by professional video editing software.

### Key Features
- **Visual Timeline Interface**: Horizontal timeline with draggable/resizable chord blocks
- **Multi-Verse Management**: Tabbed system for different song sections (Verse, Chorus, Bridge, etc.)
- **Scale/Mode Integration**: Assign recommended scales/modes to each chord
- **Real-Time Audio Playback**: Tone.js-powered playback with Guitar and Piano instruments
- **AI-Assisted Generation**: Genre-based and contextual AI chord progression recommendations
- **Compact Timeline Header**: Integrated view above fretboard for quick reference

---

## 🎨 Design Philosophy

### Visual Design Principles
- **Modern & Sleek**: Clean, professional interface matching existing webapp design
- **Visually Striking**: Bold colors, smooth animations, and intuitive interactions
- **Consistent**: Uses existing ThemeConfig color system (dark, light, midnight themes)
- **Responsive**: Adapts to desktop, tablet, and mobile viewports
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation support

### Color Palette (From Existing Theme System)

**Dark Theme** (Primary):
- Background Primary: `#0a0a0a`
- Background Secondary: `#1a1a1a`
- Background Tertiary: `#2a2a2a`
- Text Primary: `#ffffff`
- Text Secondary: `#a0a0a0`
- Border: `#333333`
- Accent Primary: `#3b82f6` (Blue)
- Accent Secondary: `#60a5fa` (Light Blue)
- Button Primary: `#2563eb`
- Button Hover: `#3b82f6`

**Light Theme**:
- Background Primary: `#ffffff`
- Background Secondary: `#f8f9fa`
- Background Tertiary: `#e9ecef`
- Text Primary: `#1a1a1a`
- Text Secondary: `#6c757d`
- Border: `#dee2e6`
- Accent Primary: `#0066cc`
- Accent Secondary: `#3399ff`

**Midnight Theme**:
- Background Primary: `#0f172a`
- Background Secondary: `#1e293b`
- Background Tertiary: `#334155`
- Text Primary: `#f1f5f9`
- Text Secondary: `#94a3b8`
- Border: `#475569`
- Accent Primary: `#0ea5e9`
- Accent Secondary: `#38bdf8`

### Typography
- **Font Family**: Inter (existing webapp font)
- **Headings**: 600-700 weight, 16-24px
- **Body Text**: 400-500 weight, 14-16px
- **Small Text**: 400 weight, 12-13px
- **Chord Labels**: 600-700 weight, 18-20px (bold, prominent)

---

## 🏗️ System Architecture

### Component Hierarchy

```
app/
└── chord-progression-builder/
    └── page.tsx                              # Main page route

components/
└── chord-progression/
    ├── ChordProgressionBuilder.tsx           # Main container component
    ├── VerseTabsManager.tsx                  # Verse tabs with key selection
    ├── TimelineVisualization.tsx             # Timeline container
    ├── ChordProgressionTrack.tsx             # Top track layer (chords)
    ├── ScaleModeTrack.tsx                    # Bottom track layer (scales/modes)
    ├── ChordCard.tsx                         # Individual chord block (draggable/resizable)
    ├── ScaleModeCard.tsx                     # Individual scale/mode card
    ├── TimeRuler.tsx                         # Beat/bar markers
    ├── PlaybackCursor.tsx                    # Animated playback position indicator
    ├── PlaybackControls.tsx                  # BPM, play, stop, instrument selection
    ├── ChordEditModal.tsx                    # Edit chord properties
    ├── ScaleModeSelector.tsx                 # Select scales/modes for chords
    ├── ChordProgressionGenerator.tsx         # Generation UI container
    ├── GenreBasedGenerator.tsx               # Genre-based progression generator
    ├── AIAssistedGenerator.tsx               # AI contextual generator
    ├── CompactTimelineHeader.tsx             # Compact view for fretboard tab
    └── InstrumentSelector.tsx                # Instrument selection modal

lib/
└── chord-progression/
    ├── types.ts                              # TypeScript interfaces
    ├── database-loader.ts                    # Load progression databases
    ├── audio-engine.ts                       # Tone.js audio playback
    ├── timeline-utils.ts                     # Timeline calculations
    ├── chord-utils.ts                        # Chord manipulation utilities
    └── ai-generator.ts                       # AI progression generation

hooks/
└── chord-progression/
    ├── useChordProgressionState.ts           # Main state management
    ├── useVerseManager.ts                    # Verse CRUD operations
    ├── useTimelinePlayback.ts                # Playback state & controls
    ├── useChordDragResize.ts                 # Drag & resize logic
    └── useProgressionGenerator.ts            # Generation logic

music-theory/
└── chord-progressions/
    ├── genre-progressions-database.json      # Top 25 progressions per genre
    └── [key]-chord-progression-database.json # Existing chord databases (×12)
```

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS + existing ThemeConfig
- **State Management**: React hooks, Zustand (for complex state)
- **Data Fetching**: React Query (@tanstack/react-query)
- **Audio Engine**: Tone.js v15+
- **Drag & Drop**: @dnd-kit/core (modern, accessible)
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL) for user progressions
- **Local Storage**: localStorage for draft progressions

---

## 📊 Data Models & Database Schema

### TypeScript Interfaces

```typescript
// lib/chord-progression/types.ts

/**
 * Main verse data structure
 * Each verse represents a song section (Verse 1, Chorus, Bridge, etc.)
 */
export interface VerseData {
  id: string;                           // Unique identifier (UUID)
  name: string;                         // "Verse 1", "Chorus", "Bridge", etc.
  key: string;                          // Root note: "C", "D#", "F#", etc.
  bpm: number;                          // Beats per minute (60-240)
  timeSignature: {
    numerator: number;                  // 4 (in 4/4)
    denominator: number;                // 4 (in 4/4)
  };
  chordProgression: ChordInstance[];    // Array of chord blocks
  scaleModeAssignments: ScaleModeInstance[]; // Scale/mode track data
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}

/**
 * Individual chord instance in the timeline
 * Represents a single chord block (like a video clip)
 */
export interface ChordInstance {
  id: string;                           // Unique identifier
  chordSymbol: string;                  // "C", "Am7", "Gmaj7", etc.
  chordQuality: ChordQuality;           // "major", "minor7", etc.
  notes: string[];                      // ["C", "E", "G"]
  rootNote: string;                     // "C"
  startTime: number;                    // Start position in beats (0, 4, 8, etc.)
  duration: number;                     // Length in beats (1, 2, 4, 8, etc.)
  position: number;                     // Visual position in pixels (calculated)
  width: number;                        // Visual width in pixels (calculated)
  color: string;                        // Chord color (from NOTE_COLORS)
  voicingIndex: number;                 // Selected voicing (0-n)
}

/**
 * Scale/mode assignment for a chord
 * Links a scale/mode to a specific chord in the progression
 */
export interface ScaleModeInstance {
  id: string;                           // Unique identifier
  chordId: string;                      // Reference to ChordInstance.id
  scaleName: string;                    // "Dorian", "Mixolydian", etc.
  rootNote: string;                     // "D", "G", etc.
  compatibilityScore: number;           // 1-10 rating
  startTime: number;                    // Same as linked chord
  duration: number;                     // Same as linked chord
  position: number;                     // Visual position
  width: number;                        // Visual width
}

/**
 * Generated chord progression from genre database or AI
 */
export interface GeneratedProgression {
  id: string;
  name: string;                         // "I-V-vi-IV", "Jazz ii-V-I", etc.
  description: string;                  // "Pop progression (Axis progression)"
  chords: string[];                     // ["C", "G", "Am", "F"]
  romanNumerals: string[];              // ["I", "V", "vi", "IV"]
  genre: string[];                      // ["Pop", "Rock", "Indie"]
  difficulty: number;                   // 1-5
  musicalCharacter?: string;            // "Uplifting, optimistic"
  famousSongs?: string[];               // ["Let It Be", "Don't Stop Believin'"]
  scaleRecommendations?: Record<string, ScaleRecommendation[]>;
  rationale?: string;                   // AI-generated explanation
}

/**
 * Scale recommendation for a chord
 */
export interface ScaleRecommendation {
  scaleName: string;
  compatibilityScore: number;
  usage: string;
}

/**
 * Chord quality types
 */
export type ChordQuality =
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'half-diminished7'
  | 'major9' | 'minor9' | 'dominant9'
  | 'major11' | 'minor11' | 'dominant11'
  | 'major13' | 'minor13' | 'dominant13'
  | 'sus2' | 'sus4' | '6' | 'minor6' | 'add9' | 'minor-add9';

/**
 * Timeline playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;                  // Current position in beats
  playbackPosition: number;             // Visual position in pixels
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

/**
 * Instrument types for Tone.js
 */
export type InstrumentType = 'guitar' | 'piano';

/**
 * Timeline zoom level
 */
export interface ZoomLevel {
  pixelsPerBeat: number;                // 20, 40, 60, 80, 100
  label: string;                        // "25%", "50%", "100%", "150%", "200%"
}

/**
 * Drag operation state
 */
export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize-left' | 'resize-right' | null;
  chordId: string | null;
  startX: number;
  startTime: number;
  startDuration: number;
}
```

### Supabase Database Schema

```sql
-- User saved chord progressions
CREATE TABLE user_chord_progressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  verses JSONB NOT NULL,              -- Array of VerseData
  tags TEXT[],                        -- ["rock", "ballad", "original"]
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_chord_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progressions"
  ON user_chord_progressions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progressions"
  ON user_chord_progressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progressions"
  ON user_chord_progressions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progressions"
  ON user_chord_progressions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON user_chord_progressions FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_user_progressions_user_id ON user_chord_progressions(user_id);
CREATE INDEX idx_user_progressions_created_at ON user_chord_progressions(created_at DESC);
CREATE INDEX idx_user_progressions_tags ON user_chord_progressions USING GIN(tags);
```

---

## 🎨 GUI/UX Design Specifications

### 1. Main Page Layout

**Route**: `/chord-progression-builder`

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Chord Progression Builder" [Save] [Load] [Export]         │
├─────────────────────────────────────────────────────────────────────┤
│ Verse Tabs: [1: Verse (Key: C)] [2: Chorus (Key: F)] [+]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Timeline Visualization Area (Scrollable Horizontally)              │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Time Ruler: 1    2    3    4    5    6    7    8              ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Chord Track:  [C ──] [G ──] [Am ─] [F ──] [+]                 ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Scale/Mode:   [C Ionian] [G Mix] [A Dor] [F Lyd]              ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Playback Controls: [◀] [▶] [⟲] | BPM: 120 | Key: C | 🎹 Piano    │
├─────────────────────────────────────────────────────────────────────┤
│ Chord Progression Generator                                        │
│ [Genre-Based] [AI-Assisted]                                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Dimensions**:
- Header: 60px height
- Verse Tabs: 50px height
- Timeline Area: Flexible (min 400px, max 60vh)
- Playback Controls: 80px height
- Generator Section: 300px height (collapsible)

**Responsive Breakpoints**:
- Desktop: 1280px+ (full layout)
- Tablet: 768px-1279px (compact controls)
- Mobile: <768px (stacked layout, horizontal scroll)

---

### 2. Verse Tabs Manager

**Component**: `VerseTabsManager.tsx`

**Visual Design**:
```
┌──────────────────────────────────────────────────────────────┐
│ [1] Verse (Key: C) │ [2] Chorus (Key: F) │ [3] Bridge │ [+] │
│     ▔▔▔▔▔▔▔▔▔▔▔▔▔▔                                           │
└──────────────────────────────────────────────────────────────┘
```

**Tab States**:

**Active Tab**:
```css
background: theme.accentPrimary (#3b82f6)
color: #ffffff
border-bottom: 3px solid theme.accentPrimary
font-weight: 600
```

**Inactive Tab**:
```css
background: theme.bgTertiary (#2a2a2a)
color: theme.textSecondary (#a0a0a0)
border-bottom: 1px solid theme.border (#333333)
font-weight: 400
transition: all 0.2s ease
```

**Hover State** (Inactive):
```css
background: theme.bgSecondary (#1a1a1a)
color: theme.textPrimary (#ffffff)
transform: translateY(-2px)
```

**Tab Content**:
- **Verse Number**: Small badge (16px circle) with number
- **Verse Name**: 14px font, truncate at 15 characters
- **Key Display**: Small pill badge `Key: C` (12px font, semi-transparent background)

**Add Verse Button** (`[+]`):
```css
width: 50px
height: 50px
background: theme.bgTertiary
border: 2px dashed theme.border
color: theme.accentPrimary
font-size: 24px
transition: all 0.2s ease

hover:
  background: theme.accentPrimary
  color: #ffffff
  border-style: solid
  transform: scale(1.05)
```

**Key Selection Dropdown**:
- Clicking "Key: C" opens modal with 12 root note buttons
- Uses existing `NOTE_COLORS` from `lib/musicTheory.ts`
- Grid layout: 4 columns × 3 rows
- Each button: 60px × 60px, rounded, colored background
- Selected key: white border, glow effect

**Context Menu** (Right-click on tab):
```
┌─────────────────┐
│ ✏️  Rename       │
│ 📋 Duplicate     │
│ 🗑️  Delete       │
└─────────────────┘
```

---

### 3. Timeline Visualization

**Component**: `TimelineVisualization.tsx`

**Visual Structure**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Time Ruler                                                          │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐    │
│ │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │  9  │ 10  │    │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘    │
├─────────────────────────────────────────────────────────────────────┤
│ Chord Progression Track                                            │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🎸 Chord Progression                                            ││
│ │ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ [+]        ││
│ │ │    C     │ │    G     │ │   Am    │ │    F     │            ││
│ │ │  ⋮⋮ ◀ ▶  │ │  ⋮⋮ ◀ ▶  │ │ ⋮⋮ ◀ ▶  │ │  ⋮⋮ ◀ ▶  │            ││
│ │ └──────────┘ └──────────┘ └─────────┘ └──────────┘            ││
│ └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ Scale/Mode Track                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🎼 Scales/Modes                                    [+ Add]      ││
│ │ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐            ││
│ │ │ C Ionian │ │G Mixolyd │ │A Dorian │ │ F Lydian │            ││
│ │ │   ⭐ 10   │ │   ⭐ 9   │ │  ⭐ 10  │ │   ⭐ 9   │            ││
│ │ └──────────┘ └──────────┘ └─────────┘ └──────────┘            ││
│ └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
     ▲
     │ Playback Cursor (white vertical line, animated)
```

**Time Ruler**:
- Height: 40px
- Background: `theme.bgSecondary`
- Beat markers: Every beat (1, 2, 3, 4...)
- Bar markers: Every 4 beats (bold line)
- Font: 12px, `theme.textSecondary`
- Grid lines: Vertical lines at each beat (1px, `theme.border`)

**Track Layers**:
- **Chord Track**: Height 120px, background `theme.bgTertiary`
- **Scale/Mode Track**: Height 100px, background `theme.bgTertiary`
- Gap between tracks: 10px
- Track label: Left side, 14px font, icon + text

**Zoom Controls** (Top-right corner):
```
[−] 50% [100%] 150% [+]
```
- Zoom levels: 25%, 50%, 75%, 100%, 125%, 150%, 200%
- Default: 100% (40 pixels per beat)
- Affects horizontal spacing only

**Grid Snapping**:
- Snap to: 1/4 beat, 1/2 beat, 1 beat, 2 beats
- Visual snap indicator: Dashed line appears when near snap point
- Snap tolerance: 10 pixels

---

### 4. Chord Card Component

**Component**: `ChordCard.tsx`

**Visual Design**:
```
┌──────────────────┐
│       C          │  ← Chord symbol (18px, bold)
│     ⋮⋮  ◀  ▶     │  ← Drag handle + resize handles
└──────────────────┘
```

**Dimensions**:
- Min width: 80px (1 beat at 100% zoom)
- Max width: 800px (20 beats at 100% zoom)
- Height: 80px
- Border radius: 8px
- Padding: 12px

**Color Coding**:
- Uses `NOTE_COLORS` from `lib/musicTheory.ts`
- Example: C = `#FF6B6B`, G = `#4ECDC4`, Am = `#95E1D3`
- Opacity: 0.9 (normal), 1.0 (hover), 0.7 (dragging)

**Interactive Elements**:

**Drag Handle** (⋮⋮):
- Position: Center-left, 6px from left edge
- Size: 20px × 40px
- Icon: 6 dots in 2 columns
- Cursor: `grab` (normal), `grabbing` (active)
- Color: `theme.textSecondary`

**Resize Handle Left** (◀):
- Position: Bottom-left corner
- Size: 24px × 24px
- Icon: Left arrow or `⟨` symbol
- Cursor: `ew-resize`
- Behavior: Expands/shrinks from left, pushes adjacent chords

**Resize Handle Right** (▶):
- Position: Bottom-right corner
- Size: 24px × 24px
- Icon: Right arrow or `⟩` symbol
- Cursor: `ew-resize`
- Behavior: Expands/shrinks from right, overwrites adjacent chords

**States**:

**Normal**:
```css
background: NOTE_COLORS[rootNote] with 0.9 opacity
border: 2px solid transparent
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
transform: scale(1)
transition: all 0.2s ease
```

**Hover**:
```css
opacity: 1.0
border: 2px solid theme.accentPrimary
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)
transform: translateY(-2px) scale(1.02)
```

**Selected** (clicked):
```css
border: 3px solid #ffffff
box-shadow: 0 0 20px rgba(255, 255, 255, 0.5)
z-index: 10
```

**Dragging**:
```css
opacity: 0.7
cursor: grabbing
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
transform: scale(1.05)
z-index: 100
```

**Context Menu** (Right-click):
```
┌─────────────────────┐
│ ✏️  Edit Chord       │
│ 🎵 Change Voicing   │
│ 📊 View Theory      │
│ 🗑️  Delete          │
└─────────────────────┘
```

**Edit Chord Modal**:
- Opens when clicking "Edit" or double-clicking card
- Shows chord selector (like in AI Assistant)
- Displays available chords in current key
- Tabs: "Triads", "7ths", "9ths", "11ths", "13ths", "Sus", "Add"
- Each chord shows diagram preview
- "Save" and "Cancel" buttons

---

### 5. Scale/Mode Card Component

**Component**: `ScaleModeCard.tsx`

**Visual Design**:
```
┌──────────────────┐
│   C Ionian       │  ← Scale name (14px)
│     ⭐ 10        │  ← Compatibility score
└──────────────────┘
```

**Dimensions**:
- Width: Matches linked chord card width
- Height: 60px
- Border radius: 6px
- Padding: 8px

**Color Coding**:
- Background: `theme.bgTertiary` with subtle gradient
- Border: 2px solid based on compatibility score
  - 9-10: Green `#22c55e`
  - 7-8: Blue `#3b82f6`
  - 5-6: Orange `#f59e0b`
  - 1-4: Gray `#6b7280`

**States**:

**Normal**:
```css
background: linear-gradient(135deg, theme.bgTertiary 0%, theme.bgSecondary 100%)
border: 2px solid [score-based-color]
opacity: 0.95
```

**Hover**:
```css
opacity: 1.0
transform: translateY(-1px)
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
```

**Context Menu** (Right-click):
```
┌─────────────────────┐
│ 🔄 Change Scale     │
│ 📊 View Details     │
│ 🗑️  Remove          │
└─────────────────────┘
```

---

### 6. Playback Controls

**Component**: `PlaybackControls.tsx`

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────────┐
│  [◀ Go to Start] [▶ Play] [⟲ Replay]  │  BPM: [120 ▼]  │       │
│                                        │  Key: C Major  │       │
│                                        │  [🎹 Piano ▼]  │       │
└─────────────────────────────────────────────────────────────────┘
```

**Button Specifications**:

**Go to Start** (◀):
- Size: 50px × 50px
- Icon: Left arrow or rewind symbol
- Tooltip: "Go to start (doesn't auto-play)"
- Action: Moves playback cursor to position 0

**Play/Pause** (▶/⏸):
- Size: 60px × 60px (larger, primary action)
- Icon: Play triangle (▶) or Pause bars (⏸)
- Background: `theme.accentPrimary`
- Hover: Lighter shade, scale(1.05)
- Active: Darker shade, scale(0.95)

**Replay** (⟲):
- Size: 50px × 50px
- Icon: Circular arrow
- Tooltip: "Replay from start"
- Action: Stops, resets to 0, then plays

**BPM Control**:
- Label: "BPM" (12px, `theme.textSecondary`)
- Input: Number input, 60-240 range
- Increment buttons: [−] [+]
- Default: 120
- Style: `theme.bgTertiary`, rounded, 80px width

**Key Display**:
- Label: "Key" (12px, `theme.textSecondary`)
- Display: Current verse key + quality (e.g., "C Major")
- Style: Read-only badge, `theme.bgTertiary`
- Click: Opens key selector (same as verse tab)

**Instrument Selector**:
- Button: Shows current instrument icon + name
- Icon: 🎹 (Piano) or 🎸 (Guitar)
- Click: Opens modal with instrument cards
- Modal: 2 large cards (Piano, Guitar) with preview sounds
- Style: Card-based selection, hover effects

**Instrument Modal**:
```
┌─────────────────────────────────────────┐
│  Select Instrument                  [×] │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐    │
│  │   🎹 Piano   │  │  🎸 Guitar   │    │
│  │              │  │              │    │
│  │  [Preview]   │  │  [Preview]   │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

---

### 7. Playback Cursor

**Component**: `PlaybackCursor.tsx`

**Visual Design**:
- **Line**: Vertical line, 2px width, white color (`#ffffff`)
- **Height**: Spans entire timeline height (ruler + all tracks)
- **Top Handle**: Small triangle or circle at top (10px)
- **Shadow**: Subtle glow effect `0 0 10px rgba(255, 255, 255, 0.5)`
- **Z-index**: 50 (above cards, below modals)

**Animation**:
```css
/* Smooth movement during playback */
transition: left 0.05s linear;

/* Pulse effect when playing */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

animation: pulse 1s ease-in-out infinite;
```

**Behavior**:
- Moves left-to-right based on `currentTime` and `pixelsPerBeat`
- Position: `left = currentTime * pixelsPerBeat`
- Loops back to start when reaching end
- Draggable: User can click and drag to seek
- Snap to grid when dragging (optional)

---

### 8. Add Scale/Mode Flow

**Component**: `ScaleModeSelector.tsx`

**User Flow**:

1. **User clicks "+ Add Scale/Mode" button**
   - Button location: Right side of Scale/Mode track header
   - Button style: `theme.accentPrimary`, rounded, icon + text

2. **Overlay appears**
   - Semi-transparent dark overlay: `rgba(0, 0, 0, 0.7)`
   - Highlights chord progression track
   - Dims everything else
   - Shows instruction text: "Click on a chord to assign scales/modes"

3. **Chord cards become clickable buttons**
   - Hover effect: Glow, scale(1.05)
   - Cursor: pointer
   - Click: Opens scale selector modal

4. **Scale Selector Modal opens**
   - Title: "Select Scales/Modes for [Chord Name]"
   - Subtitle: "You can select multiple scales/modes"
   - Content: Grid of ScaleRecommendationCard components (from existing system)
   - Uses existing `CompatibleScalesSection` component
   - Filters: Genre, difficulty level
   - Multi-select: Checkboxes on each card
   - Actions: "Add Selected" (primary), "Cancel" (secondary)

5. **Scale/Mode cards appear in track**
   - Positioned below selected chord
   - Width matches chord width
   - Linked visually with subtle connecting line
   - Can select multiple scales for same chord (stacked vertically)

**Modal Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Select Scales/Modes for C Major                        [×] │
│  You can select multiple scales/modes                       │
├─────────────────────────────────────────────────────────────┤
│  Filter by Genre: [All ▼]  Difficulty: [All ▼]             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ☑ C Ionian   │  │ ☐ C Lydian   │  │ ☐ C Mixolyd  │     │
│  │   ⭐ 10      │  │   ⭐ 9       │  │   ⭐ 8       │     │
│  │ Perfect fit  │  │ Bright sound │  │ Bluesy feel  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  [Add Selected (1)]  [Cancel]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎵 Chord Progression Generation System

### 1. Genre-Based Generator

**Component**: `GenreBasedGenerator.tsx`

**Purpose**: Generate chord progressions based on genre and key

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  🎸 Genre-Based Chord Progression Generator                 │
├─────────────────────────────────────────────────────────────┤
│  Select Genre:                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Rock │ │ Pop  │ │ Jazz │ │Blues │ │Country│ ...        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                             │
│  Top 25 Progressions for Rock in C Major:                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. I-V-vi-IV (C-G-Am-F)                    ⭐⭐⭐⭐⭐ │   │
│  │    "The Axis Progression" - Pop/Rock staple         │   │
│  │    Famous: "Let It Be", "Don't Stop Believin'"      │   │
│  │    [Load Progression]                               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2. I-IV-V (C-F-G)                          ⭐⭐⭐⭐⭐ │   │
│  │    "The Foundation" - Rock, Blues, Country          │   │
│  │    Famous: "La Bamba", "Twist and Shout"            │   │
│  │    [Load Progression]                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Genre List** (from existing system):
- Rock, Pop, Jazz, Blues, Country, R&B, Funk, Soul, Gospel
- Latin, Reggae, Metal, Indie, Folk, Electronic

**Progression Card Design**:
```css
background: theme.bgTertiary
border: 1px solid theme.border
border-radius: 8px
padding: 16px
margin-bottom: 12px

hover:
  border-color: theme.accentPrimary
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2)
  transform: translateY(-2px)
```

**Card Content**:
- **Title**: Progression name + chords (16px, bold)
- **Description**: Short description (14px, `theme.textSecondary`)
- **Difficulty**: Star rating (1-5 stars)
- **Famous Songs**: List of 2-3 well-known songs
- **Music Theory**: Roman numeral analysis
- **Load Button**: Primary button, loads progression into current verse

**Database Structure**:

**File**: `music-theory/chord-progressions/genre-progressions-database.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-13",
  "genres": {
    "Rock": {
      "description": "Rock music progressions",
      "progressions": [
        {
          "id": "rock-1",
          "name": "I-V-vi-IV",
          "description": "The Axis Progression - Pop/Rock staple",
          "romanNumerals": ["I", "V", "vi", "IV"],
          "difficulty": 1,
          "popularity": 10,
          "musicalCharacter": "Uplifting, anthemic, optimistic",
          "famousSongs": [
            "Let It Be - The Beatles",
            "Don't Stop Believin' - Journey",
            "With or Without You - U2"
          ],
          "rationale": "This progression creates a sense of forward motion and resolution. The vi chord adds emotional depth before returning to the IV.",
          "scaleRecommendations": {
            "I": ["Ionian", "Major Pentatonic"],
            "V": ["Mixolydian", "Major Pentatonic"],
            "vi": ["Aeolian", "Dorian", "Minor Pentatonic"],
            "IV": ["Lydian", "Major Pentatonic"]
          }
        }
        // ... 24 more progressions
      ]
    },
    "Jazz": {
      "description": "Jazz music progressions",
      "progressions": [
        {
          "id": "jazz-1",
          "name": "ii-V-I",
          "description": "The fundamental jazz progression",
          "romanNumerals": ["ii", "V", "I"],
          "difficulty": 3,
          "popularity": 10,
          "musicalCharacter": "Sophisticated, resolving, classic",
          "famousSongs": [
            "Autumn Leaves",
            "All The Things You Are",
            "Satin Doll"
          ],
          "rationale": "The ii-V-I is the cornerstone of jazz harmony. The ii chord prepares the V, which strongly resolves to I.",
          "scaleRecommendations": {
            "ii": ["Dorian", "Minor Pentatonic"],
            "V": ["Mixolydian", "Altered", "Whole Tone"],
            "I": ["Ionian", "Lydian"]
          }
        }
        // ... 24 more progressions
      ]
    }
    // ... more genres
  }
}
```

**Loading Behavior**:
1. User clicks "Load Progression"
2. Confirmation modal: "This will replace the current chord progression. Continue?"
3. On confirm:
   - Clear existing chords in current verse
   - Generate ChordInstance objects for each chord
   - Calculate positions and widths (evenly spaced)
   - Add to timeline
   - Auto-save to localStorage
4. Success toast: "Progression loaded successfully!"

---

### 2. AI-Assisted Generator

**Component**: `AIAssistedGenerator.tsx`

**Purpose**: Generate custom chord progressions using AI based on user context

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✨ AI-Assisted Chord Progression Generator                 │
├─────────────────────────────────────────────────────────────┤
│  Describe your song:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ I'm writing a melancholic ballad about lost love.  │   │
│  │ I want it to feel nostalgic and bittersweet, with  │   │
│  │ a slow tempo. Think Adele or Sam Smith style.      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Optional Details:                                          │
│  Genre: [Ballad ▼]  Mood: [Melancholic ▼]  Tempo: [Slow ▼]│
│                                                             │
│  [Generate Progressions]                                    │
├─────────────────────────────────────────────────────────────┤
│  AI Recommendations:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. vi-IV-I-V (Am-F-C-G)                    ⭐⭐⭐⭐⭐ │   │
│  │    Rationale: This progression creates a melancholic│   │
│  │    yet hopeful feeling. The vi (Am) establishes the │   │
│  │    sad tone, while the I-V resolution provides a    │   │
│  │    sense of bittersweet acceptance.                 │   │
│  │                                                      │   │
│  │    Recommended Scales:                               │   │
│  │    • Am: A Aeolian, A Dorian                        │   │
│  │    • F: F Lydian, F Ionian                          │   │
│  │    • C: C Ionian, C Mixolydian                      │   │
│  │    • G: G Mixolydian                                │   │
│  │                                                      │   │
│  │    [Load Progression]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ... (4 more recommendations)                               │
└─────────────────────────────────────────────────────────────┘
```

**Input Fields**:

**Main Textarea**:
- Placeholder: "Describe your song's style, mood, genre, emotions, lyrics, or where you are in the writing process..."
- Min height: 120px
- Max length: 1000 characters
- Character counter: Shows remaining characters
- Style: `theme.bgTertiary`, rounded, focus ring

**Optional Dropdowns**:
- **Genre**: All genres from genre list + "Any"
- **Mood**: Happy, Sad, Energetic, Calm, Melancholic, Uplifting, Dark, Bright
- **Tempo**: Slow (60-80 BPM), Medium (80-120 BPM), Fast (120-180 BPM), Very Fast (180+ BPM)

**Generate Button**:
- Size: Large (full width)
- Style: Primary button, `theme.accentPrimary`
- Loading state: Spinner + "Generating..."
- Disabled when textarea is empty

**AI Response Format**:

**API Endpoint**: `/api/chord-progression/ai-generate`

**Request**:
```typescript
{
  userContext: string;        // User's description
  currentKey: string;         // Current verse key
  genre?: string;
  mood?: string;
  tempo?: string;
}
```

**Response**:
```typescript
{
  progressions: [
    {
      id: string;
      name: string;             // "vi-IV-I-V"
      chords: string[];         // ["Am", "F", "C", "G"]
      romanNumerals: string[];  // ["vi", "IV", "I", "V"]
      rationale: string;        // AI-generated explanation (2-3 sentences)
      musicalCharacter: string; // "Melancholic yet hopeful"
      difficulty: number;       // 1-5
      scaleRecommendations: {
        [chord: string]: string[];  // { "Am": ["A Aeolian", "A Dorian"] }
      };
    }
    // ... 4-9 more progressions
  ];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}
```

**AI Prompt Template**:
```
You are a professional music theory assistant specializing in chord progressions.

User Context: {userContext}
Current Key: {currentKey}
Genre: {genre || "Any"}
Mood: {mood || "Any"}
Tempo: {tempo || "Any"}

Generate 5-10 chord progressions that match the user's description. For each progression:
1. Provide the chord symbols in {currentKey}
2. Provide Roman numeral analysis
3. Explain WHY this progression works for the user's context (2-3 sentences)
4. Describe the musical character
5. Rate difficulty (1-5)
6. Recommend 1-3 scales/modes for each chord

Return as JSON array matching the TypeScript interface.
```

**Recommendation Card Design**:
- Similar to genre-based cards
- Includes AI rationale (highlighted section)
- Shows scale recommendations inline
- Expandable "Music Theory Details" section
- Load button

---

## 🎼 Compact Timeline Header

**Component**: `CompactTimelineHeader.tsx`

**Purpose**: Display a compact version of the song progression timeline above the fretboard in the tabbed area

**Location**: In the "Song Timeline" tab (new tab in the fretboard tabbed area)

**Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│ Song Timeline                                               │
├─────────────────────────────────────────────────────────────┤
│ Verses: [1: Verse (C)] [2: Chorus (F)] [3: Bridge (G)]     │
├─────────────────────────────────────────────────────────────┤
│ Chords:  [C] [G] [Am] [F]                                  │
├─────────────────────────────────────────────────────────────┤
│ Scales:  [C Ionian] [G Mix] [A Dor] [F Lyd]               │
└─────────────────────────────────────────────────────────────┘
```

**Dimensions**:
- Height: 180px (compact)
- Width: Full width of fretboard container
- Background: `theme.bgSecondary`
- Border: 1px solid `theme.border`

**Verse Tabs** (Compact):
- Height: 35px (smaller than main page)
- Font size: 12px
- Same color coding as main tabs
- Click: Switches active verse
- No add/edit functionality (view-only)

**Chord Track** (Compact):
- Height: 50px
- Chord cards: 40px height, proportional width
- No drag/resize (view-only)
- Click: Highlights chord on fretboard (future feature)
- Tooltip: Shows chord name + notes

**Scale/Mode Track** (Compact):
- Height: 40px
- Scale cards: 30px height
- Shows scale name only (no score)
- Click: Loads scale onto fretboard
- Tooltip: Shows compatibility score + rationale

**Behavior**:
- **Sync with Main Builder**: Real-time updates when user edits in main builder
- **Click to Load**: Clicking a scale card loads it onto the fretboard
- **Visual Feedback**: Active chord/scale highlighted
- **Scroll**: Horizontal scroll if progression is long
- **Responsive**: Stacks vertically on mobile

**Integration**:
- Add new tab to existing fretboard tabbed area
- Tab label: "Song Timeline" with 🎵 icon
- Position: After "Chord Tones" tab
- Uses same tab styling as existing tabs

---

## 🔊 Audio Playback System (Tone.js)

### Overview

The audio playback system uses Tone.js to play chord progressions in real-time with selectable instruments (Guitar, Piano). It synchronizes with the timeline visualization to show playback progress.

### Audio Engine Architecture

**File**: `lib/chord-progression/audio-engine.ts`

```typescript
import * as Tone from 'tone';
import { ChordInstance, InstrumentType } from './types';

export class ChordProgressionAudioEngine {
  private synth: Tone.PolySynth | null = null;
  private part: Tone.Part | null = null;
  private currentInstrument: InstrumentType = 'piano';
  private isInitialized = false;

  constructor() {
    this.initializeSynth();
  }

  /**
   * Initialize Tone.js synthesizer based on selected instrument
   */
  private initializeSynth() {
    if (this.synth) {
      this.synth.dispose();
    }

    if (this.currentInstrument === 'piano') {
      // Piano: Clean, bright tone
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      }).toDestination();
      this.synth.volume.value = -8;
    } else if (this.currentInstrument === 'guitar') {
      // Guitar: Warmer, plucked tone
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.2,
          release: 1.5,
        },
      }).toDestination();
      this.synth.volume.value = -10;
    }

    this.isInitialized = true;
  }

  /**
   * Set instrument type and reinitialize synth
   */
  public setInstrument(instrument: InstrumentType) {
    this.currentInstrument = instrument;
    this.initializeSynth();
  }

  /**
   * Load chord progression into Tone.js Part
   */
  public loadProgression(chords: ChordInstance[], bpm: number) {
    Tone.Transport.bpm.value = bpm;

    if (this.part) {
      this.part.dispose();
    }

    // Convert ChordInstance to Tone.js events
    const events = chords.map(chord => ({
      time: `${chord.startTime}n`,      // 'n' = note value (beats)
      duration: `${chord.duration}n`,
      notes: chord.notes,
    }));

    // Create Tone.Part for scheduled playback
    this.part = new Tone.Part((time, event) => {
      this.synth?.triggerAttackRelease(event.notes, event.duration, time);
    }, events);

    // Calculate total duration for looping
    const totalDuration = this.getTotalDuration(chords);
    this.part.loop = true;
    this.part.loopEnd = `${totalDuration}n`;
  }

  /**
   * Start playback
   */
  public async play() {
    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
    Tone.Transport.start();
    this.part?.start(0);
  }

  /**
   * Pause playback
   */
  public pause() {
    Tone.Transport.pause();
  }

  /**
   * Stop playback and reset to start
   */
  public stop() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  /**
   * Seek to specific time (in beats)
   */
  public seek(beats: number) {
    Tone.Transport.position = `${beats}n`;
  }

  /**
   * Get current playback position (in beats)
   */
  public getCurrentTime(): number {
    const position = Tone.Transport.position;
    // Parse "bars:beats:sixteenths" format
    const [bars, beats] = position.toString().split(':').map(Number);
    return bars * 4 + beats; // Assuming 4/4 time
  }

  /**
   * Set BPM
   */
  public setBPM(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  /**
   * Calculate total duration of progression
   */
  private getTotalDuration(chords: ChordInstance[]): number {
    if (chords.length === 0) return 0;
    const lastChord = chords[chords.length - 1];
    return lastChord.startTime + lastChord.duration;
  }

  /**
   * Clean up resources
   */
  public dispose() {
    this.part?.dispose();
    this.synth?.dispose();
    Tone.Transport.stop();
  }
}
```

### Playback Hook

**File**: `hooks/chord-progression/useTimelinePlayback.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChordProgressionAudioEngine } from '@/lib/chord-progression/audio-engine';
import { ChordInstance, InstrumentType, PlaybackState } from '@/lib/chord-progression/types';

export function useTimelinePlayback(
  chords: ChordInstance[],
  bpm: number,
  pixelsPerBeat: number
) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    playbackPosition: 0,
    loopEnabled: true,
    loopStart: 0,
    loopEnd: 0,
  });

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  const audioEngineRef = useRef<ChordProgressionAudioEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new ChordProgressionAudioEngine();
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Load progression when chords or BPM change
  useEffect(() => {
    if (audioEngineRef.current && chords.length > 0) {
      audioEngineRef.current.loadProgression(chords, bpm);
    }
  }, [chords, bpm]);

  // Update instrument
  useEffect(() => {
    audioEngineRef.current?.setInstrument(selectedInstrument);
  }, [selectedInstrument]);

  // Animation loop to update playback position
  const updatePlaybackPosition = useCallback(() => {
    if (!audioEngineRef.current || !playbackState.isPlaying) return;

    const currentTime = audioEngineRef.current.getCurrentTime();
    const playbackPosition = currentTime * pixelsPerBeat;

    setPlaybackState(prev => ({
      ...prev,
      currentTime,
      playbackPosition,
    }));

    animationFrameRef.current = requestAnimationFrame(updatePlaybackPosition);
  }, [playbackState.isPlaying, pixelsPerBeat]);

  useEffect(() => {
    if (playbackState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updatePlaybackPosition);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playbackState.isPlaying, updatePlaybackPosition]);

  // Playback controls
  const play = useCallback(async () => {
    if (!audioEngineRef.current) return;
    await audioEngineRef.current.play();
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    audioEngineRef.current?.pause();
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    audioEngineRef.current?.stop();
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      playbackPosition: 0,
    }));
  }, []);

  const seek = useCallback((beats: number) => {
    audioEngineRef.current?.seek(beats);
    setPlaybackState(prev => ({
      ...prev,
      currentTime: beats,
      playbackPosition: beats * pixelsPerBeat,
    }));
  }, [pixelsPerBeat]);

  const replay = useCallback(async () => {
    stop();
    setTimeout(() => play(), 100);
  }, [stop, play]);

  return {
    playbackState,
    selectedInstrument,
    setSelectedInstrument,
    play,
    pause,
    stop,
    seek,
    replay,
  };
}
```

### Playback Synchronization

**Key Concepts**:
1. **Tone.Transport**: Global timeline for scheduling events
2. **Tone.Part**: Container for scheduled chord events
3. **requestAnimationFrame**: Smooth cursor animation (60 FPS)
4. **Position Calculation**: `playbackPosition = currentTime * pixelsPerBeat`

**Timing Accuracy**:
- Tone.js uses Web Audio API for precise timing
- Audio events scheduled ahead of time (lookahead)
- Visual cursor updated at 60 FPS for smooth animation
- Slight delay between audio and visual is acceptable (<16ms)

---

## 🎯 Drag & Drop System

### Overview

The drag & drop system allows users to:
1. **Move chords**: Drag to reposition in timeline
2. **Resize left**: Expand/shrink from left edge (pushes adjacent chords)
3. **Resize right**: Expand/shrink from right edge (overwrites adjacent chords)

### Technology: @dnd-kit

**Why @dnd-kit**:
- Modern, accessible, performant
- Built-in collision detection
- Smooth animations
- Touch support
- TypeScript-first

**Installation**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Drag Hook

**File**: `hooks/chord-progression/useChordDragResize.ts`

```typescript
import { useState, useCallback } from 'react';
import { DragState, ChordInstance } from '@/lib/chord-progression/types';

export function useChordDragResize(
  chords: ChordInstance[],
  onChordsUpdate: (chords: ChordInstance[]) => void,
  pixelsPerBeat: number,
  snapToGrid: boolean = true
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    chordId: null,
    startX: 0,
    startTime: 0,
    startDuration: 0,
  });

  /**
   * Snap value to nearest grid point
   */
  const snapValue = useCallback((value: number, gridSize: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid]);

  /**
   * Start drag operation
   */
  const handleDragStart = useCallback((
    chordId: string,
    dragType: 'move' | 'resize-left' | 'resize-right',
    startX: number
  ) => {
    const chord = chords.find(c => c.id === chordId);
    if (!chord) return;

    setDragState({
      isDragging: true,
      dragType,
      chordId,
      startX,
      startTime: chord.startTime,
      startDuration: chord.duration,
    });
  }, [chords]);

  /**
   * Handle drag movement
   */
  const handleDragMove = useCallback((currentX: number) => {
    if (!dragState.isDragging || !dragState.chordId) return;

    const deltaX = currentX - dragState.startX;
    const deltaBeats = deltaX / pixelsPerBeat;

    const updatedChords = chords.map(chord => {
      if (chord.id !== dragState.chordId) return chord;

      if (dragState.dragType === 'move') {
        // Move chord
        const newStartTime = snapValue(
          dragState.startTime + deltaBeats,
          0.25 // Snap to 1/4 beat
        );
        return {
          ...chord,
          startTime: Math.max(0, newStartTime),
          position: Math.max(0, newStartTime) * pixelsPerBeat,
        };
      } else if (dragState.dragType === 'resize-left') {
        // Resize from left (push mode)
        const newStartTime = snapValue(
          dragState.startTime + deltaBeats,
          0.25
        );
        const newDuration = dragState.startDuration - deltaBeats;

        if (newDuration < 0.25) return chord; // Min duration: 1/4 beat

        return {
          ...chord,
          startTime: newStartTime,
          duration: newDuration,
          position: newStartTime * pixelsPerBeat,
          width: newDuration * pixelsPerBeat,
        };
      } else if (dragState.dragType === 'resize-right') {
        // Resize from right (overwrite mode)
        const newDuration = snapValue(
          dragState.startDuration + deltaBeats,
          0.25
        );

        if (newDuration < 0.25) return chord; // Min duration: 1/4 beat

        return {
          ...chord,
          duration: newDuration,
          width: newDuration * pixelsPerBeat,
        };
      }

      return chord;
    });

    onChordsUpdate(updatedChords);
  }, [dragState, chords, pixelsPerBeat, snapValue, onChordsUpdate]);

  /**
   * End drag operation
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      chordId: null,
      startX: 0,
      startTime: 0,
      startDuration: 0,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
```

### Collision Detection

**Push Mode** (Resize Left):
- When expanding left, push adjacent chords to the left
- Maintain minimum gap of 0 beats (chords can be adjacent)
- Prevent overlapping

**Overwrite Mode** (Resize Right):
- When expanding right, allow overlapping
- Visual feedback: Semi-transparent overlay on overlapped area
- Warning icon if overlap detected

---

## 📱 Responsive Design

### Breakpoints

**Desktop** (1280px+):
- Full layout with all features
- Timeline: 60% of viewport height
- Generator: Side-by-side cards (3 columns)

**Tablet** (768px-1279px):
- Compact playback controls
- Timeline: 50% of viewport height
- Generator: 2 columns

**Mobile** (<768px):
- Stacked layout
- Timeline: Horizontal scroll, 40vh height
- Playback controls: Stacked vertically
- Generator: 1 column, full width
- Verse tabs: Horizontal scroll

### Touch Interactions

**Mobile Gestures**:
- **Tap**: Select chord/scale card
- **Long Press**: Open context menu
- **Swipe Left/Right**: Navigate between verses
- **Pinch**: Zoom timeline (future feature)
- **Two-Finger Drag**: Scroll timeline

**Accessibility**:
- All interactive elements: min 44px × 44px (touch target size)
- Focus indicators: 2px solid ring
- Keyboard navigation: Tab, Arrow keys, Enter, Escape
- Screen reader support: ARIA labels, roles, live regions

---

## 🔌 API Endpoints

### 1. Genre Progressions API

**Endpoint**: `GET /api/chord-progression/genre-progressions`

**Query Parameters**:
- `genre`: Genre name (required)
- `key`: Root note (required)
- `limit`: Number of results (default: 25)

**Response**:
```typescript
{
  genre: string;
  key: string;
  progressions: GeneratedProgression[];
}
```

**Implementation**:
```typescript
// app/api/chord-progression/genre-progressions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadGenreProgressions } from '@/lib/chord-progression/database-loader';
import { transposeProgression } from '@/lib/chord-progression/chord-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');
  const key = searchParams.get('key');
  const limit = parseInt(searchParams.get('limit') || '25');

  if (!genre || !key) {
    return NextResponse.json(
      { error: 'Genre and key are required' },
      { status: 400 }
    );
  }

  try {
    const database = await loadGenreProgressions();
    const genreData = database.genres[genre];

    if (!genreData) {
      return NextResponse.json(
        { error: `Genre "${genre}" not found` },
        { status: 404 }
      );
    }

    // Transpose progressions to requested key
    const progressions = genreData.progressions
      .slice(0, limit)
      .map(prog => transposeProgression(prog, key));

    return NextResponse.json({
      genre,
      key,
      progressions,
    });
  } catch (error) {
    console.error('Error loading genre progressions:', error);
    return NextResponse.json(
      { error: 'Failed to load progressions' },
      { status: 500 }
    );
  }
}
```

---

### 2. AI Generation API

**Endpoint**: `POST /api/chord-progression/ai-generate`

**Request Body**:
```typescript
{
  userContext: string;
  currentKey: string;
  genre?: string;
  mood?: string;
  tempo?: string;
}
```

**Response**:
```typescript
{
  progressions: GeneratedProgression[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}
```

**Implementation**:
```typescript
// app/api/chord-progression/ai-generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userContext, currentKey, genre, mood, tempo } = body;

    if (!userContext || !currentKey) {
      return NextResponse.json(
        { error: 'userContext and currentKey are required' },
        { status: 400 }
      );
    }

    const prompt = buildAIPrompt(userContext, currentKey, genre, mood, tempo);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional music theory assistant specializing in chord progressions. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '{}';
    const data = JSON.parse(responseText);

    return NextResponse.json({
      progressions: data.progressions || [],
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        estimatedCost: calculateCost(completion.usage),
      },
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate progressions' },
      { status: 500 }
    );
  }
}

function buildAIPrompt(
  userContext: string,
  currentKey: string,
  genre?: string,
  mood?: string,
  tempo?: string
): string {
  return `
Generate 5-10 chord progressions based on the following:

User Context: ${userContext}
Current Key: ${currentKey}
Genre: ${genre || 'Any'}
Mood: ${mood || 'Any'}
Tempo: ${tempo || 'Any'}

For each progression, provide:
1. Chord symbols in ${currentKey} (e.g., ["C", "Am", "F", "G"])
2. Roman numeral analysis (e.g., ["I", "vi", "IV", "V"])
3. A 2-3 sentence rationale explaining WHY this progression works for the user's context
4. Musical character description (e.g., "Melancholic yet hopeful")
5. Difficulty rating (1-5)
6. Scale recommendations for each chord (1-3 scales per chord)

Return as JSON:
{
  "progressions": [
    {
      "id": "unique-id",
      "name": "I-vi-IV-V",
      "chords": ["C", "Am", "F", "G"],
      "romanNumerals": ["I", "vi", "IV", "V"],
      "rationale": "...",
      "musicalCharacter": "...",
      "difficulty": 2,
      "scaleRecommendations": {
        "C": ["C Ionian", "C Major Pentatonic"],
        "Am": ["A Aeolian", "A Dorian"],
        "F": ["F Lydian"],
        "G": ["G Mixolydian"]
      }
    }
  ]
}
`;
}

function calculateCost(usage: any): number {
  if (!usage) return 0;
  // GPT-4o-mini pricing (as of 2025)
  const inputCost = (usage.prompt_tokens / 1000) * 0.00015;
  const outputCost = (usage.completion_tokens / 1000) * 0.0006;
  return inputCost + outputCost;
}
```

---

### 3. Save/Load Progressions API

**Endpoint**: `POST /api/chord-progression/save`

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  verses: VerseData[];
  tags?: string[];
  isPublic?: boolean;
}
```

**Response**:
```typescript
{
  id: string;
  message: string;
}
```

**Endpoint**: `GET /api/chord-progression/load/:id`

**Response**:
```typescript
{
  id: string;
  name: string;
  description: string;
  verses: VerseData[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 Additional Features & Enhancements

### 1. Chord Voicing Selection

**Feature**: Allow users to select different voicings for each chord

**UI**:
- Click on chord card → Opens voicing selector
- Shows 6-12 common voicings (from chord-db library)
- Each voicing: Chord diagram preview
- Tabs: "Open", "Barre", "Jazz", "Rootless"
- Selected voicing highlighted

**Implementation**:
- Use existing `calculateChordVoicings` from `lib/chord-voicings.ts`
- Store `voicingIndex` in `ChordInstance`
- Update audio engine to use selected voicing notes

---

### 2. Export Functionality

**Export Formats**:

**1. JSON** (for sharing/backup):
```json
{
  "name": "My Song",
  "verses": [...],
  "exportedAt": "2025-01-13T10:30:00Z"
}
```

**2. MIDI** (for DAWs):
- Convert chord progression to MIDI file
- Each chord = MIDI notes
- Tempo = BPM setting
- Use `@tonejs/midi` library

**3. PDF** (for printing):
- Chord chart format
- Shows chord symbols, diagrams, and timeline
- Use `jsPDF` library

**4. Text** (for lyrics/chords):
```
Verse 1 (Key: C Major, BPM: 120)
C       G       Am      F
[----][----][----][----]
```

---

### 3. Collaboration Features (Future)

**Real-Time Collaboration**:
- Multiple users edit same progression
- Use Supabase Realtime
- Show user cursors and selections
- Conflict resolution

**Sharing**:
- Generate shareable link
- Public/private toggle
- Embed code for websites
- Social media preview cards

---

### 4. Practice Mode

**Feature**: Loop specific sections for practice

**UI**:
- Loop markers on timeline (draggable)
- "Practice Mode" toggle
- Metronome click track
- Slow down tempo (50%, 75%, 90%)
- Count-in before playback

**Implementation**:
- Modify Tone.Transport loop points
- Add metronome synth (woodblock sound)
- Tempo slider with percentage display

---

### 5. Music Theory Insights

**Feature**: Show music theory analysis for progression

**Insights**:
- Key center analysis
- Functional harmony (Tonic, Subdominant, Dominant)
- Voice leading quality score
- Tension/resolution graph
- Common tone analysis
- Suggested variations

**UI**:
- Collapsible panel below timeline
- Visual graphs and charts
- Educational tooltips
- "Learn More" links to theory articles

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goals**: Set up basic structure and data models

**Tasks**:
1. Create page route (`app/chord-progression-builder/page.tsx`)
2. Define TypeScript interfaces (`lib/chord-progression/types.ts`)
3. Create Supabase table and RLS policies
4. Implement verse management hook (`useVerseManager.ts`)
5. Create main container component (`ChordProgressionBuilder.tsx`)
6. Build verse tabs UI (`VerseTabsManager.tsx`)
7. Set up localStorage persistence

**Deliverables**:
- Basic page with verse tabs
- Verse CRUD operations working
- Data persistence to localStorage
- TypeScript types defined

---

### Phase 2: Timeline Visualization (Week 3-4)

**Goals**: Build core timeline interface

**Tasks**:
1. Create timeline container (`TimelineVisualization.tsx`)
2. Implement time ruler component (`TimeRuler.tsx`)
3. Build chord progression track (`ChordProgressionTrack.tsx`)
4. Create chord card component (`ChordCard.tsx`)
5. Implement drag & resize hook (`useChordDragResize.ts`)
6. Add zoom controls
7. Implement grid snapping
8. Add scale/mode track (`ScaleModeTrack.tsx`)
9. Create scale/mode card (`ScaleModeCard.tsx`)

**Deliverables**:
- Functional timeline with draggable/resizable chords
- Zoom and grid controls working
- Visual feedback for all interactions
- Scale/mode track integrated

---

### Phase 3: Audio Playback (Week 5)

**Goals**: Implement Tone.js audio engine

**Tasks**:
1. Create audio engine (`audio-engine.ts`)
2. Implement playback controls (`PlaybackControls.tsx`)
3. Create playback cursor (`PlaybackCursor.tsx`)
4. Implement timeline playback hook (`useTimelinePlayback.ts`)
5. Add instrument selector (`InstrumentSelector.tsx`)
6. Sync cursor with audio playback
7. Add BPM control
8. Implement play/pause/stop/replay

**Deliverables**:
- Working audio playback with Piano and Guitar
- Playback cursor synced with audio
- BPM control functional
- Instrument switching working

---

### Phase 4: Chord Progression Generation (Week 6-7)

**Goals**: Build generation systems

**Tasks**:
1. Create genre progressions database JSON
2. Implement database loader (`database-loader.ts`)
3. Build genre-based generator (`GenreBasedGenerator.tsx`)
4. Create AI generator component (`AIAssistedGenerator.tsx`)
5. Implement AI generation API endpoint
6. Add genre progressions API endpoint
7. Build progression recommendation cards
8. Implement "Load Progression" functionality

**Deliverables**:
- Genre-based generation working (25 progressions per genre)
- AI-assisted generation functional
- Progression cards with detailed info
- Load progression into timeline

---

### Phase 5: Scale/Mode Integration (Week 8)

**Goals**: Integrate with existing scale recommendation system

**Tasks**:
1. Create scale/mode selector (`ScaleModeSelector.tsx`)
2. Implement "Add Scale/Mode" flow
3. Integrate with existing `CompatibleScalesSection`
4. Build scale recommendation modal
5. Implement multi-select functionality
6. Add scale/mode cards to timeline
7. Link scales to chords visually

**Deliverables**:
- Scale/mode selector working
- Integration with existing recommendation system
- Multi-select scales for chords
- Visual linking between chords and scales

---

### Phase 6: Compact Timeline Header (Week 9)

**Goals**: Create compact view for fretboard tab

**Tasks**:
1. Create compact timeline component (`CompactTimelineHeader.tsx`)
2. Add new tab to fretboard tabbed area
3. Implement real-time sync with main builder
4. Add click-to-load functionality
5. Optimize for mobile/responsive

**Deliverables**:
- Compact timeline in fretboard tab
- Real-time sync working
- Click to load scales onto fretboard
- Responsive design

---

### Phase 7: Polish & Optimization (Week 10)

**Goals**: Refine UX and optimize performance

**Tasks**:
1. Add animations (Framer Motion)
2. Implement keyboard shortcuts
3. Add tooltips and help text
4. Optimize rendering performance
5. Add error handling and validation
6. Implement undo/redo
7. Add confirmation modals
8. Write unit tests
9. Accessibility audit
10. Performance profiling

**Deliverables**:
- Smooth animations throughout
- Keyboard navigation working
- Comprehensive error handling
- Undo/redo functional
- Accessibility compliant
- Performance optimized

---

### Phase 8: Advanced Features (Week 11-12)

**Goals**: Add export, practice mode, and theory insights

**Tasks**:
1. Implement export functionality (JSON, MIDI, PDF, Text)
2. Build practice mode with loop markers
3. Add metronome and tempo control
4. Create music theory insights panel
5. Implement chord voicing selection
6. Add save/load to Supabase
7. Build user progression library
8. Add tags and search

**Deliverables**:
- Export to multiple formats
- Practice mode functional
- Theory insights panel
- Voicing selection working
- Cloud save/load
- Progression library

---

## 🎯 Success Metrics

### User Engagement
- **Time on Page**: Average 10+ minutes per session
- **Progressions Created**: 5+ per user per month
- **Return Rate**: 60%+ weekly active users

### Feature Adoption
- **Audio Playback**: 80%+ of users try playback
- **AI Generation**: 50%+ use AI generator
- **Scale Assignment**: 70%+ assign scales to chords
- **Export**: 30%+ export progressions

### Performance
- **Page Load**: <2 seconds
- **Timeline Render**: <100ms for 20 chords
- **Audio Latency**: <50ms
- **Drag Responsiveness**: 60 FPS

### Quality
- **Bug Rate**: <1% of sessions encounter errors
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile Usability**: 4.5+ star rating
- **User Satisfaction**: 4.5+ star rating

---

## 🔧 Technical Considerations

### Performance Optimization

**1. Virtual Scrolling**:
- Use `@tanstack/react-virtual` for long timelines
- Render only visible chord cards
- Improves performance for 50+ chord progressions

**2. Memoization**:
```typescript
const chordCards = useMemo(() => {
  return chords.map(chord => (
    <ChordCard key={chord.id} chord={chord} />
  ));
}, [chords]);
```

**3. Debouncing**:
- Debounce drag events (16ms)
- Debounce BPM changes (300ms)
- Debounce auto-save (2000ms)

**4. Code Splitting**:
```typescript
const AIAssistedGenerator = dynamic(
  () => import('@/components/chord-progression/AIAssistedGenerator'),
  { loading: () => <LoadingSpinner /> }
);
```

---

### Error Handling

**1. Audio Engine Errors**:
- Graceful fallback if Tone.js fails to initialize
- Show error message with troubleshooting steps
- Offer "Reload Audio Engine" button

**2. API Errors**:
- Retry logic with exponential backoff
- Show user-friendly error messages
- Log errors to monitoring service (Sentry)

**3. Data Validation**:
- Validate chord symbols before adding
- Prevent invalid BPM values (60-240)
- Ensure minimum chord duration (0.25 beats)

---

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills**:
- Web Audio API (built into Tone.js)
- ResizeObserver (for timeline responsiveness)
- IntersectionObserver (for virtual scrolling)

---

## 📚 Resources & References

### Libraries
- **Tone.js**: https://tonejs.github.io/
- **@dnd-kit**: https://dndkit.com/
- **Framer Motion**: https://www.framer.com/motion/
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand-demo.pmnd.rs/

### Music Theory
- **Chord Progressions**: https://www.musictheory.net/lessons/57
- **Voice Leading**: https://www.musictheory.net/lessons/52
- **Functional Harmony**: https://www.musictheory.net/lessons/54

### Design Inspiration
- **Adobe Premiere Pro**: Timeline UI
- **Ableton Live**: Clip-based arrangement
- **Logic Pro**: Piano roll and arrangement view
- **Hookpad**: Chord progression builder

---

## ✅ Completion Checklist

### Core Features
- [ ] Verse management system
- [ ] Timeline visualization
- [ ] Chord card drag & drop
- [ ] Chord card resize (left/right)
- [ ] Scale/mode track
- [ ] Audio playback (Piano)
- [ ] Audio playback (Guitar)
- [ ] Playback cursor animation
- [ ] BPM control
- [ ] Genre-based generator
- [ ] AI-assisted generator
- [ ] Compact timeline header

### UI/UX
- [ ] Verse tabs with key selection
- [ ] Time ruler with beat markers
- [ ] Zoom controls
- [ ] Grid snapping
- [ ] Context menus
- [ ] Modals (edit chord, select scale, etc.)
- [ ] Tooltips
- [ ] Loading states
- [ ] Error states
- [ ] Success toasts

### Data & APIs
- [ ] TypeScript interfaces
- [ ] Supabase schema
- [ ] Genre progressions database
- [ ] Genre progressions API
- [ ] AI generation API
- [ ] Save/load API
- [ ] Database loader utilities
- [ ] Chord utilities

### Performance
- [ ] Virtual scrolling
- [ ] Memoization
- [ ] Debouncing
- [ ] Code splitting
- [ ] Image optimization

### Accessibility
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Screen reader support
- [ ] Touch target sizes
- [ ] Color contrast

### Testing
- [ ] Unit tests (hooks)
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Accessibility tests
- [ ] Performance tests

### Documentation
- [ ] Component documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Deployment guide

---

## 🎉 Conclusion

This comprehensive blueprint provides all the specifications needed to build a professional-grade Chord Progression Builder system for the Musical Insights webapp. The system combines intuitive visual design, powerful music theory features, and modern web technologies to create a valuable tool for musicians of all skill levels.

**Key Highlights**:
- **Timeline-based interface** inspired by professional video editing software
- **Real-time audio playback** with Tone.js (Guitar and Piano instruments)
- **AI-powered generation** for contextual chord progression recommendations
- **Genre-based database** with 25+ progressions per genre
- **Scale/mode integration** with existing recommendation system
- **Responsive design** optimized for desktop, tablet, and mobile
- **Accessible** with keyboard navigation and screen reader support

**Next Steps**:
1. Review and approve blueprint
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on user feedback
5. Launch and monitor metrics

---

**Blueprint Version**: 1.0.0
**Last Updated**: 2025-01-13
**Author**: AI Development Team
**Status**: Ready for Implementation

