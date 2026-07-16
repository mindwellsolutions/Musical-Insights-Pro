# Chord-Scale Recommendation System Blueprint

## 🎯 Overview

This blueprint defines a comprehensive system for bidirectional chord-scale recommendations, allowing musicians to:
1. **Select a chord** → Get recommended compatible scales/modes
2. **Select a key/scale** → Get recommended chords and progressions
3. **Build progressions** → Get context-aware recommendations as they navigate
4. **Analyze song progressions** → Dynamic recommendations based on "Add to Song" list

---

## 📊 System Architecture

### Core Features

#### Feature 1: Chord → Scale Recommendations
- User selects any chord from ChordLibrary
- System displays compatible scales/modes sorted by compatibility score
- Shows chord tones, tensions, avoid notes
- Click scale to apply to fretboard
- Option to add chord+scale combo to song

#### Feature 2: Key/Scale → Chord Recommendations
- Based on current key and scale selection
- Shows three categories:
  - **Diatonic Chords**: Always safe, in-key chords
  - **Extended Chords**: Jazz voicings (7ths, 9ths, 11ths, 13ths)
  - **Modal Interchange**: Color chords from parallel modes
- Click chord to highlight on fretboard

#### Feature 3: Chord Progression Recommendations
- Common progressions for current key
- Filter by genre (Rock, Jazz, Blues, Pop, etc.)
- Filter by difficulty (1-5 stars)
- "Load Progression" button adds all chords to song list
- Each chord shows compatible scales

#### Feature 4: Dynamic Song Progression Analysis
- Monitors current position in "Add to Song" list
- Real-time recommendations as user navigates (prev/next)
- Shows:
  - Next chord suggestions based on music theory
  - Compatible scales for current chord
  - Progression type analysis
- Context-aware based on previous chords

---

## 🗄️ Data Structure

### New JSON Database Files

#### 1. Chord-Scale Compatibility Database
**Location**: `public/data/chord-scale-compatibility/`

**Structure**:
```json
{
  "chordQuality": "maj7",
  "chordSymbol": "Cmaj7",
  "fullName": "C Major 7th",
  "notes": ["C", "E", "G", "B"],
  "compatibleScales": [
    {
      "scaleName": "Ionian (Major)",
      "rootNote": "C",
      "compatibilityScore": 10,
      "relationship": "Perfect tonal match - chord is built from scale",
      "musicalContext": "The Ionian mode is the parent scale of this chord",
      "chordTones": ["C", "E", "G", "B"],
      "tensions": ["D (9th)", "F# (13th)"],
      "avoidNotes": ["F (11th)"],
      "musicGenreRecommendations": "Jazz, Pop, R&B, Soul",
      "difficultyLevel": 1
    },
    {
      "scaleName": "Lydian",
      "rootNote": "C",
      "compatibilityScore": 9,
      "relationship": "Bright, uplifting sound with raised 4th",
      "musicalContext": "Creates a dreamy, floating quality over maj7 chords",
      "chordTones": ["C", "E", "G", "B"],
      "tensions": ["D (9th)", "F# (#11th)", "A (13th)"],
      "avoidNotes": [],
      "musicGenreRecommendations": "Jazz, Fusion, Film Score",
      "difficultyLevel": 3
    }
  ]
}
```

**Files**:
- `index.json` - Master index of all chord types
- `major.json` - Major triads
- `minor.json` - Minor triads
- `dominant7.json` - Dominant 7th chords
- `major7.json` - Major 7th chords
- `minor7.json` - Minor 7th chords
- ... (one file per chord quality, 24 total)

#### 2. Chord Recommendations Database
**Location**: `public/data/chord-recommendations/`

**Structure**:
```json
{
  "key": "C",
  "scale": "Ionian",
  "quality": "major",
  "diatonicChords": [
    {
      "degree": "I",
      "symbol": "C",
      "fullName": "C Major",
      "quality": "major",
      "notes": ["C", "E", "G"],
      "function": "Tonic - Home base, resolution",
      "commonUse": "Start and end progressions",
      "compatibilityScore": 10
    }
  ],
  "extendedChords": [
    {
      "degree": "Imaj7",
      "symbol": "Cmaj7",
      "fullName": "C Major 7th",
      "quality": "maj7",
      "notes": ["C", "E", "G", "B"],
      "function": "Tonic with color",
      "commonUse": "Jazz, R&B, sophisticated pop",
      "compatibilityScore": 9
    }
  ],
  "modalInterchangeChords": [
    {
      "degree": "bVII",
      "symbol": "Bb",
      "fullName": "Bb Major",
      "quality": "major",
      "notes": ["Bb", "D", "F"],
      "borrowedFrom": "C Mixolydian",
      "function": "Subtonic - creates tension",
      "commonUse": "Rock, blues, modal jazz",
      "compatibilityScore": 7
    }
  ]
}
```

