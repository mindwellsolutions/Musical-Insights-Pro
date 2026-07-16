# JSON Database Files for Chord-Scale Recommendation System

## 📁 Directory Structure

```
public/data/
├── chord-scale-compatibility/
│   ├── index.json                    # Master index of all chord types
│   ├── major.json                    # Major triads (C, D, E, etc.)
│   ├── minor.json                    # Minor triads (Cm, Dm, Em, etc.)
│   ├── diminished.json               # Diminished triads (C°, D°, etc.)
│   ├── augmented.json                # Augmented triads (C+, D+, etc.)
│   ├── major7.json                   # Major 7th chords (Cmaj7, Dmaj7, etc.)
│   ├── minor7.json                   # Minor 7th chords (Cm7, Dm7, etc.)
│   ├── dominant7.json                # Dominant 7th chords (C7, D7, etc.)
│   ├── diminished7.json              # Diminished 7th chords (C°7, D°7, etc.)
│   ├── half-diminished7.json         # Half-diminished 7th (Cm7♭5, etc.)
│   ├── major9.json                   # Major 9th chords (Cmaj9, etc.)
│   ├── minor9.json                   # Minor 9th chords (Cm9, etc.)
│   ├── dominant9.json                # Dominant 9th chords (C9, etc.)
│   ├── major11.json                  # Major 11th chords (Cmaj11, etc.)
│   ├── minor11.json                  # Minor 11th chords (Cm11, etc.)
│   ├── dominant11.json               # Dominant 11th chords (C11, etc.)
│   ├── major13.json                  # Major 13th chords (Cmaj13, etc.)
│   ├── minor13.json                  # Minor 13th chords (Cm13, etc.)
│   ├── dominant13.json               # Dominant 13th chords (C13, etc.)
│   ├── sus2.json                     # Suspended 2nd chords (Csus2, etc.)
│   ├── sus4.json                     # Suspended 4th chords (Csus4, etc.)
│   ├── major6.json                   # Major 6th chords (C6, etc.)
│   ├── minor6.json                   # Minor 6th chords (Cm6, etc.)
│   ├── add9.json                     # Add 9 chords (Cadd9, etc.)
│   └── minor-add9.json               # Minor add 9 chords (Cmadd9, etc.)
│
├── chord-recommendations/
│   ├── c-ionian.json                 # C Major (Ionian)
│   ├── c-dorian.json                 # C Dorian
│   ├── c-phrygian.json               # C Phrygian
│   ├── c-lydian.json                 # C Lydian
│   ├── c-mixolydian.json             # C Mixolydian
│   ├── c-aeolian.json                # C Minor (Aeolian)
│   ├── c-locrian.json                # C Locrian
│   ├── c-harmonic-minor.json         # C Harmonic Minor
│   ├── c-melodic-minor.json          # C Melodic Minor
│   ├── c-major-pentatonic.json       # C Major Pentatonic
│   ├── c-minor-pentatonic.json       # C Minor Pentatonic
│   ├── c-blues.json                  # C Blues
│   ├── c-sharp-ionian.json           # C# Major (Ionian)
│   ├── c-sharp-dorian.json           # C# Dorian
│   ├── ... (repeat for all 12 keys × major scales/modes)
│   ├── d-ionian.json
│   ├── d-dorian.json
│   ├── ... (continue for D, D#, E, F, F#, G, G#, A, A#, B)
│   └── ... (approximately 144 files: 12 keys × 12 scales/modes)
│
└── progression-recommendations/
    ├── c.json                        # Progressions in C
    ├── c-sharp.json                  # Progressions in C#
    ├── d.json                        # Progressions in D
    ├── d-sharp.json                  # Progressions in D#
    ├── e.json                        # Progressions in E
    ├── f.json                        # Progressions in F
    ├── f-sharp.json                  # Progressions in F#
    ├── g.json                        # Progressions in G
    ├── g-sharp.json                  # Progressions in G#
    ├── a.json                        # Progressions in A
    ├── a-sharp.json                  # Progressions in A#
    └── b.json                        # Progressions in B
```

