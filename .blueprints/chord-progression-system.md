# 🎵 Chord Progression System - Complete Development Blueprint

## 📋 Overview

This blueprint provides complete specifications for implementing a chord progression system in the Modern Guitar Scales webapp. The system allows users to build custom chord progressions and receive dynamic scale compatibility ratings (1-10) for each chord in the progression.

---

## 🎯 Goals

1. **Enable chord progression building** - Users can create custom progressions or select from common templates
2. **Provide chord-specific scale recommendations** - Show which scales work best over each chord
3. **Dynamic compatibility ratings** - Display 1-10 ratings for scales based on chord context
4. **Seamless integration** - Works within existing manual selection area
5. **Educational value** - Teach users music theory through detailed explanations

---

## 🏗️ System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│ • ChordProgressionDropdown.tsx                              │
│ • ChordProgressionBuilder.tsx                               │
│ • ChordScaleCompatibility.tsx                               │
│ • ProgressionTimeline.tsx                                   │
│ • CommonProgressionsLibrary.tsx                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│ • /api/chord-progression-scales/route.ts                    │
│ • /api/chord-definitions/route.ts                           │
│ • /api/common-progressions/route.ts                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│ • music-theory/{key}-chord-progression-database.json (×12)  │
│ • lib/chord-progression/types.ts                            │
│ • lib/chord-progression/loader.ts                           │
│ • lib/chord-progression/compatibility-service.ts            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Structure Specifications

### 1. Chord Progression Database Schema

**File Location:** `music-theory/{key}-chord-progression-database.json`

**Files Required (12 total):**
- `a-chord-progression-database.json`
- `a-sharp-chord-progression-database.json`
- `b-chord-progression-database.json`
- `c-chord-progression-database.json`
- `c-sharp-chord-progression-database.json`
- `d-chord-progression-database.json`
- `d-sharp-chord-progression-database.json`
- `e-chord-progression-database.json`
- `f-chord-progression-database.json`
- `f-sharp-chord-progression-database.json`
- `g-chord-progression-database.json`
- `g-sharp-chord-progression-database.json`

**Schema:**

```typescript
interface ChordProgressionDatabase {
  key: string;                    // "A", "C", "C#", etc.
  version: string;                // "1.0.0"
  lastUpdated: string;            // "2025-11-13"

  // All possible chords in this key
  chords: {
    [chordSymbol: string]: ChordDefinition;
  };

  // Pre-built common progressions
  commonProgressions: CommonProgression[];
}

interface ChordDefinition {
  symbol: string;                 // "Am", "Cmaj7", "E7", etc.
  fullName: string;               // "A Minor", "C Major 7th", "E Dominant 7th"
  romanNumeral: string;           // "i", "IVmaj7", "V7"
  quality: ChordQuality;          // "major", "minor", "dominant7", "major7", etc.
  notes: string[];                // ["A", "C", "E"]
  rootNote: string;               // "A"

  // Scale compatibility for THIS specific chord
  scaleCompatibility: ChordScaleCompatibility[];
}

interface ChordScaleCompatibility {
  scaleName: string;              // "A Minor Pentatonic"
  scaleDbKey: string;             // "MinorPentatonic" (matches complete-database.json keys)
  compatibilityScore: number;     // 1-10 rating
  relationship: string;           // "Primary scale - contains all chord tones"
  rationale: string;              // Why this scale works over this chord
  chordToneAlignment: {
    chordTones: string[];         // Which chord tones are in the scale
    tensions: string[];           // Available tensions (9th, 11th, 13th)
    avoidNotes: string[];         // Notes to avoid
  };
  voiceLeadingTips: string;       // "Emphasize the 3rd (C) and 7th (G#)"
  recommendedUse: string;         // "Perfect for minor i chord vamps"
  difficultyLevel: number;        // 1-5
}

interface CommonProgression {
  name: string;                   // "I-IV-V", "ii-V-I", "I-vi-IV-V"
  description: string;            // "Classic rock progression"
  chords: string[];               // ["A", "D", "E"] or ["Am", "F", "C", "G"]
  genre: string[];                // ["Rock", "Pop", "Country"]
  difficulty: number;             // 1-5
}

type ChordQuality =
  | "major"
  | "minor"
  | "dominant7"
  | "major7"
  | "minor7"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4"
  | "add9"
  | "6"
  | "min6"
  | "maj9"
  | "min9"
  | "9"
  | "11"
  | "13";
```

---

### 2. Example Database Entry (A Major Key)

**File:** `music-theory/a-chord-progression-database.json`