**Files**: One per key-scale combination (e.g., `c-ionian.json`, `c-dorian.json`, etc.)

#### 3. Progression Recommendations Database
**Location**: `public/data/progression-recommendations/`

**Structure**:
```json
{
  "key": "C",
  "progressions": [
    {
      "id": "i-iv-v-i",
      "name": "I-IV-V-I",
      "description": "The foundation of rock, blues, and country music",
      "chords": ["C", "F", "G", "C"],
      "romanNumerals": ["I", "IV", "V", "I"],
      "genre": ["Rock", "Blues", "Country", "Folk"],
      "difficulty": 1,
      "musicalCharacter": "Strong, resolute, optimistic",
      "famousSongs": ["La Bamba", "Twist and Shout", "Wild Thing"],
      "scaleRecommendations": {
        "C": [
          {
            "scaleName": "C Major Pentatonic",
            "compatibilityScore": 10,
            "usage": "Safe, always works"
          },
          {
            "scaleName": "C Ionian",
            "compatibilityScore": 10,
            "usage": "Full major scale"
          }
        ],
        "F": [
          {
            "scaleName": "F Lydian",
            "compatibilityScore": 9,
            "usage": "Bright, uplifting"
          }
        ]
      }
    }
  ]
}
```

**Files**: One per root note (12 files: `c.json`, `c-sharp.json`, `d.json`, etc.)

---

## 🔧 Technical Implementation

### Phase 1: Data Generation Scripts

#### Script 1: Generate Chord-Scale Compatibility
**File**: `scripts/generateChordScaleCompatibility.ts`

**Purpose**: Extract scaleCompatibility data from existing chord-progression-database.json files and create reverse mappings.

**Process**:
1. Read all `music-theory/chord-progressions/*.json` files
2. For each chord, extract its `scaleCompatibility` array
3. Group by chord quality (maj, min, dom7, maj7, etc.)
4. Create reverse mapping: chord quality → compatible scales
5. Output to `public/data/chord-scale-compatibility/[quality].json`

**Key Logic**:
```typescript
// Pseudo-code
for each key in [A, A#, B, C, ...] {
  load chord-progression-database for key
  for each chord in database.chords {
    extract chord.scaleCompatibility
    group by chord.quality
    add to compatibility map
  }
}

// Output structure per chord quality
{
  chordQuality: "maj7",
  compatibleScales: [
    // Aggregated from all keys
    { scaleName, rootNote, compatibilityScore, ... }
  ]
}
```

#### Script 2: Generate Chord Recommendations
**File**: `scripts/generateChordRecommendations.ts`

**Purpose**: Create recommended chords for each key-scale combination.

**Process**:
1. For each key (12 notes)
2. For each scale/mode (Ionian, Dorian, Phrygian, etc.)
3. Calculate diatonic chords using scale intervals
4. Add extended chord voicings (7ths, 9ths, etc.)
5. Add modal interchange chords from parallel modes
6. Output to `public/data/chord-recommendations/[key]-[scale].json`

**Key Logic**:
```typescript
// Diatonic chords: harmonize each scale degree
const scaleNotes = getScaleNotes(key, scale);
const diatonicChords = scaleNotes.map((note, degree) => {
  return buildTriad(note, scale, degree);
});

// Extended chords: add 7ths, 9ths, etc.
const extendedChords = diatonicChords.map(chord => {
  return addExtensions(chord, [7, 9, 11, 13]);
});

// Modal interchange: borrow from parallel modes
const modalInterchange = getParallelModeChords(key);
```

#### Script 3: Generate Progression Recommendations
**File**: `scripts/generateProgressionRecommendations.ts`

**Purpose**: Extract and enhance common progressions from existing data.

**Process**:
1. Read `commonProgressions` from existing chord-progression-database.json files
2. Enhance with scale recommendations for each chord
3. Add genre tags, difficulty ratings, famous songs
4. Output to `public/data/progression-recommendations/[root-note].json`