---

## 📊 File Count Summary

| Directory | File Count | Description |
|-----------|------------|-------------|
| `chord-scale-compatibility/` | 25 files | 1 index + 24 chord quality files |
| `chord-recommendations/` | 144 files | 12 keys × 12 scales/modes |
| `progression-recommendations/` | 12 files | 1 per root note |
| **TOTAL** | **181 files** | Complete database |

---

## 📝 Detailed File Specifications

### 1. Chord-Scale Compatibility Files (25 files)

#### index.json
**Purpose**: Master index of all chord types and their database files

**Structure**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-09",
  "chordTypes": [
    {
      "quality": "major",
      "displayName": "Major",
      "suffix": "",
      "file": "major.json",
      "examples": ["C", "D", "E", "F", "G", "A", "B"]
    },
    {
      "quality": "minor",
      "displayName": "Minor",
      "suffix": "m",
      "file": "minor.json",
      "examples": ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"]
    }
    // ... 24 total chord types
  ]
}
```

#### Individual Chord Quality Files (24 files)
**Example**: `major7.json`

**Structure**:
```json
{
  "chordQuality": "maj7",
  "displayName": "Major 7th",
  "suffix": "maj7",
  "version": "1.0.0",
  "lastUpdated": "2025-12-09",
  "description": "Major triad with major 7th interval",
  "intervals": [0, 4, 7, 11],
  "compatibleScales": [
    {
      "scaleName": "Ionian (Major)",
      "scaleDbKey": "Ionian",
      "compatibilityScore": 10,
      "relationship": "Perfect tonal match - chord is built from scale degrees 1-3-5-7",
      "musicalContext": "The Ionian mode is the parent scale of major 7th chords. All chord tones are scale tones, creating perfect consonance.",
      "chordTones": ["1", "3", "5", "7"],
      "tensions": ["9th", "13th"],
      "avoidNotes": ["11th (4th)"],
      "musicGenreRecommendations": "Jazz, Pop, R&B, Soul, Bossa Nova",
      "difficultyLevel": 1,
      "commonUse": "Tonic function in major keys, creates sophisticated, jazzy sound",
      "famousExamples": "Girl from Ipanema (Cmaj7), Isn't She Lovely (Emaj7)"
    },
    {
      "scaleName": "Lydian",
      "scaleDbKey": "Lydian",
      "compatibilityScore": 9,
      "relationship": "Bright, uplifting sound with raised 4th",
      "musicalContext": "Lydian creates a dreamy, floating quality over maj7 chords. The #11 is a beautiful tension.",
      "chordTones": ["1", "3", "5", "7"],
      "tensions": ["9th", "#11th", "13th"],
      "avoidNotes": [],
      "musicGenreRecommendations": "Jazz, Fusion, Film Score, Progressive Rock",
      "difficultyLevel": 3,
      "commonUse": "IV chord in major keys, creates ethereal, spacious sound",
      "famousExamples": "The Simpsons Theme (Lydian), Dreams (Fleetwood Mac)"
    }
    // ... 8-12 compatible scales per chord quality
  ]
}
```

**Files to Generate**:
1. `major.json` - Major triads
2. `minor.json` - Minor triads
3. `diminished.json` - Diminished triads
4. `augmented.json` - Augmented triads
5. `major7.json` - Major 7th chords
6. `minor7.json` - Minor 7th chords
7. `dominant7.json` - Dominant 7th chords
8. `diminished7.json` - Diminished 7th chords
9. `half-diminished7.json` - Half-diminished 7th chords
10. `major9.json` - Major 9th chords
11. `minor9.json` - Minor 9th chords
12. `dominant9.json` - Dominant 9th chords
13. `major11.json` - Major 11th chords
14. `minor11.json` - Minor 11th chords
15. `dominant11.json` - Dominant 11th chords
16. `major13.json` - Major 13th chords
17. `minor13.json` - Minor 13th chords
18. `dominant13.json` - Dominant 13th chords
19. `sus2.json` - Suspended 2nd chords
20. `sus4.json` - Suspended 4th chords
21. `major6.json` - Major 6th chords
22. `minor6.json` - Minor 6th chords
23. `add9.json` - Add 9 chords
24. `minor-add9.json` - Minor add 9 chords

---

### 2. Chord Recommendations Files (144 files)

#### File Naming Convention
Format: `[key]-[scale].json`
- Key: lowercase, use hyphen for sharps (e.g., `c-sharp`, `f-sharp`)
- Scale: lowercase, use hyphens (e.g., `ionian`, `harmonic-minor`, `major-pentatonic`)

**Example**: `c-ionian.json`

**Structure**:
```json
{
  "key": "C",
  "scale": "Ionian",
  "quality": "major",
  "version": "1.0.0",
  "lastUpdated": "2025-12-09",
  "scaleNotes": ["C", "D", "E", "F", "G", "A", "B"],
  "scaleIntervals": [0, 2, 4, 5, 7, 9, 11],

  "diatonicChords": [
    {
      "degree": "I",
      "romanNumeral": "I",
      "symbol": "C",
      "fullName": "C Major",
      "quality": "major",
      "notes": ["C", "E", "G"],
      "function": "Tonic - Home base, resolution",
      "commonUse": "Start and end progressions, provides stability",
      "compatibilityScore": 10,
      "musicalContext": "The tonic chord is the most stable and resolved sound in the key",
      "famousExamples": "Let It Be (Beatles), Imagine (John Lennon)"
    },
    {
      "degree": "ii",
      "romanNumeral": "ii",
      "symbol": "Dm",
      "fullName": "D Minor",
      "quality": "minor",
      "notes": ["D", "F", "A"],
      "function": "Subdominant - Pre-dominant, sets up dominant",
      "commonUse": "Leads to V chord, creates forward motion",
      "compatibilityScore": 10,
      "musicalContext": "The ii chord is a gentle pre-dominant that smoothly leads to V",
      "famousExamples": "Autumn Leaves, Fly Me to the Moon"
    }
    // ... all 7 diatonic chords
  ],

  "extendedChords": [
    {
      "degree": "Imaj7",
      "romanNumeral": "Imaj7",
      "symbol": "Cmaj7",
      "fullName": "C Major 7th",
      "quality": "maj7",
      "notes": ["C", "E", "G", "B"],
      "function": "Tonic with color - Sophisticated resolution",
      "commonUse": "Jazz, R&B, sophisticated pop endings",
      "compatibilityScore": 9,
      "musicalContext": "Adds the major 7th for a dreamy, jazzy quality",
      "famousExamples": "Girl from Ipanema, Isn't She Lovely"
    },
    {
      "degree": "iim7",
      "romanNumeral": "iim7",
      "symbol": "Dm7",
      "fullName": "D Minor 7th",
      "quality": "min7",
      "notes": ["D", "F", "A", "C"],
      "function": "Subdominant with color - Jazz pre-dominant",
      "commonUse": "ii-V-I progressions in jazz",
      "compatibilityScore": 9,
      "musicalContext": "The workhorse of jazz harmony, smooth and sophisticated",
      "famousExamples": "Autumn Leaves, All the Things You Are"
    }
    // ... all 7 extended chords (7ths, 9ths, etc.)
  ],

  "modalInterchangeChords": [
    {
      "degree": "bVII",
      "romanNumeral": "bVII",
      "symbol": "Bb",
      "fullName": "Bb Major",
      "quality": "major",
      "notes": ["Bb", "D", "F"],
      "borrowedFrom": "C Mixolydian",
      "function": "Subtonic - Creates tension and color",
      "commonUse": "Rock, blues, modal jazz",
      "compatibilityScore": 7,
      "musicalContext": "Borrowed from the parallel Mixolydian mode, adds bluesy flavor",
      "famousExamples": "Sweet Child O' Mine (Guns N' Roses), Hey Jude (Beatles)"
    },
    {
      "degree": "iv",
      "romanNumeral": "iv",
      "symbol": "Fm",
      "fullName": "F Minor",
      "quality": "minor",
      "notes": ["F", "Ab", "C"],
      "borrowedFrom": "C Aeolian (Natural Minor)",
      "function": "Subdominant minor - Melancholic color",
      "commonUse": "Pop, rock, creates emotional depth",
      "compatibilityScore": 8,
      "musicalContext": "Borrowed from parallel minor, adds darkness and emotion",
      "famousExamples": "Creep (Radiohead), Space Oddity (David Bowie)"
    }
    // ... 5-8 modal interchange chords
  ]
}
```

#### Files to Generate (144 total)

**For each of 12 keys** (C, C#, D, D#, E, F, F#, G, G#, A, A#, B):

**Major Scale Modes** (7 files per key):
1. `[key]-ionian.json` - Major scale
2. `[key]-dorian.json` - Dorian mode
3. `[key]-phrygian.json` - Phrygian mode
4. `[key]-lydian.json` - Lydian mode
5. `[key]-mixolydian.json` - Mixolydian mode
6. `[key]-aeolian.json` - Natural minor scale
7. `[key]-locrian.json` - Locrian mode

**Minor Scale Variations** (2 files per key):
8. `[key]-harmonic-minor.json` - Harmonic minor
9. `[key]-melodic-minor.json` - Melodic minor

**Pentatonic Scales** (2 files per key):
10. `[key]-major-pentatonic.json` - Major pentatonic
11. `[key]-minor-pentatonic.json` - Minor pentatonic

**Blues Scale** (1 file per key):
12. `[key]-blues.json` - Blues scale

**Total**: 12 keys × 12 scales = **144 files**

---

### 3. Progression Recommendations Files (12 files)

#### File Naming Convention
Format: `[root-note].json`
- Use lowercase
- Use hyphen for sharps (e.g., `c-sharp.json`, `f-sharp.json`)

**Example**: `c.json`

**Structure**:
```json
{
  "key": "C",
  "version": "1.0.0",
  "lastUpdated": "2025-12-09",
  "progressions": [
    {
      "id": "i-iv-v-i",
      "name": "I-IV-V-I",
      "displayName": "I-IV-V-I (The Foundation)",
      "description": "The foundation of rock, blues, and country music. Three-chord progression that has powered countless hits.",
      "chords": ["C", "F", "G", "C"],
      "romanNumerals": ["I", "IV", "V", "I"],
      "chordQualities": ["major", "major", "major", "major"],
      "genre": ["Rock", "Blues", "Country", "Folk Rock", "Classic Rock"],
      "difficulty": 1,
      "musicalCharacter": "Strong, resolute, optimistic. Creates clear sense of home (I), departure (IV), tension (V), and resolution back to I.",
      "famousSongs": [
        "La Bamba (Ritchie Valens)",
        "Twist and Shout (The Beatles)",
        "Wild Thing (The Troggs)",
        "Louie Louie (The Kingsmen)"
      ],
      "tips": "The most fundamental progression in Western music. Perfect for beginners. Can be enhanced with 7th chords (C-F-G7) for more color.",
      "scaleRecommendations": {
        "C": [
          {
            "scaleName": "C Major Pentatonic",
            "scaleDbKey": "MajorPentatonic",
            "compatibilityScore": 10,
            "usage": "Safe, always works - perfect for improvisation",
            "notes": ["C", "D", "E", "G", "A"]
          },
          {
            "scaleName": "C Ionian (Major)",
            "scaleDbKey": "Ionian",
            "compatibilityScore": 10,
            "usage": "Full major scale with all chord tones",
            "notes": ["C", "D", "E", "F", "G", "A", "B"]
          },
          {
            "scaleName": "C Blues",
            "scaleDbKey": "Blues",
            "compatibilityScore": 9,
            "usage": "Adds bluesy flavor with b3 and b5",
            "notes": ["C", "Eb", "F", "F#", "G", "Bb"]
          }
        ],
        "F": [
          {
            "scaleName": "F Lydian",
            "scaleDbKey": "Lydian",
            "compatibilityScore": 9,
            "usage": "Bright, uplifting sound over IV chord",
            "notes": ["F", "G", "A", "B", "C", "D", "E"]
          },
          {
            "scaleName": "C Major Pentatonic",
            "scaleDbKey": "MajorPentatonic",
            "compatibilityScore": 10,
            "usage": "Works over entire progression",
            "notes": ["C", "D", "E", "G", "A"]
          }
        ],
        "G": [
          {
            "scaleName": "G Mixolydian",
            "scaleDbKey": "Mixolydian",
            "compatibilityScore": 10,
            "usage": "Perfect for V chord, adds tension",
            "notes": ["G", "A", "B", "C", "D", "E", "F"]
          },
          {
            "scaleName": "C Major Pentatonic",
            "scaleDbKey": "MajorPentatonic",
            "compatibilityScore": 10,
            "usage": "Universal scale for entire progression",
            "notes": ["C", "D", "E", "G", "A"]
          }
        ]
      },
      "functionalAnalysis": {
        "tonalCenter": "C",
        "cadenceType": "Authentic cadence (V-I)",
        "harmonicRhythm": "Even, typically one chord per bar",
        "tension": "Low to moderate, resolves strongly"
      }
    },
    {
      "id": "i-v-vi-iv",
      "name": "I-V-vi-IV",
      "displayName": "I-V-vi-IV (Axis Progression)",
      "description": "The most popular pop progression of all time. Used in thousands of hit songs.",
      "chords": ["C", "G", "Am", "F"],
      "romanNumerals": ["I", "V", "vi", "IV"],
      "chordQualities": ["major", "major", "minor", "major"],
      "genre": ["Pop", "Rock", "Indie", "Alternative", "Singer-Songwriter"],
      "difficulty": 1,
      "musicalCharacter": "Emotional, uplifting, singable. Creates a perfect loop that can repeat endlessly.",
      "famousSongs": [
        "Let It Be (The Beatles)",
        "No Woman No Cry (Bob Marley)",
        "With or Without You (U2)",
        "Someone Like You (Adele)",
        "Don't Stop Believin' (Journey)"
      ],
      "tips": "This progression is so popular it's almost a cliché, but it works! Try varying the rhythm or adding 7ths for freshness.",
      "scaleRecommendations": {
        "C": [
          {
            "scaleName": "C Major Pentatonic",
            "scaleDbKey": "MajorPentatonic",
            "compatibilityScore": 10,
            "usage": "Perfect for the entire progression",
            "notes": ["C", "D", "E", "G", "A"]
          }
        ],
        "G": [
          {
            "scaleName": "G Mixolydian",
            "scaleDbKey": "Mixolydian",
            "compatibilityScore": 9,
            "usage": "Adds color to the V chord",
            "notes": ["G", "A", "B", "C", "D", "E", "F"]
          }
        ],
        "Am": [
          {
            "scaleName": "A Aeolian (Natural Minor)",
            "scaleDbKey": "Aeolian",
            "compatibilityScore": 10,
            "usage": "Perfect for the vi chord",
            "notes": ["A", "B", "C", "D", "E", "F", "G"]
          }
        ],
        "F": [
          {
            "scaleName": "F Lydian",
            "scaleDbKey": "Lydian",
            "compatibilityScore": 9,
            "usage": "Bright sound over IV chord",
            "notes": ["F", "G", "A", "B", "C", "D", "E"]
          }
        ]
      },
      "functionalAnalysis": {
        "tonalCenter": "C",
        "cadenceType": "Deceptive cadence (V-vi)",
        "harmonicRhythm": "Even, creates circular motion",
        "tension": "Moderate, never fully resolves (creates loop)"
      }
    }
    // ... 15-20 progressions per key
  ]
}
```

#### Common Progressions to Include (per key)

**Basic Progressions** (Difficulty 1):
1. I-IV-V-I (Rock/Blues foundation)
2. I-V-vi-IV (Pop axis progression)
3. I-vi-IV-V (50s progression)
4. I-IV-I-V (Simple rock)
5. I-V-I-IV (Alternate rock)

**Intermediate Progressions** (Difficulty 2-3):
6. ii-V-I (Jazz standard)
7. I-vi-ii-V (Circle progression)
8. I-IV-vi-V (Sensitive progression)
9. vi-IV-I-V (Emotional pop)
10. I-V-vi-iii-IV-I-IV-V (Canon progression)

**Advanced Progressions** (Difficulty 4-5):
11. iii-vi-ii-V-I (Extended jazz)
12. I-bVII-IV-I (Modal rock)
13. i-bVI-bVII-i (Minor epic)
14. I-bIII-bVII-IV (Mixolydian rock)
15. ii-V-I-VI (Jazz turnaround)

**Blues Progressions**:
16. I-I-I-I-IV-IV-I-I-V-IV-I-V (12-bar blues)
17. I-IV-I-V (Quick-change blues)

**Jazz Progressions**:
18. Imaj7-VIm7-IIm7-V7 (Jazz standard)
19. IIm7-V7-Imaj7-VIm7 (Rhythm changes)
20. Imaj7-bIIImaj7-bVImaj7-bIImaj7 (Coltrane changes)

#### Files to Generate (12 total)
1. `c.json` - Progressions in C
2. `c-sharp.json` - Progressions in C#
3. `d.json` - Progressions in D
4. `d-sharp.json` - Progressions in D#
5. `e.json` - Progressions in E
6. `f.json` - Progressions in F
7. `f-sharp.json` - Progressions in F#
8. `g.json` - Progressions in G
9. `g-sharp.json` - Progressions in G#
10. `a.json` - Progressions in A
11. `a-sharp.json` - Progressions in A#
12. `b.json` - Progressions in B

---

## 🔄 Data Generation Strategy

### Leverage Existing Data
The existing `music-theory/chord-progressions/*.json` files already contain:
- Chord definitions with notes
- Scale compatibility arrays
- Common progressions

**Strategy**:
1. **Extract** existing scaleCompatibility data from chord-progression-database.json files
2. **Transform** into chord-to-scale mappings
3. **Enhance** with additional metadata (genres, difficulty, famous songs)
4. **Generate** new files in the required structure

### Generation Scripts Priority

**Phase 1** (Essential):
1. `generateChordScaleCompatibility.ts` - Extract from existing data
2. `generateProgressionRecommendations.ts` - Transform existing progressions

**Phase 2** (Enhanced):
3. `generateChordRecommendations.ts` - Calculate diatonic/extended chords

### Data Validation
- Ensure all chord symbols are valid
- Verify scale intervals are correct
- Check compatibility scores are 1-10
- Validate JSON structure
- Cross-reference with existing music theory data

---

## 📊 Total Database Size Estimate

| Category | Files | Avg Size | Total Size |
|----------|-------|----------|------------|
| Chord-Scale Compatibility | 25 | 50 KB | 1.25 MB |
| Chord Recommendations | 144 | 30 KB | 4.32 MB |
| Progression Recommendations | 12 | 100 KB | 1.20 MB |
| **TOTAL** | **181** | - | **~6.77 MB** |

---

## ✅ Implementation Priority

### High Priority (MVP)
1. **Chord-Scale Compatibility** (25 files)
   - Essential for chord → scale recommendations
   - Can be generated from existing data

2. **Progression Recommendations** (12 files)
   - High user value
   - Can be extracted from existing commonProgressions

### Medium Priority
3. **Chord Recommendations** (144 files)
   - Useful but can be calculated on-the-fly initially
   - Can be generated algorithmically

### Optimization
- Start with most common keys (C, G, D, A, E, F)
- Generate on-demand for less common keys
- Cache results in localStorage/Supabase

---

**End of Database File Specification**