```json
{
  "key": "A",
  "version": "1.0.0",
  "lastUpdated": "2025-11-13",
  "chords": {
    "A": {
      "symbol": "A",
      "fullName": "A Major",
      "romanNumeral": "I",
      "quality": "major",
      "notes": ["A", "C#", "E"],
      "rootNote": "A",
      "scaleCompatibility": [
        {
          "scaleName": "A Major Pentatonic",
          "scaleDbKey": "MajorPentatonic",
          "compatibilityScore": 10,
          "relationship": "Primary pentatonic - perfect consonance",
          "rationale": "Contains all chord tones (A, C#, E) plus safe extensions. No avoid notes.",
          "chordToneAlignment": {
            "chordTones": ["A", "C#", "E"],
            "tensions": ["B (9th)", "F# (13th)"],
            "avoidNotes": []
          },
          "voiceLeadingTips": "Target the root (A) and major 3rd (C#) for strong resolution",
          "recommendedUse": "Perfect for I chord vamps and major tonality establishment",
          "difficultyLevel": 1
        },
        {
          "scaleName": "A Major (Ionian)",
          "scaleDbKey": "Ionian",
          "compatibilityScore": 10,
          "relationship": "Parent scale - complete diatonic harmony",
          "rationale": "The source scale for A major harmony. Contains all chord tones and available tensions.",
          "chordToneAlignment": {
            "chordTones": ["A", "C#", "E"],
            "tensions": ["B (9th)", "D (11th)", "F# (13th)", "G# (maj7)"],
            "avoidNotes": []
          },
          "voiceLeadingTips": "All notes work; emphasize chord tones on strong beats",
          "recommendedUse": "Complete melodic freedom over I major chord",
          "difficultyLevel": 1
        },
        {
          "scaleName": "A Lydian",
          "scaleDbKey": "Lydian",
          "compatibilityScore": 9,
          "relationship": "Bright major alternative with #11",
          "rationale": "Adds D# (#11) for dreamy, floating quality over major chord",
          "chordToneAlignment": {
            "chordTones": ["A", "C#", "E"],
            "tensions": ["B (9th)", "D# (#11)", "F# (13th)"],
            "avoidNotes": []
          },
          "voiceLeadingTips": "Emphasize the #11 (D#) for characteristic Lydian sound",
          "recommendedUse": "Use over Imaj7 or Imaj7#11 for modern, ethereal sound",
          "difficultyLevel": 2
        }
      ]
    },
    "Bm": {
      "symbol": "Bm",
      "fullName": "B Minor",
      "romanNumeral": "ii",
      "quality": "minor",
      "notes": ["B", "D", "F#"],
      "rootNote": "B",
      "scaleCompatibility": [
        {
          "scaleName": "B Dorian",
          "scaleDbKey": "Dorian",
          "compatibilityScore": 10,
          "relationship": "Primary ii chord scale in A major",
          "rationale": "B Dorian is the natural ii mode in A major. Perfect for ii-V-I progressions.",
          "chordToneAlignment": {
            "chordTones": ["B", "D", "F#"],
            "tensions": ["C# (9th)", "E (11th)", "G# (13th)"],
            "avoidNotes": []
          },
          "voiceLeadingTips": "Emphasize the major 6th (G#) for characteristic Dorian sound",
          "recommendedUse": "Essential for ii chord in A major; perfect for Bm7-E7-Amaj7",
          "difficultyLevel": 2
        }
      ]
    }
  },
  "commonProgressions": [
    {
      "name": "I-IV-V",
      "description": "Classic rock and blues progression",
      "chords": ["A", "D", "E"],
      "genre": ["Rock", "Blues", "Country"],
      "difficulty": 1
    },
    {
      "name": "I-vi-IV-V",
      "description": "50s progression / Doo-wop changes",
      "chords": ["A", "F#m", "D", "E"],
      "genre": ["Pop", "Rock", "Doo-wop"],
      "difficulty": 1
    },
    {
      "name": "ii-V-I",
      "description": "Jazz standard progression",
      "chords": ["Bm7", "E7", "Amaj7"],
      "genre": ["Jazz", "Bossa Nova"],
      "difficulty": 2
    }
  ]
}
```

---

## 🎨 UI/UX Design Specifications

### 1. Chord Progression Dropdown (Always Visible)

**Location:** Below "Scale/Mode" dropdown in manual selection area (Header.tsx)

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ Key: [A ▼]              [+ Add to List] │
├─────────────────────────────────────────┤
│ Scale/Mode: [Ionian (Major) ▼]         │
├─────────────────────────────────────────┤
│ Chord Progression: [Build Custom ▼]    │
│   Options:                              │
│   • Build Custom Progression            │
│   • I-IV-V (Rock/Blues)                 │
│   • I-vi-IV-V (Pop)                     │
│   • ii-V-I (Jazz)                       │
│   • I-V-vi-IV (Modern Pop)              │
│   • 12-Bar Blues                        │
│   • Load from Library...                │
└─────────────────────────────────────────┘
```

**Component:** `components/ChordProgressionDropdown.tsx`

**Props:**
```typescript
interface ChordProgressionDropdownProps {
  selectedKey: string | null;
  selectedProgression: string | null;
  onProgressionSelect: (progression: string | null) => void;
  theme: ThemeConfig;
}
```

---

### 2. Chord Progression Builder UI

**Component:** `components/ChordProgressionBuilder.tsx`

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│ 🎸 Chord Progression Builder                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [1: A  ▼] [2: D  ▼] [3: E  ▼] [4: A  ▼] [+ Add Chord] │
│                                                           │
│  Available Chords in A:                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Diatonic: A  Bm  C#m  D  E  F#m  G#dim             │ │
│  │ 7ths: Amaj7  Bm7  C#m7  Dmaj7  E7  F#m7  G#m7b5   │ │
│  │ Extended: Amaj9  Asus2  Asus4  Dadd9  E9          │ │
│  │ Borrowed: Am  F  C  G  Dm  Bb                      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  [Clear All] [Save Progression] [Load Progression]       │
└──────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface ChordProgressionBuilderProps {
  selectedKey: string;
  chords: string[];
  onChordsChange: (chords: string[]) => void;
  theme: ThemeConfig;
}
```

**Features:**
- Drag-and-drop chord reordering
- Add/remove chords dynamically
- Display available chords grouped by type
- Save/load custom progressions
- Clear all functionality

---

### 3. Chord Scale Compatibility Display

**Component:** `components/ChordScaleCompatibility.tsx`