**Key Logic**:
```typescript
// Extract existing progressions
const progressions = database.commonProgressions;

// Enhance with scale recommendations
progressions.forEach(prog => {
  prog.scaleRecommendations = {};
  prog.chords.forEach(chord => {
    prog.scaleRecommendations[chord] = getCompatibleScales(chord);
  });
});
```

---

### Phase 2: API Routes

#### API Route 1: Chord-Scale Compatibility
**File**: `app/api/chord-scale-compatibility/route.ts`

**Endpoint**: `GET /api/chord-scale-compatibility?chord=Cmaj7&key=C`

**Query Parameters**:
- `chord` (required): Chord symbol (e.g., "Cmaj7", "Dm7", "G7")
- `key` (optional): Musical key for context
- `limit` (optional): Max results (default: 12)
- `minScore` (optional): Minimum compatibility score (default: 5)

**Response**:
```json
{
  "chord": "Cmaj7",
  "chordQuality": "maj7",
  "compatibleScales": [
    {
      "scaleName": "Ionian (Major)",
      "rootNote": "C",
      "compatibilityScore": 10,
      "relationship": "Perfect tonal match",
      "musicalContext": "...",
      "chordTones": ["C", "E", "G", "B"],
      "tensions": ["D (9th)", "A (13th)"],
      "avoidNotes": ["F (11th)"],
      "difficultyLevel": 1
    }
  ]
}
```

#### API Route 2: Chord Recommendations
**File**: `app/api/chord-recommendations/route.ts`

**Endpoint**: `GET /api/chord-recommendations?key=C&scale=Ionian`

**Query Parameters**:
- `key` (required): Musical key (e.g., "C", "D", "F#")
- `scale` (required): Scale/mode name (e.g., "Ionian", "Dorian")
- `category` (optional): Filter by category (diatonic, extended, modalInterchange)

**Response**:
```json
{
  "key": "C",
  "scale": "Ionian",
  "diatonicChords": [...],
  "extendedChords": [...],
  "modalInterchangeChords": [...]
}
```

#### API Route 3: Progression Recommendations
**File**: `app/api/progression-recommendations/route.ts`

**Endpoint**: `GET /api/progression-recommendations?key=C&genre=Rock&difficulty=1`

**Query Parameters**:
- `key` (required): Musical key
- `genre` (optional): Filter by genre
- `difficulty` (optional): Filter by difficulty (1-5)
- `limit` (optional): Max results (default: 10)

**Response**:
```json
{
  "key": "C",
  "progressions": [
    {
      "id": "i-iv-v-i",
      "name": "I-IV-V-I",
      "chords": ["C", "F", "G", "C"],
      "romanNumerals": ["I", "IV", "V", "I"],
      "genre": ["Rock", "Blues"],
      "difficulty": 1,
      "scaleRecommendations": {...}
    }
  ]
}
```

---

### Phase 3: Service Layer

#### Service 1: Chord-Scale Compatibility
**File**: `lib/chord-scale-compatibility/service.ts`

**Functions**:
```typescript
// Get compatible scales for a chord
export async function getCompatibleScalesForChord(
  chord: string,
  key?: string,
  limit: number = 12,
  minScore: number = 5
): Promise<ChordScaleCompatibility[]>

// Parse chord symbol to extract quality
export function getChordQuality(chordSymbol: string): string

// Calculate compatibility score between chord and scale
export function calculateChordScaleCompatibility(
  chordNotes: string[],
  scaleNotes: string[]
): number
```

**Types** (`lib/chord-scale-compatibility/types.ts`):
```typescript
export interface ChordScaleCompatibility {
  scaleName: string;
  rootNote: string;
  compatibilityScore: number;
  relationship: string;
  musicalContext: string;
  chordTones: string[];
  tensions: string[];
  avoidNotes: string[];
  musicGenreRecommendations: string;
  difficultyLevel: number;
}

export interface ChordInfo {
  chordQuality: string;
  chordSymbol: string;
  fullName: string;
  notes: string[];
}
```

#### Service 2: Chord Recommendations
**File**: `lib/chord-recommendations/service.ts`

**Functions**:
```typescript
// Get recommended chords for key/scale
export async function getRecommendedChords(
  key: string,
  scale: string,
  category?: 'diatonic' | 'extended' | 'modalInterchange'
): Promise<ChordRecommendations>

// Get diatonic chords for a scale
export function getDiatonicChords(
  key: string,
  scale: string
): ChordRecommendation[]

// Get modal interchange chords
export function getModalInterchangeChords(
  key: string
): ChordRecommendation[]
```

**Types** (`lib/chord-recommendations/types.ts`):
```typescript
export interface ChordRecommendation {
  degree: string;
  symbol: string;
  fullName: string;
  quality: string;
  notes: string[];
  function: string;
  commonUse: string;
  compatibilityScore: number;
  borrowedFrom?: string; // For modal interchange
}

export interface ChordRecommendations {
  key: string;
  scale: string;
  diatonicChords: ChordRecommendation[];
  extendedChords: ChordRecommendation[];
  modalInterchangeChords: ChordRecommendation[];
}
```

#### Service 3: Progression Analyzer
**File**: `lib/progression-analyzer/service.ts`

**Functions**:
```typescript
// Analyze a chord progression
export function analyzeProgression(
  chords: string[],
  key: string
): ProgressionAnalysis

// Suggest next chord based on current context
export function suggestNextChord(
  currentChord: string,
  previousChords: string[],
  key: string
): ChordSuggestion[]

// Get progression context from song list
export function getProgressionContext(
  songList: ManualSelection[],
  currentIndex: number
): ProgressionContext
```

**Types** (`lib/progression-analyzer/types.ts`):
```typescript
export interface ProgressionAnalysis {
  type: string; // "I-IV-V", "ii-V-I", etc.
  genre: string[];
  strength: number; // 1-10
  suggestions: string[];
}

export interface ChordSuggestion {
  chord: string;
  probability: number;
  reason: string;
  compatibleScales: string[];
}

export interface ProgressionContext {
  currentChord: string;
  previousChords: string[];
  nextSuggestions: ChordSuggestion[];
  compatibleScales: ChordScaleCompatibility[];
  progressionType: string;
}
```

---

### Phase 4: React Components

#### Component 1: ChordScaleRecommendations
**File**: `components/ChordScaleRecommendations.tsx`

**Purpose**: Display compatible scales for a selected chord

**Props**:
```typescript
interface ChordScaleRecommendationsProps {
  selectedChord: string | null; // e.g., "Cmaj7"
  currentKey?: string; // Optional context
  theme: ThemeConfig;
  onScaleSelect: (scaleName: string, rootNote: string) => void;
}
```

**UI Structure**:
```
┌─────────────────────────────────────────────────────┐
│ Compatible Scales for Cmaj7                    [▼] │
│ Click a scale to apply to fretboard                │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Ionian   │ │ Lydian   │ │ Mixo-    │ │ Dorian   ││
│ │ Root: C  │ │ Root: C  │ │ lydian   │ │ Root: D  ││
│ │ ⭐ 10.0  │ │ ⭐ 9.0   │ │ Root: G  │ │ ⭐ 8.5   ││
│ │          │ │          │ │ ⭐ 8.8   │ │          ││
│ │ Perfect  │ │ Bright & │ │ Jazzy    │ │ Smooth & ││
│ │ match    │ │ uplifting│ │ sound    │ │ soulful  ││
│ │          │ │          │ │          │ │          ││
│ │ [C][E]   │ │ [C][E]   │ │ [G][B]   │ │ [D][F]   ││
│ │ [G][B]   │ │ [G][B]   │ │ [D][F]   │ │ [A][C]   ││
│ │          │ │          │ │          │ │          ││
│ │ 🎸 Jazz  │ │ 🎸 Fusion│ │ 🎸 Jazz  │ │ 🎸 Blues ││
│ │ Pop R&B  │ │ Film     │ │ Funk     │ │ Rock     ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────┘
```

**Features**:
- Fetches data from `/api/chord-scale-compatibility`
- Displays top 8-12 compatible scales
- Sorted by compatibility score
- Uses ScaleRecommendationCard (existing component)
- Collapsible section
- Responsive grid (1-4 columns)

#### Component 2: ChordRecommendations
**File**: `components/ChordRecommendations.tsx`

**Purpose**: Display recommended chords for current key/scale

**Props**:
```typescript
interface ChordRecommendationsProps {
  currentKey: string;
  currentScale: string;
  theme: ThemeConfig;
  selectedChordNotes: string[] | null;
  onChordSelect: (notes: string[], guideTones: string[]) => void;
}
```