**Visual Design:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🎵 Scale Recommendations for Your Progression                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Chord 1: A (I)                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ⭐ 10/10  A Major Pentatonic                                │  │
│ │           Perfect consonance - all chord tones present      │  │
│ │           [View Details] [Use This Scale]                   │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ ⭐ 10/10  A Major (Ionian)                                  │  │
│ │           Parent scale - complete diatonic harmony          │  │
│ │           [View Details] [Use This Scale]                   │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ ⭐ 9/10   A Lydian                                          │  │
│ │           Bright major with #11 - modern sound              │  │
│ │           [View Details] [Use This Scale]                   │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ Chord 2: D (IV)                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ⭐ 10/10  D Major (Ionian)                                  │  │
│ │           IV chord parent scale - subdominant function      │  │
│ │           [View Details] [Use This Scale]                   │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ [◀ Previous Chord] [Next Chord ▶] [Show All Chords]             │
└──────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface ChordScaleCompatibilityProps {
  selectedKey: string;
  chords: string[];
  currentChordIndex: number;
  onChordIndexChange: (index: number) => void;
  onScaleSelect: (scaleName: string) => void;
  theme: ThemeConfig;
}
```

**Features:**
- Display top 5-10 compatible scales per chord
- Show compatibility score (1-10) with visual stars
- Expandable details showing rationale, voice leading tips
- "Use This Scale" button to apply scale to fretboard
- Navigate between chords in progression
- Collapsible sections for each chord

---

### 4. Progression Timeline

**Component:** `components/ProgressionTimeline.tsx`

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│ 🎼 Progression Timeline                                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Chord:  │   A   │   D   │   E   │   A   │             │
│  Scale:  │ A Maj │ D Maj │ E Mix │ A Maj │             │
│  Rating: │  10   │  10   │  10   │  10   │             │
│                                                           │
│  Current: [Chord 1: A] ◀ ▶                               │
│                                                           │
│  [▶ Play Progression] [Loop] [Tempo: 120 BPM]           │
└──────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface ProgressionTimelineProps {
  chords: string[];
  selectedScales: string[];
  currentChordIndex: number;
  onChordIndexChange: (index: number) => void;
  theme: ThemeConfig;
}
```

**Features:**
- Visual timeline showing all chords
- Display selected scale for each chord
- Show compatibility rating for each chord-scale pair
- Highlight current chord
- Navigation controls (previous/next)
- Optional: Play progression with metronome

---

### 5. Common Progressions Library

**Component:** `components/CommonProgressionsLibrary.tsx`

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│ 📚 Common Progressions Library                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Filter by Genre: [All ▼] [Rock] [Jazz] [Pop] [Blues]    │
│                                                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │ I-IV-V (Classic Rock)                              │  │
│ │ Chords: A - D - E                                  │  │
│ │ Genre: Rock, Blues, Country                        │  │
│ │ Difficulty: ⭐                                      │  │
│ │ [Load Progression]                                 │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ I-vi-IV-V (50s Progression)                        │  │
│ │ Chords: A - F#m - D - E                            │  │
│ │ Genre: Pop, Rock, Doo-wop                          │  │
│ │ Difficulty: ⭐                                      │  │
│ │ [Load Progression]                                 │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ ii-V-I (Jazz Standard)                             │  │
│ │ Chords: Bm7 - E7 - Amaj7                           │  │
│ │ Genre: Jazz, Bossa Nova                            │  │
│ │ Difficulty: ⭐⭐                                     │  │
│ │ [Load Progression]                                 │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface CommonProgressionsLibraryProps {
  selectedKey: string;
  onProgressionLoad: (chords: string[]) => void;
  theme: ThemeConfig;
}
```

---

## 🔧 Technical Implementation

### Phase 1: Type Definitions

**File:** `lib/chord-progression/types.ts`

```typescript
/**
 * Type definitions for chord progression system
 */

export type ChordQuality =
  | "major"
  | "minor"
  | "dominant7"
  | "major7"
  | "minor7"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4"
  | "add9"
  | "6"
  | "min6"
  | "maj9"
  | "min9"
  | "9"
  | "11"
  | "13";

export interface ChordToneAlignment {
  chordTones: string[];
  tensions: string[];
  avoidNotes: string[];
}

export interface ChordScaleCompatibility {
  scaleName: string;
  scaleDbKey: string;
  compatibilityScore: number;
  relationship: string;
  rationale: string;
  chordToneAlignment: ChordToneAlignment;
  voiceLeadingTips: string;
  recommendedUse: string;
  difficultyLevel: number;
}

export interface ChordDefinition {
  symbol: string;
  fullName: string;
  romanNumeral: string;
  quality: ChordQuality;
  notes: string[];
  rootNote: string;
  scaleCompatibility: ChordScaleCompatibility[];
}

export interface CommonProgression {
  name: string;
  description: string;
  chords: string[];
  genre: string[];
  difficulty: number;
}

export interface ChordProgressionDatabase {
  key: string;
  version: string;
  lastUpdated: string;
  chords: Record<string, ChordDefinition>;
  commonProgressions: CommonProgression[];
}

export interface ChordProgressionState {
  enabled: boolean;
  chords: string[];
  currentChordIndex: number;
  selectedScales: string[];
}
```

---

### Phase 2: Database Loader

**File:** `lib/chord-progression/loader.ts`

```typescript
/**
 * Chord Progression Database Loader
 * Loads chord progression databases from JSON files
 */

import { ChordProgressionDatabase, ChordDefinition, CommonProgression } from './types';

// Cache for loaded databases
const databaseCache = new Map<string, ChordProgressionDatabase>();

/**
 * Normalize key name for file path
 */
export function normalizeKeyName(key: string): string {
  const normalized = key.toLowerCase().replace('#', '-sharp');
  return normalized;
}

/**
 * Get database file path for a key
 */
export function getDatabasePath(key: string): string {
  const normalizedKey = normalizeKeyName(key);
  return `music-theory/${normalizedKey}-chord-progression-database.json`;
}

/**
 * Load chord progression database for a key
 */
export async function loadChordProgressionDatabase(
  key: string
): Promise<ChordProgressionDatabase | null> {
  try {
    // Check cache first
    if (databaseCache.has(key)) {
      return databaseCache.get(key)!;
    }

    const path = getDatabasePath(key);
    const response = await fetch(`/${path}`);

    if (!response.ok) {
      console.error(`Failed to load chord progression database for key ${key}`);
      return null;
    }

    const database: ChordProgressionDatabase = await response.json();

    // Cache the database
    databaseCache.set(key, database);

    return database;
  } catch (error) {
    console.error(`Error loading chord progression database for key ${key}:`, error);
    return null;
  }
}

/**
 * Get chord definition from database
 */
export async function getChordDefinition(
  key: string,
  chordSymbol: string
): Promise<ChordDefinition | null> {
  const database = await loadChordProgressionDatabase(key);

  if (!database || !database.chords[chordSymbol]) {
    console.warn(`Chord ${chordSymbol} not found in ${key} database`);
    return null;
  }

  return database.chords[chordSymbol];
}