**UI Structure**:
```
┌─────────────────────────────────────────────────────┐
│ Recommended Chords for C Ionian                [▼] │
│ Click a chord to highlight on fretboard            │
├─────────────────────────────────────────────────────┤
│ Diatonic Chords (Always Safe)                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │  C   │ │  Dm  │ │  Em  │ │  F   │ │  G   │      │
│ │  I   │ │  ii  │ │ iii  │ │  IV  │ │  V   │      │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                                     │
│ Extended Chords (Jazz/Advanced)                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │Cmaj7 │ │ Dm7  │ │ Em7  │ │Fmaj7 │               │
│ │Imaj7 │ │ iim7 │ │iiim7 │ │IVmaj7│               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                     │
│ Modal Interchange (Color Chords)                   │
│ ┌──────┐ ┌──────┐ ┌──────┐                        │
│ │  Bb  │ │  Fm  │ │  Ab  │                        │
│ │ bVII │ │  iv  │ │ bVI  │                        │
│ └──────┘ └──────┘ └──────┘                        │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Fetches data from `/api/chord-recommendations`
- Three collapsible sections (Diatonic, Extended, Modal Interchange)
- Uses existing chord card styling from ChordProgressions
- Click to highlight on fretboard
- "Add to Song" button on each chord

#### Component 3: ChordProgressionRecommendations
**File**: `components/ChordProgressionRecommendations.tsx`

**Purpose**: Display common chord progressions for current key

**Props**:
```typescript
interface ChordProgressionRecommendationsProps {
  currentKey: string;
  theme: ThemeConfig;
  onLoadProgression: (chords: string[]) => void;
}
```

**UI Structure**:
```
┌─────────────────────────────────────────────────────┐
│ Common Chord Progressions in C                 [▼] │
│ Load a progression to add all chords to your song  │
├─────────────────────────────────────────────────────┤
│ Filters: [All Genres ▼] [All Difficulties ▼]       │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ I-IV-V-I                              ★☆☆☆☆   │ │
│ │ The foundation of rock, blues, country         │ │
│ │                                                 │ │
│ │ C → F → G → C                                  │ │
│ │ I   IV  V   I                                  │ │
│ │                                                 │ │
│ │ 🎸 Rock • Blues • Country                      │ │
│ │ 🎵 La Bamba, Twist and Shout, Wild Thing       │ │
│ │                                                 │ │
│ │ [Load Progression]                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ I-V-vi-IV                             ★☆☆☆☆   │ │
│ │ Pop progression (Axis progression)             │ │
│ │                                                 │ │
│ │ C → G → Am → F                                 │ │
│ │ I   V   vi   IV                                │ │
│ │                                                 │ │
│ │ 🎸 Pop • Rock • Indie                          │ │
│ │ 🎵 Let It Be, No Woman No Cry, With or Without │ │
│ │                                                 │ │
│ │ [Load Progression]                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Fetches data from `/api/progression-recommendations`
- Filter by genre and difficulty
- Shows progression name, chords, roman numerals
- Genre tags and famous songs
- "Load Progression" button adds all chords to song list
- Expandable to show scale recommendations per chord

#### Component 4: DynamicRecommendationPanel
**File**: `components/DynamicRecommendationPanel.tsx`

**Purpose**: Context-aware recommendations based on song progression

**Props**:
```typescript
interface DynamicRecommendationPanelProps {
  songList: ManualSelection[];
  currentIndex: number;
  theme: ThemeConfig;
  onChordSelect: (chord: string) => void;
  onScaleSelect: (scale: string, root: string) => void;
}
```