/**
 * Get all available chords for a key
 */
export async function getAvailableChords(key: string): Promise<string[]> {
  const database = await loadChordProgressionDatabase(key);

  if (!database) {
    return [];
  }

  return Object.keys(database.chords);
}

/**
 * Get common progressions for a key
 */
export async function getCommonProgressions(
  key: string
): Promise<CommonProgression[]> {
  const database = await loadChordProgressionDatabase(key);

  if (!database) {
    return [];
  }

  return database.commonProgressions;
}

/**
 * Get chords grouped by type
 */
export async function getChordsGroupedByType(key: string): Promise<{
  diatonic: string[];
  sevenths: string[];
  extended: string[];
  borrowed: string[];
}> {
  const database = await loadChordProgressionDatabase(key);

  if (!database) {
    return { diatonic: [], sevenths: [], extended: [], borrowed: [] };
  }

  const diatonic: string[] = [];
  const sevenths: string[] = [];
  const extended: string[] = [];
  const borrowed: string[] = [];

  Object.entries(database.chords).forEach(([symbol, chord]) => {
    // Categorize based on roman numeral and quality
    if (chord.romanNumeral.match(/^[IViv]+$/)) {
      // Basic diatonic chords (I, ii, iii, IV, V, vi, vii°)
      if (!symbol.includes('7') && !symbol.includes('9') && !symbol.includes('sus') && !symbol.includes('add')) {
        diatonic.push(symbol);
      }
    }

    if (symbol.includes('7') || symbol.includes('maj7') || symbol.includes('m7')) {
      sevenths.push(symbol);
    }

    if (symbol.includes('9') || symbol.includes('11') || symbol.includes('13') ||
        symbol.includes('sus') || symbol.includes('add') || symbol.includes('6')) {
      extended.push(symbol);
    }

    // Borrowed chords (those not in the diatonic scale)
    if (!chord.romanNumeral.match(/^[IViv]+[°]?$/)) {
      borrowed.push(symbol);
    }
  });

  return { diatonic, sevenths, extended, borrowed };
}

/**
 * Clear database cache
 */
export function clearCache(): void {
  databaseCache.clear();
}
```

---

### Phase 3: Compatibility Service

**File:** `lib/chord-progression/compatibility-service.ts`

```typescript
/**
 * Chord Progression Compatibility Service
 * Provides scale recommendations for chord progressions
 */

import { ChordScaleCompatibility } from './types';
import { getChordDefinition } from './loader';

/**
 * Get scale recommendations for a specific chord
 */
export async function getScaleRecommendationsForChord(
  key: string,
  chordSymbol: string,
  limit: number = 10,
  minScore: number = 5
): Promise<ChordScaleCompatibility[]> {
  try {
    const chordDef = await getChordDefinition(key, chordSymbol);

    if (!chordDef) {
      console.warn(`No chord definition found for ${chordSymbol} in key ${key}`);
      return [];
    }

    // Filter and sort by compatibility score
    const recommendations = chordDef.scaleCompatibility
      .filter(scale => scale.compatibilityScore >= minScore)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error(`Error getting scale recommendations for ${chordSymbol}:`, error);
    return [];
  }
}

/**
 * Get scale recommendations for an entire chord progression
 */
export async function getScaleRecommendationsForProgression(
  key: string,
  chords: string[],
  limit: number = 10,
  minScore: number = 5
): Promise<{
  chord: string;
  position: number;
  scaleRecommendations: ChordScaleCompatibility[];
}[]> {
  try {
    const results = await Promise.all(
      chords.map(async (chord, index) => ({
        chord,
        position: index + 1,
        scaleRecommendations: await getScaleRecommendationsForChord(
          key,
          chord,
          limit,
          minScore
        ),
      }))
    );

    return results;
  } catch (error) {
    console.error('Error getting scale recommendations for progression:', error);
    return [];
  }
}

/**
 * Get the best scale for each chord in a progression
 */
export async function getBestScalesForProgression(
  key: string,
  chords: string[]
): Promise<string[]> {
  try {
    const recommendations = await getScaleRecommendationsForProgression(key, chords, 1, 5);

    return recommendations.map(rec =>
      rec.scaleRecommendations.length > 0
        ? rec.scaleRecommendations[0].scaleName
        : ''
    );
  } catch (error) {
    console.error('Error getting best scales for progression:', error);
    return [];
  }
}
```

---

### Phase 4: API Routes

**File:** `app/api/chord-progression-scales/route.ts`

```typescript
/**
 * API Route: Chord Progression Scale Recommendations
 * GET /api/chord-progression-scales?key=A&chords=A,D,E
 */