**UI Structure**:
```
┌─────────────────────────────────────────────────────┐
│ Smart Recommendations                           [▼] │
│ Based on your current progression                  │
├─────────────────────────────────────────────────────┤
│ Current: C Major (Position 2 of 5)                 │
│ Previous: Dm Dorian                                 │
├─────────────────────────────────────────────────────┤
│ Next Chord Suggestions                              │
│ ┌──────┐ ┌──────┐ ┌──────┐                        │
│ │  F   │ │  G   │ │  Am  │                        │
│ │ 85%  │ │ 75%  │ │ 60%  │                        │
│ │ IV   │ │  V   │ │  vi  │                        │
│ └──────┘ └──────┘ └──────┘                        │
│                                                     │
│ Compatible Scales for C                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Ionian   │ │ Lydian   │ │ Mixo-    │            │
│ │ ⭐ 10.0  │ │ ⭐ 9.0   │ │ lydian   │            │
│ │          │ │          │ │ ⭐ 8.5   │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ Progression Analysis                                │
│ Type: I-ii-I (Common in Jazz)                      │
│ Strength: ████████░░ 8/10                          │
│ Suggestion: Add V chord for resolution             │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Monitors current position in song list
- Updates in real-time on prev/next navigation
- Shows next chord suggestions with probability
- Shows compatible scales for current chord
- Analyzes progression type and strength
- Provides musical suggestions

#### Component 5: Reusable Card Components

**ChordRecommendationCard.tsx**:
```typescript
interface ChordRecommendationCardProps {
  chord: ChordRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  theme: ThemeConfig;
}
```

**ProgressionCard.tsx**:
```typescript
interface ProgressionCardProps {
  progression: ProgressionRecommendation;
  theme: ThemeConfig;
  onLoad: () => void;
  onExpand?: () => void;
}
```

---

### Phase 5: Integration & State Management

#### Update ManualSelection Type
**File**: `components/ManualSelectionList.tsx`

```typescript
export interface ManualSelection {
  id: string;
  key: string;
  scaleName: string;
  chord?: string; // NEW: Optional chord info
  chordQuality?: string; // NEW: Chord quality
}
```

#### Update Main Page State
**File**: `app/page.tsx`

Add new state variables:
```typescript
// Chord selection mode
const [isChordMode, setIsChordMode] = useState(false);
const [selectedChord, setSelectedChord] = useState<string | null>(null);

// Recommendation visibility
const [showChordScaleRecs, setShowChordScaleRecs] = useState(false);
const [showChordRecs, setShowChordRecs] = useState(true);
const [showProgressionRecs, setShowProgressionRecs] = useState(false);
const [showDynamicRecs, setShowDynamicRecs] = useState(true);
```

Add handlers:
```typescript
const handleChordSelect = useCallback((chord: string) => {
  setSelectedChord(chord);
  setShowChordScaleRecs(true);
}, []);