import { NextRequest, NextResponse } from 'next/server';
import { getScaleRecommendationsForProgression } from '@/lib/chord-progression/compatibility-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const chordsParam = searchParams.get('chords');
    const limit = parseInt(searchParams.get('limit') || '10');
    const minScore = parseInt(searchParams.get('minScore') || '5');

    if (!key || !chordsParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: key and chords' },
        { status: 400 }
      );
    }

    const chords = chordsParam.split(',').map(c => c.trim());

    const recommendations = await getScaleRecommendationsForProgression(
      key,
      chords,
      limit,
      minScore
    );

    return NextResponse.json({
      key,
      progression: recommendations,
    });
  } catch (error) {
    console.error('Error in chord-progression-scales API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/chord-definitions/route.ts`

```typescript
/**
 * API Route: Chord Definitions
 * GET /api/chord-definitions?key=A&chord=Am
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChordDefinition, getAvailableChords, getChordsGroupedByType } from '@/lib/chord-progression/loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const chord = searchParams.get('chord');
    const grouped = searchParams.get('grouped') === 'true';

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // If chord is specified, return that chord definition
    if (chord) {
      const chordDef = await getChordDefinition(key, chord);

      if (!chordDef) {
        return NextResponse.json(
          { error: `Chord ${chord} not found in key ${key}` },
          { status: 404 }
        );
      }

      return NextResponse.json(chordDef);
    }

    // If grouped is true, return chords grouped by type
    if (grouped) {
      const groupedChords = await getChordsGroupedByType(key);
      return NextResponse.json(groupedChords);
    }

    // Otherwise, return all available chords
    const chords = await getAvailableChords(key);
    return NextResponse.json({ key, chords });
  } catch (error) {
    console.error('Error in chord-definitions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/common-progressions/route.ts`

```typescript
/**
 * API Route: Common Progressions
 * GET /api/common-progressions?key=A&genre=Rock
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCommonProgressions } from '@/lib/chord-progression/loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const genre = searchParams.get('genre');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    let progressions = await getCommonProgressions(key);

    // Filter by genre if specified
    if (genre) {
      progressions = progressions.filter(prog =>
        prog.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    return NextResponse.json({
      key,
      progressions,
    });
  } catch (error) {
    console.error('Error in common-progressions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Phase 5: State Management

**File:** Update `app/page.tsx` to include chord progression state

```typescript
// Add to existing state in app/page.tsx

const [chordProgressionState, setChordProgressionState] = useState<ChordProgressionState>({
  enabled: false,
  chords: [],
  currentChordIndex: 0,
  selectedScales: [],
});

// Handler to enable/disable chord progression mode
const handleChordProgressionToggle = useCallback((enabled: boolean) => {
  setChordProgressionState(prev => ({
    ...prev,
    enabled,
  }));
}, []);

// Handler to update chord progression
const handleChordProgressionChange = useCallback((chords: string[]) => {
  setChordProgressionState(prev => ({
    ...prev,
    chords,
    currentChordIndex: 0,
    selectedScales: new Array(chords.length).fill(''),
  }));
}, []);

// Handler to navigate between chords
const handleChordIndexChange = useCallback((index: number) => {
  setChordProgressionState(prev => ({
    ...prev,
    currentChordIndex: index,
  }));
}, []);

// Handler to select scale for current chord
const handleScaleSelectForChord = useCallback((scaleName: string) => {
  setChordProgressionState(prev => {
    const newSelectedScales = [...prev.selectedScales];
    newSelectedScales[prev.currentChordIndex] = scaleName;
    return {
      ...prev,
      selectedScales: newSelectedScales,
    };
  });
}, []);
```

---

## 📝 Database Content Creation Guidelines

### Scale Compatibility Rating Methodology

For each chord, rate scales based on:

#### 1. Chord Tone Coverage (40% weight)
- **10 points:** All chord tones present in scale
- **7-9 points:** Most chord tones present
- **4-6 points:** Some chord tones present
- **1-3 points:** Few chord tones present

#### 2. Avoid Notes (30% weight)
- **10 points:** No avoid notes (b9, #9, b13 over major chords, etc.)
- **7-9 points:** Minor avoid notes that can be used as passing tones
- **4-6 points:** Some avoid notes requiring careful use
- **1-3 points:** Multiple avoid notes

#### 3. Harmonic Function (20% weight)
- Does the scale support the chord's function in the progression?
- **Tonic (I, vi):** Stable, consonant scales score higher
- **Subdominant (IV, ii):** Scales with characteristic tensions
- **Dominant (V, vii°):** Scales with leading tones and tension

#### 4. Musical Context (10% weight)
- Genre appropriateness
- Common practice in music theory
- Practical playability

---

### Example Calculation: A Major Pentatonic over A Major Chord

**A Major Pentatonic over A major chord:**
- **Chord tones:** A, C#, E ✓ (all present) = 10/10
- **Avoid notes:** None = 10/10
- **Harmonic function:** Perfect for I chord = 10/10
- **Musical context:** Universal, easy = 10/10
- **Final Score: 10/10**

**A Mixolydian over A major chord:**
- **Chord tones:** A, C#, E ✓ (all present) = 10/10
- **Avoid notes:** G natural (b7) adds color but not avoid = 8/10
- **Harmonic function:** Good for I with bluesy edge = 8/10
- **Musical context:** Common in rock/blues = 9/10
- **Final Score: 8.7/10 → Round to 9/10**

---

### Chords to Include Per Key

#### Diatonic Chords (7 chords)
- I, ii, iii, IV, V, vi, vii°
- Example in A: A, Bm, C#m, D, E, F#m, G#dim

#### Seventh Chords (7 chords)
- Imaj7, iim7, iiim7, IVmaj7, V7, vim7, viim7b5
- Example in A: Amaj7, Bm7, C#m7, Dmaj7, E7, F#m7, G#m7b5

#### Extended Chords (~15-20 chords)
- Ninth chords: Imaj9, iim9, V9
- Suspended: Isus2, Isus4, Vsus4
- Add chords: Iadd9, IVadd9
- Sixth chords: I6, vim6
- Example in A: Amaj9, Bm9, E9, Asus2, Asus4, Esus4, Aadd9, Dadd9, A6, F#m6

#### Borrowed Chords (~10-15 chords)
- From parallel minor: Im, bIII, bVI, bVII, ivm
- Secondary dominants: V/V, V/vi, V/ii, V/iii, V/IV
- Example in A: Am, C, F, G, Dm, B7, C#7, F#7, A7, D7

**Total per key: ~40-50 chord definitions**

---

### Scale Compatibility Entries Per Chord

For each chord, include **10-20 compatible scales** from the existing `{key}-complete-database.json`:

1. **Primary scales (score 9-10):** 3-5 scales
2. **Secondary scales (score 7-8):** 5-7 scales
3. **Tertiary scales (score 5-6):** 5-8 scales

**Total scale compatibility entries per key: ~400-1000 entries**

---

### Common Progressions Per Key

Include **10-20 common progressions** covering:

1. **Rock/Pop progressions:**
   - I-IV-V
   - I-V-vi-IV
   - I-vi-IV-V
   - vi-IV-I-V

2. **Jazz progressions:**
   - ii-V-I
   - I-vi-ii-V
   - iii-vi-ii-V-I

3. **Blues progressions:**
   - 12-bar blues
   - 8-bar blues
   - Quick change blues

4. **Genre-specific:**
   - Bossa nova: Imaj7-vim7-iim7-V7
   - Gospel: I-IV-I-V-IV-I
   - Country: I-IV-I-V

---

## 🔄 Cross-Referencing with Existing Database

### Linking Strategy

Each `scaleDbKey` in the chord progression database must match a `scalesArrayKey` in the existing `{key}-complete-database.json` files.

**Mapping Example:**
```typescript
// Chord progression database uses:
"scaleDbKey": "MinorPentatonic"

// This maps to complete-database.json:
"scales": {
  "MinorPentatonic": {
    "sourceScale": { ... },
    "compatibleScales": [ ... ]
  }
}
```

**Cross-reference fields to pull:**
- `scaleName` from complete database
- `compatibilityScore` (can be different - chord-specific vs. key-specific)
- `relationship`, `rationale`, `musicalContext`
- `targetNotes`, `difficultyLevel`

---

## 📚 Implementation Phases

### Phase 1: Database Creation (Priority: HIGH)

**Tasks:**
1. Create `lib/chord-progression/types.ts` with all TypeScript interfaces
2. Create template for `a-chord-progression-database.json`
3. Document all diatonic chords for A major (7 chords)
4. Add scale compatibility for each chord (10-20 scales per chord)
5. Add seventh chords (7 chords)
6. Add extended chords (15-20 chords)
7. Add borrowed chords (10-15 chords)
8. Add common progressions (10-20 progressions)
9. Review and validate A major database
10. Replicate for all 12 keys

**Estimated entries:**
- 12 keys × 40-50 chords = 480-600 chord definitions
- 12 keys × 400-1000 scale compatibility entries = 4,800-12,000 entries
- 12 keys × 10-20 progressions = 120-240 progressions

---

### Phase 2: Backend Services (Priority: HIGH)

**Tasks:**
1. Create `lib/chord-progression/loader.ts`
2. Create `lib/chord-progression/compatibility-service.ts`
3. Create API route: `app/api/chord-progression-scales/route.ts`
4. Create API route: `app/api/chord-definitions/route.ts`
5. Create API route: `app/api/common-progressions/route.ts`
6. Add caching mechanism for database loading
7. Add error handling and validation
8. Write unit tests for loader and compatibility service

---

### Phase 3: UI Components (Priority: MEDIUM)

**Tasks:**
1. Create `components/ChordProgressionDropdown.tsx`
   - Dropdown selector for progressions
   - Options: Build Custom, Common Progressions, Load from Library

2. Create `components/ChordProgressionBuilder.tsx`
   - Chord selection dropdowns
   - Add/remove chord functionality
   - Display available chords grouped by type
   - Save/load custom progressions

3. Create `components/ChordScaleCompatibility.tsx`
   - Display scale recommendations per chord
   - Show compatibility scores with visual stars
   - Expandable details (rationale, voice leading tips)
   - "Use This Scale" button

4. Create `components/ProgressionTimeline.tsx`
   - Visual timeline of progression
   - Show selected scale for each chord
   - Navigation controls
   - Highlight current chord

5. Create `components/CommonProgressionsLibrary.tsx`
   - Display common progressions
   - Filter by genre
   - Load progression button

---

### Phase 4: Integration (Priority: MEDIUM)

**Tasks:**
1. Update `app/page.tsx` to include chord progression state
2. Add chord progression handlers to main app
3. Update `components/Header.tsx` to include ChordProgressionDropdown
4. Integrate ChordScaleCompatibility with CompatibleScalesSection
5. Update ManualSelectionList to show chord progression info
6. Add keyboard shortcuts for chord navigation
7. Update fretboard to highlight chord tones when in progression mode

---

### Phase 5: Testing & Refinement (Priority: LOW)

**Tasks:**
1. Test all API endpoints
2. Test UI components in isolation
3. Integration testing with existing features
4. Performance testing with large progressions
5. User acceptance testing
6. Bug fixes and refinements
7. Documentation updates

---

## 🎯 Detailed Component Specifications

### Component 1: ChordProgressionDropdown.tsx

**Location:** `components/ChordProgressionDropdown.tsx`

**Purpose:** Dropdown selector for choosing chord progression mode

**Props:**
```typescript
interface ChordProgressionDropdownProps {
  selectedKey: string | null;
  selectedProgression: string | null;
  onProgressionSelect: (progression: string | null) => void;
  theme: ThemeConfig;
}
```

**Features:**
- Dropdown with options: Build Custom, Common Progressions
- Disabled when no key is selected
- Styled to match existing theme
- Shows current selection

**Implementation Notes:**
- Use existing dropdown styling from Header.tsx
- Integrate with theme system
- Handle null/undefined states gracefully

---

### Component 2: ChordProgressionBuilder.tsx

**Location:** `components/ChordProgressionBuilder.tsx`

**Purpose:** Interactive builder for creating custom chord progressions

**Props:**
```typescript
interface ChordProgressionBuilderProps {
  selectedKey: string;
  chords: string[];
  onChordsChange: (chords: string[]) => void;
  theme: ThemeConfig;
}
```

**State:**
```typescript
const [availableChords, setAvailableChords] = useState<{
  diatonic: string[];
  sevenths: string[];
  extended: string[];
  borrowed: string[];
}>({ diatonic: [], sevenths: [], extended: [], borrowed: [] });
```

**Features:**
- Fetch available chords from API on mount
- Display chords grouped by type (diatonic, 7ths, extended, borrowed)
- Add chord button (appends to progression)
- Remove chord button (removes from progression)
- Drag-and-drop reordering (optional)
- Clear all button
- Save progression to local storage
- Load progression from local storage

**API Calls:**
```typescript
// Fetch available chords
const response = await fetch(`/api/chord-definitions?key=${selectedKey}&grouped=true`);
const groupedChords = await response.json();
```

**Implementation Notes:**
- Use React DnD or similar for drag-and-drop
- Store custom progressions in localStorage
- Validate chord selections
- Show visual feedback for selected chords

---

### Component 3: ChordScaleCompatibility.tsx

**Location:** `components/ChordScaleCompatibility.tsx`

**Purpose:** Display scale recommendations for each chord in progression

**Props:**
```typescript
interface ChordScaleCompatibilityProps {
  selectedKey: string;
  chords: string[];
  currentChordIndex: number;
  onChordIndexChange: (index: number) => void;
  onScaleSelect: (scaleName: string) => void;
  theme: ThemeConfig;
}
```

**State:**
```typescript
const [scaleRecommendations, setScaleRecommendations] = useState<{
  chord: string;
  position: number;
  scaleRecommendations: ChordScaleCompatibility[];
}[]>([]);
const [expandedScales, setExpandedScales] = useState<Set<string>>(new Set());
```

**Features:**
- Fetch scale recommendations for entire progression
- Display top 5-10 scales per chord
- Show compatibility score (1-10) with star rating
- Expandable details showing:
  - Relationship
  - Rationale
  - Chord tone alignment
  - Voice leading tips
  - Recommended use
  - Difficulty level
- "Use This Scale" button to apply scale
- Navigate between chords (Previous/Next buttons)
- "Show All Chords" toggle to expand all at once

**API Calls:**
```typescript
// Fetch scale recommendations for progression
const response = await fetch(
  `/api/chord-progression-scales?key=${selectedKey}&chords=${chords.join(',')}`
);
const data = await response.json();
```

**Visual Elements:**
- Star rating component (⭐ × score)
- Collapsible sections for each chord
- Color-coded compatibility scores:
  - 9-10: Green
  - 7-8: Yellow
  - 5-6: Orange
  - 1-4: Red

**Implementation Notes:**
- Use existing theme colors
- Implement smooth expand/collapse animations
- Cache recommendations to avoid redundant API calls
- Show loading state while fetching

---

### Component 4: ProgressionTimeline.tsx

**Location:** `components/ProgressionTimeline.tsx`

**Purpose:** Visual timeline showing chord progression and selected scales

**Props:**
```typescript
interface ProgressionTimelineProps {
  chords: string[];
  selectedScales: string[];
  currentChordIndex: number;
  onChordIndexChange: (index: number) => void;
  theme: ThemeConfig;
}
```

**Features:**
- Horizontal timeline showing all chords
- Display selected scale for each chord
- Show compatibility rating for each chord-scale pair
- Highlight current chord
- Click on chord to navigate
- Previous/Next navigation buttons
- Optional: Play progression with metronome

**Visual Design:**
```
┌──────────────────────────────────────────┐
│ Chord:  │ A │ D │ E │ A │               │
│ Scale:  │AMj│DMj│EMx│AMj│               │
│ Rating: │10 │10 │10 │10 │               │
│         └───┴───┴───┴───┘               │
│ Current: Chord 1 (A) ◀ ▶                │
└──────────────────────────────────────────┘
```

**Implementation Notes:**
- Use flexbox for responsive layout
- Highlight current chord with border/background
- Show abbreviated scale names for space
- Tooltip on hover showing full scale name

---

### Component 5: CommonProgressionsLibrary.tsx

**Location:** `components/CommonProgressionsLibrary.tsx`

**Purpose:** Library of pre-built common chord progressions

**Props:**
```typescript
interface CommonProgressionsLibraryProps {
  selectedKey: string;
  onProgressionLoad: (chords: string[]) => void;
  theme: ThemeConfig;
}
```

**State:**
```typescript
const [progressions, setProgressions] = useState<CommonProgression[]>([]);
const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
```

**Features:**
- Fetch common progressions from API
- Filter by genre (Rock, Jazz, Pop, Blues, etc.)
- Display progression name, description, chords
- Show genre tags and difficulty rating
- "Load Progression" button
- Search/filter functionality

**API Calls:**
```typescript
// Fetch common progressions
const response = await fetch(
  `/api/common-progressions?key=${selectedKey}${genre ? `&genre=${genre}` : ''}`
);
const data = await response.json();
```

**Visual Elements:**
- Genre filter buttons/dropdown
- Difficulty stars (⭐ × difficulty)
- Chord preview
- Genre tags as badges

**Implementation Notes:**
- Use existing card/list styling
- Implement genre filtering client-side after initial fetch
- Show loading state
- Handle empty states gracefully

---

## 🗂️ File Structure

```
Modern Guitar Scales (AUGMENT v1.2)/
├── .blueprints/
│   └── chord-progression-system.md (this file)
├── app/
│   ├── api/
│   │   ├── chord-progression-scales/
│   │   │   └── route.ts
│   │   ├── chord-definitions/
│   │   │   └── route.ts
│   │   └── common-progressions/
│   │       └── route.ts
│   └── page.tsx (updated with chord progression state)
├── components/
│   ├── ChordProgressionDropdown.tsx (new)
│   ├── ChordProgressionBuilder.tsx (new)
│   ├── ChordScaleCompatibility.tsx (new)
│   ├── ProgressionTimeline.tsx (new)
│   ├── CommonProgressionsLibrary.tsx (new)
│   └── Header.tsx (updated to include dropdown)
├── lib/
│   └── chord-progression/
│       ├── types.ts (new)
│       ├── loader.ts (new)
│       └── compatibility-service.ts (new)
└── music-theory/
    ├── a-chord-progression-database.json (new)
    ├── a-sharp-chord-progression-database.json (new)
    ├── b-chord-progression-database.json (new)
    ├── c-chord-progression-database.json (new)
    ├── c-sharp-chord-progression-database.json (new)
    ├── d-chord-progression-database.json (new)
    ├── d-sharp-chord-progression-database.json (new)
    ├── e-chord-progression-database.json (new)
    ├── f-chord-progression-database.json (new)
    ├── f-sharp-chord-progression-database.json (new)
    ├── g-chord-progression-database.json (new)
    └── g-sharp-chord-progression-database.json (new)
```

---

## ✅ Acceptance Criteria

### Database
- [ ] All 12 chord progression databases created
- [ ] Each database contains 40-50 chord definitions
- [ ] Each chord has 10-20 scale compatibility entries
- [ ] Each database has 10-20 common progressions
- [ ] All `scaleDbKey` values match existing complete-database.json
- [ ] All compatibility scores are justified and documented

### Backend
- [ ] All API routes functional and tested
- [ ] Database loader with caching implemented
- [ ] Compatibility service returns correct recommendations
- [ ] Error handling for missing/invalid data
- [ ] TypeScript types defined and exported

### Frontend
- [ ] ChordProgressionDropdown integrated in Header
- [ ] ChordProgressionBuilder allows custom progression creation
- [ ] ChordScaleCompatibility displays recommendations correctly
- [ ] ProgressionTimeline shows visual progression
- [ ] CommonProgressionsLibrary loads and filters progressions
- [ ] All components styled to match existing theme
- [ ] Responsive design works on all screen sizes

### Integration
- [ ] Chord progression state managed in app/page.tsx
- [ ] Selecting a scale updates the fretboard
- [ ] Navigation between chords works smoothly
- [ ] Manual selection list shows chord progression info
- [ ] Keyboard shortcuts for chord navigation
- [ ] No conflicts with existing features

### User Experience
- [ ] Intuitive UI for building progressions
- [ ] Clear visual feedback for current chord
- [ ] Educational content (rationale, tips) displayed
- [ ] Fast performance (< 500ms for API calls)
- [ ] Graceful error handling and loading states
- [ ] Help/documentation available

---

## 🚀 Getting Started

### For AI Development

1. **Start with Phase 1:** Create the database structure
   - Begin with `a-chord-progression-database.json` as template
   - Document all diatonic chords (I, ii, iii, IV, V, vi, vii°)
   - Add scale compatibility for each chord
   - Add common progressions

2. **Move to Phase 2:** Build backend services
   - Create type definitions
   - Implement database loader
   - Create API routes
   - Test with Postman or similar

3. **Proceed to Phase 3:** Build UI components
   - Start with ChordProgressionDropdown
   - Build ChordProgressionBuilder
   - Create ChordScaleCompatibility
   - Add ProgressionTimeline and Library

4. **Phase 4:** Integration
   - Update app/page.tsx with state
   - Integrate components into Header
   - Connect to existing features
   - Test end-to-end

5. **Phase 5:** Testing and refinement
   - Fix bugs
   - Optimize performance
   - Improve UX based on testing
   - Document everything

---

## 📖 Additional Resources

### Music Theory References

**Chord-Scale Relationships:**
- Major chords: Ionian, Lydian, Major Pentatonic
- Minor chords: Dorian, Aeolian, Phrygian, Minor Pentatonic
- Dominant chords: Mixolydian, Lydian Dominant, Altered, Diminished
- Diminished chords: Locrian, Diminished (Half-Whole)

**Common Progressions by Genre:**
- **Rock:** I-IV-V, I-V-vi-IV, I-bVII-IV
- **Jazz:** ii-V-I, I-vi-ii-V, iii-vi-ii-V-I
- **Blues:** I7-IV7-I7-V7-IV7-I7 (12-bar)
- **Pop:** I-V-vi-IV, vi-IV-I-V, I-vi-IV-V

**Voice Leading Principles:**
- Emphasize chord tones on strong beats
- Use tensions as passing tones or extensions
- Avoid notes create dissonance - use sparingly
- Target notes guide melodic direction

---

## 🎓 Educational Value

This system teaches users:

1. **Chord-Scale Theory:** Which scales work over which chords and why
2. **Voice Leading:** How to navigate between chords smoothly
3. **Harmonic Function:** Understanding I, IV, V relationships
4. **Genre Awareness:** Different progressions for different styles
5. **Practical Application:** Real-world usage in improvisation

---

## 🔮 Future Enhancements

### Phase 6 (Optional)
- [ ] MIDI playback of progressions
- [ ] Metronome with adjustable tempo
- [ ] Record and save custom progressions to database
- [ ] Share progressions with other users
- [ ] AI-powered progression suggestions
- [ ] Analyze uploaded songs for chord progressions
- [ ] Integration with backing tracks
- [ ] Export progressions to MIDI/PDF

---

## 📝 Notes for Developers

### Important Considerations

1. **Performance:** Cache database loads to avoid repeated file reads
2. **Validation:** Validate all user inputs and API parameters
3. **Error Handling:** Gracefully handle missing data, invalid keys, etc.
4. **Accessibility:** Ensure keyboard navigation and screen reader support
5. **Mobile:** Design responsive layouts for mobile devices
6. **Testing:** Write unit tests for critical functions
7. **Documentation:** Comment complex logic and algorithms

### Code Style

- Follow existing TypeScript conventions
- Use functional components with hooks
- Implement proper error boundaries
- Use semantic HTML
- Follow existing theme system
- Keep components small and focused
- Extract reusable logic into hooks/utilities

---

## 🎯 Success Metrics

- [ ] Users can build custom chord progressions in < 2 minutes
- [ ] Scale recommendations load in < 500ms
- [ ] 90%+ accuracy in scale-chord compatibility ratings
- [ ] Zero breaking changes to existing features
- [ ] Positive user feedback on educational value
- [ ] All 12 keys fully supported with complete data

---

## 📞 Support & Questions

For questions or clarifications during development:
1. Review existing music theory databases for reference
2. Check `lib/musicTheory.ts` for chord/scale utilities
3. Reference `components/Header.tsx` for UI patterns
4. Consult music theory resources for chord-scale relationships

---

**End of Blueprint**

This comprehensive blueprint provides all necessary specifications for implementing the chord progression system. Follow the phases sequentially, test thoroughly, and maintain code quality throughout development.