const handleLoadProgression = useCallback((chords: string[]) => {
  const newSelections = chords.map(chord => ({
    id: `${Date.now()}-${Math.random()}`,
    key: chord.replace(/[^A-G#]/g, ''), // Extract root note
    scaleName: 'Major', // Default
    chord: chord,
  }));
  setManualSelections([...manualSelections, ...newSelections]);
}, [manualSelections]);
```

#### Layout Integration
**File**: `app/page.tsx`

Add new sections to main layout:
```tsx
{/* Mode Toggle */}
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setIsChordMode(false)}
    className={isChordMode ? 'inactive' : 'active'}
  >
    Scale Mode
  </button>
  <button
    onClick={() => setIsChordMode(true)}
    className={isChordMode ? 'active' : 'inactive'}
  >
    Chord Mode
  </button>
</div>

{/* Conditional Rendering */}
{!isChordMode && (
  <>
    {/* Existing scale-based components */}
    <ChordProgressions ... />
    <ChordRecommendations
      currentKey={rootNote}
      currentScale={scaleName}
      theme={theme}
      selectedChordNotes={selectedChordNotes}
      onChordSelect={handleChordSelect}
    />
  </>
)}

{isChordMode && selectedChord && (
  <ChordScaleRecommendations
    selectedChord={selectedChord}
    currentKey={rootNote}
    theme={theme}
    onScaleSelect={handleScaleSelect}
  />
)}

{/* Always show progression recommendations */}
<ChordProgressionRecommendations
  currentKey={rootNote}
  theme={theme}
  onLoadProgression={handleLoadProgression}
/>

{/* Dynamic recommendations in sidebar */}
{manualSelections.length > 0 && (
  <DynamicRecommendationPanel
    songList={manualSelections}
    currentIndex={currentSelectionIndex}
    theme={theme}
    onChordSelect={handleChordSelect}
    onScaleSelect={handleScaleSelect}
  />
)}
```

---

## 🎨 Visual Design Specifications

### Color Scheme
All components use existing ThemeConfig:
- **Card Background**: `theme.bgTertiary`
- **Card Border**: `theme.border`
- **Selected Border**: `theme.buttonPrimary` (2px solid)
- **Text Primary**: `theme.textPrimary`
- **Text Secondary**: `theme.textSecondary`
- **Accent**: `theme.accentPrimary`

### Card Styling Pattern
```css
.recommendation-card {
  background: theme.bgTertiary;
  border: 2px solid theme.border;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recommendation-card.selected {
  border-color: theme.buttonPrimary;
  box-shadow: 0 0 20px rgba(theme.buttonPrimary, 0.3);
  transform: translateY(-4px);
}
```

### Typography
- **Card Title**: 18px, bold, `theme.textPrimary`
- **Subtitle**: 14px, medium, `theme.textSecondary`
- **Body Text**: 13px, regular, `theme.textSecondary`
- **Score Badge**: 16px, bold, white on `theme.accentPrimary`

### Responsive Grid
```css
.recommendation-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 768px) {
  .recommendation-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .recommendation-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}

@media (min-width: 1280px) {
  .recommendation-grid {
    grid-template-columns: repeat(4, 1fr); /* Large */
  }
}
```

### Icons & Badges
- **Genre Badges**: Rounded-full, 11px text, `theme.bgSecondary` background
- **Difficulty Stars**: ★★★☆☆ (filled: #fbbf24, empty: #333)
- **Score Badge**: Circular, top-right corner, gradient background
- **Icons**: lucide-react (Music, Guitar, TrendingUp, etc.)

### Note Badges
Use existing `NOTE_COLORS` from `lib/musicTheory.ts`:
```tsx
<div
  className="note-badge"
  style={{
    backgroundColor: NOTE_COLORS[note],
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  }}
>
  {getNoteDisplayName(note)}
</div>
```

---

## 📋 Implementation Checklist

### Phase 1: Data Layer ✓
- [ ] Create `scripts/generateChordScaleCompatibility.ts`
- [ ] Create `scripts/generateChordRecommendations.ts`
- [ ] Create `scripts/generateProgressionRecommendations.ts`
- [ ] Run scripts to generate JSON databases
- [ ] Verify data integrity and completeness

### Phase 2: API Layer ✓
- [ ] Create `app/api/chord-scale-compatibility/route.ts`
- [ ] Create `app/api/chord-recommendations/route.ts`
- [ ] Create `app/api/progression-recommendations/route.ts`
- [ ] Test all API endpoints
- [ ] Add error handling and validation

### Phase 3: Service Layer ✓
- [ ] Create `lib/chord-scale-compatibility/types.ts`
- [ ] Create `lib/chord-scale-compatibility/service.ts`
- [ ] Create `lib/chord-recommendations/types.ts`
- [ ] Create `lib/chord-recommendations/service.ts`
- [ ] Create `lib/progression-analyzer/types.ts`
- [ ] Create `lib/progression-analyzer/service.ts`
- [ ] Write unit tests for services

### Phase 4: Components ✓
- [ ] Create `components/ChordScaleRecommendations.tsx`
- [ ] Create `components/ChordRecommendations.tsx`
- [ ] Create `components/ChordProgressionRecommendations.tsx`
- [ ] Create `components/DynamicRecommendationPanel.tsx`
- [ ] Create `components/cards/ChordRecommendationCard.tsx`
- [ ] Create `components/cards/ProgressionCard.tsx`
- [ ] Test component rendering and interactions

### Phase 5: Integration ✓
- [ ] Update `ManualSelection` type
- [ ] Add state management to `app/page.tsx`
- [ ] Integrate components into main layout
- [ ] Add mode toggle (Scale Mode / Chord Mode)
- [ ] Test end-to-end user flows
- [ ] Verify responsive design on all devices

### Phase 6: Polish & Testing ✓
- [ ] Add loading states and skeletons
- [ ] Add error boundaries
- [ ] Optimize performance (memoization, lazy loading)
- [ ] Add animations and transitions
- [ ] Cross-browser testing
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] User testing and feedback

---

## 🚀 Future Enhancements

1. **AI-Powered Suggestions**: Use ML to learn user preferences
2. **Custom Progressions**: Allow users to save custom progressions
3. **Progression Playback**: Audio preview of progressions
4. **Collaboration**: Share progressions with other users
5. **MIDI Integration**: Load progressions from MIDI files
6. **Export**: Export progressions to various formats (MIDI, PDF, etc.)

---

## 📊 Success Metrics

- **User Engagement**: Time spent using recommendation features
- **Adoption Rate**: % of users who use chord-scale recommendations
- **Progression Usage**: Number of progressions loaded per session
- **Feature Discovery**: % of users who find and use all features
- **User Satisfaction**: Feedback scores and ratings

---

**End of Blueprint**


