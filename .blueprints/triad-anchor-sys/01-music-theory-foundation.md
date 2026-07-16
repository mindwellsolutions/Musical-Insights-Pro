# Music Theory Foundation for Pentatonic Triad System

## Executive Summary

This document establishes the complete music theory knowledge base required to implement the Pentatonic Triad System. Every algorithm, visualization, and interaction in the application must be grounded in these principles.

---

## 1. The Fretboard Coordinate System

### 1.1 Standard Guitar Tuning Reference
```
String 1 (High E): E4 - Thinnest string
String 2 (B):      B3
String 3 (G):      G3
String 4 (D):      D3
String 5 (A):      A2
String 6 (Low E):  E2 - Thickest string
```

### 1.2 Note-to-Fret Mapping Formula
Each fret represents one semitone (half step). The note at any position:

```
Note = OpenStringNote + FretNumber (in semitones)
```

### 1.3 Chromatic Scale Reference (12 Notes)
```
Index:  0    1    2    3    4    5    6    7    8    9    10   11
Note:   C    C#   D    D#   E    F    F#   G    G#   A    A#   B
        -    Db   -    Eb   -    -    Gb   -    Ab   -    Bb   -
```

### 1.4 Complete Fretboard Note Map (Frets 0-15)
```
Fret:    0    1    2    3    4    5    6    7    8    9    10   11   12   13   14   15
String 1: E    F    F#   G    G#   A    A#   B    C    C#   D    D#   E    F    F#   G
String 2: B    C    C#   D    D#   E    F    F#   G    G#   A    A#   B    C    C#   D
String 3: G    G#   A    A#   B    C    C#   D    D#   E    F    F#   G    G#   A    A#
String 4: D    D#   E    F    F#   G    G#   A    A#   B    C    C#   D    D#   E    F
String 5: A    A#   B    C    C#   D    D#   E    F    F#   G    G#   A    A#   B    C
String 6: E    F    F#   G    G#   A    A#   B    C    C#   D    D#   E    F    F#   G
```

---

## 2. The Relative Minor Relationship (Core Anchor Principle)

### 2.1 The "Down 3 Frets" Rule
The instructor's key insight: Every Major key has a Relative Minor located **3 semitones below** (or 9 semitones above).

**Formula:**
```
RelativeMinor = MajorRoot - 3 semitones
```

### 2.2 Complete Major-to-Relative-Minor Map
```
Major Key    →    Relative Minor
─────────────────────────────────
C Major      →    A Minor
C#/Db Major  →    A#/Bb Minor
D Major      →    B Minor
D#/Eb Major  →    C Minor
E Major      →    C# Minor
F Major      →    D Minor
F#/Gb Major  →    D#/Eb Minor
G Major      →    E Minor
G#/Ab Major  →    F Minor
A Major      →    F# Minor
A#/Bb Major  →    G Minor
B Major      →    G# Minor
```

### 2.3 Why This Matters for the System
When a user selects **C Major** as their key:
- The app displays the **A Minor Pentatonic** scale as the visual anchor
- Triads are positioned WITHIN this pentatonic framework
- This matches how the instructor teaches: "You already know the pentatonic box—now find the triads inside it"

---

## 3. Scale Formulas & Interval Structures

### 3.1 Major Scale Formula
```
Intervals: W - W - H - W - W - W - H
Semitones: 2 - 2 - 1 - 2 - 2 - 2 - 1
Degrees:   1 - 2 - 3 - 4 - 5 - 6 - 7

Example (C Major):
C - D - E - F - G - A - B - C
```

### 3.2 Minor Pentatonic Scale Formula (THE ANCHOR)
```
Intervals from Root: 1 - b3 - 4 - 5 - b7
Semitones from Root: 0 - 3 - 5 - 7 - 10

Example (A Minor Pentatonic):
A - C - D - E - G
```

### 3.3 Major Pentatonic Scale Formula
```
Intervals from Root: 1 - 2 - 3 - 5 - 6
Semitones from Root: 0 - 2 - 4 - 7 - 9

Example (C Major Pentatonic):
C - D - E - G - A
```

**Critical Insight:** A Minor Pentatonic and C Major Pentatonic contain the **exact same notes** (A, C, D, E, G). This is the foundation of the "anchor" concept.

### 3.4 The 5 Pentatonic Box Positions
Each position starts from a different note of the pentatonic scale:

```
Position 1 (Root Position):     Starts on Root (most common "box")
Position 2:                     Starts on b3/3
Position 3:                     Starts on 4/5
Position 4:                     Starts on 5/6
Position 5:                     Starts on b7/7
```

---

## 4. Triad Theory (Core Voicings)

### 4.1 Triad Definitions
A triad is a 3-note chord built by stacking thirds:

```
Triad Type        Intervals       Semitones from Root    Symbol
────────────────────────────────────────────────────────────────
Major             1 - 3 - 5       0 - 4 - 7              (none) or M
Minor             1 - b3 - 5      0 - 3 - 7              m or min
Diminished        1 - b3 - b5     0 - 3 - 6              dim or °
Augmented         1 - 3 - #5      0 - 4 - 8              aug or +
```

### 4.2 Triad Inversions
Each triad has 3 voicings based on which note is in the bass:

```
Inversion          Bass Note    Interval Stack    Voice Order
─────────────────────────────────────────────────────────────
Root Position      Root (1)     3rd above 5th     1 - 3 - 5
First Inversion    Third (3)    Root above 3rd    3 - 5 - 1
Second Inversion   Fifth (5)    3rd above Root    5 - 1 - 3
```

### 4.3 Example: C Major Triad All Inversions
```
Root Position:      C - E - G    (C in bass)
First Inversion:    E - G - C    (E in bass)
Second Inversion:   G - C - E    (G in bass)
```

---

## 5. String Set Logic (The "Limitation" Technique)

### 5.1 The Four Primary String Sets
The instructor limits triads to specific 3-string sets for clarity:

```
String Set          Strings              Character           Use Case
─────────────────────────────────────────────────────────────────────────
Set 1 (High)        1-2-3 (E-B-G)       Bright, cutting     Lead-like rhythm
Set 2 (Mid-High)    2-3-4 (B-G-D)       Balanced, clear     Most versatile
Set 3 (Mid-Low)     3-4-5 (G-D-A)       Warm, full          R&B, Soul
Set 4 (Low)         4-5-6 (D-A-E)       Deep, bass-heavy    Power chord zone
```

### 5.2 Why String Set Limitation Matters
- **Prevents muddiness**: Low strings + high strings together create sonic clutter
- **Professional sound**: Staying within a set creates cohesive voicings
- **Practical movement**: Hand stays in position, enabling voice leading

### 5.3 String Set to Frequency Range Mapping
```
Set 1 (E-B-G):   ~196 Hz to ~659 Hz  (Treble range)
Set 2 (B-G-D):   ~147 Hz to ~494 Hz  (Upper-mid range)
Set 3 (G-D-A):   ~110 Hz to ~392 Hz  (Lower-mid range)
Set 4 (D-A-E):   ~82 Hz to ~294 Hz   (Bass range)
```

---

## 6. Voice Leading Principles

### 6.1 Definition
Voice leading is the practice of moving individual notes (voices) smoothly between chords, minimizing distance traveled.

### 6.2 Voice Leading Rules for the System
```
Rule 1: Common Tones Stay    - If two chords share a note, keep it in the same position
Rule 2: Minimal Movement     - Move each voice to the nearest chord tone
Rule 3: Contrary Motion      - When possible, voices move in opposite directions
Rule 4: Step Priority        - Half-step or whole-step movement preferred over leaps
```

### 6.3 Voice Leading Distance Calculation
```javascript
// For any two triads, calculate "smoothness score"
voiceLeadingDistance = |note1_chord1 - note1_chord2| + 
                       |note2_chord1 - note2_chord2| + 
                       |note3_chord1 - note3_chord2|

// Lower score = smoother transition
// Score of 0-3: Excellent voice leading
// Score of 4-6: Good voice leading
// Score of 7+:  Consider different inversion
```

### 6.4 Example: C Major to A Minor Voice Leading
```
C Major (Root Position): C - E - G
A Minor (Root Position): A - C - E

Voice Movement:
C → A (down 3 semitones, or stay same fret on higher string)
E → C (down 4 semitones)
G → E (down 3 semitones)

Better Option - C Major to A Minor (1st Inversion):
C - E - G  →  C - E - A
Voice Movement:
C → C (0 movement - common tone!)
E → E (0 movement - common tone!)
G → A (up 2 semitones)

Total Distance: 2 semitones (EXCELLENT)
```

---

## 7. Diatonic Chord Theory

### 7.1 Chords in a Major Key
```
Degree    Roman Numeral    Quality       Example (Key of C)
──────────────────────────────────────────────────────────
I         I               Major         C
ii        ii              Minor         Dm
iii       iii             Minor         Em
IV        IV              Major         F
V         V               Major         G
vi        vi              Minor         Am
vii°      vii°            Diminished    Bdim
```

### 7.2 Common Progressions to Support
```
Progression     Numerals        Example (C Major)       Genre
───────────────────────────────────────────────────────────────
Pop/Rock        I-V-vi-IV       C-G-Am-F               Pop, Rock
50s             I-vi-IV-V       C-Am-F-G               Doo-wop, Ballads
Jazz ii-V-I     ii-V-I          Dm-G-C                 Jazz
Blues           I-IV-I-V        C-F-C-G                Blues, Rock
Sad             vi-IV-I-V       Am-F-C-G               Emotional Pop
Folk            I-IV-I-V        C-F-C-G                Folk, Country
```

---

## 8. The Two-Note "Breathing" Technique

### 8.1 Concept
Remove the middle note of a triad to create "sonic space":

```
Full Triad:        1 - 3 - 5
Outside Notes:     1 - - - 5    (Shell voicing)
Top Notes:         - - 3 - 5    (Upper structure)
```

### 8.2 Application by String Set
```
String Set 2-3-4 (B-G-D):
Full C Major:      E(B) - C(G) - G(D)
Outside (D+B):     - - - - C(G) - G(D)... wait, remove middle
Actually:          G(D) + E(B) = Outside shell
```

### 8.3 When to Use Two-Note Voicings
- Dense arrangements (multiple instruments)
- Avoiding mud with bass player
- Creating rhythmic "chops"
- Neo-soul / R&B "breath" sound

---

## 9. Embellishment Theory

### 9.1 Pentatonic-Based Embellishments
Since triads live within the pentatonic box, available embellishments are:

```
Embellishment Type    Source Note      Target Note       Technique
─────────────────────────────────────────────────────────────────────
Hammer-on            Pentatonic note   Triad note        Ascending slur
Pull-off             Triad note        Pentatonic note   Descending slur
Slide Up             One fret below    Triad note        Glissando
Slide Down           Triad note        One fret below    Glissando
Grace Note           Adjacent pent.    Triad note        Quick approach
```

### 9.2 The "One Fret Below" Rule
The instructor emphasizes sliding INTO triad notes from one fret below:
- Creates professional "scoop" sound
- Works on any note of the triad
- Should be visualized as "approach indicators"

---

## 10. Zone Theory (Fretboard Geography)

### 10.1 Zone Definitions
```
Zone        Fret Range    CAGED Shape    Character
────────────────────────────────────────────────────
Zone 1      0-3          Open/E shape    Familiar, resonant
Zone 2      2-6          D shape         Slightly warmer
Zone 3      5-9          C shape         Center of neck
Zone 4      7-11         A shape         Sweet spot
Zone 5      10-14        G shape         Tight, bright
Zone 6      12-15        E shape (8va)   High, cutting
```

### 10.2 Zone Overlap Design
Zones overlap by 1-2 frets to enable smooth transitions:
```
Zone 1: ████████░░░░░░░░░░░░░░░░░░░░
Zone 2: ░░░░████████░░░░░░░░░░░░░░░░
Zone 3: ░░░░░░░░░░████████░░░░░░░░░░
Zone 4: ░░░░░░░░░░░░░░████████░░░░░░
Zone 5: ░░░░░░░░░░░░░░░░░░░░████████
        0  2  4  6  8  10 12 14 16
```

---

## 11. Chord-Scale Relationships

### 11.1 Which Pentatonic Over Which Chord
```
Chord Type          Compatible Pentatonic       Relationship
───────────────────────────────────────────────────────────────
Major (I, IV)       Major Pentatonic            Same root
Minor (ii, iii, vi) Minor Pentatonic            Same root
Dominant (V)        Major Pentatonic            Same root
                    Minor Pentatonic            Up a 4th
Diminished (vii°)   Avoid or Half-Whole Dim     Special case
```

### 11.2 The "Compatible Neighborhood" Logic
For any triad, nearby compatible chords are:
```
Primary Chord    →    1 fret away    →    Same fret different string    →    Relative Major/Minor
     ↓                                                                             ↓
Voice-led chord                                                              3 frets away
```

---

## 12. Complete Triad Shape Library

### 12.1 Major Triad Shapes (All String Sets, All Inversions)

#### Strings 1-2-3 (E-B-G)
```
Root Position:     1st Inversion:     2nd Inversion:
e|--R--            e|--5--            e|--3--
B|--5--            B|--R--            B|--R--
G|--3--            G|--3--            G|--5--
```

#### Strings 2-3-4 (B-G-D)
```
Root Position:     1st Inversion:     2nd Inversion:
B|--R--            B|--5--            B|--3--
G|--5--            G|--R--            G|--R--
D|--3--            D|--3--            D|--5--
```

#### Strings 3-4-5 (G-D-A)
```
Root Position:     1st Inversion:     2nd Inversion:
G|--R--            G|--5--            G|--3--
D|--5--            D|--R--            D|--R--
A|--3--            A|--3--            A|--5--
```

#### Strings 4-5-6 (D-A-E)
```
Root Position:     1st Inversion:     2nd Inversion:
D|--R--            D|--5--            D|--3--
A|--5--            A|--R--            A|--R--
E|--3--            E|--3--            E|--5--
```

### 12.2 Minor Triad Shapes (All String Sets, All Inversions)

#### Strings 1-2-3 (E-B-G)
```
Root Position:     1st Inversion:     2nd Inversion:
e|--R--            e|--5--            e|--b3--
B|--5--            B|--R--            B|--R--
G|--b3--           G|--b3--           G|--5--
```

[Pattern continues for all string sets - identical structure to major with b3 instead of 3]

### 12.3 Diminished Triad Shapes
```
Formula: R - b3 - b5
[Same string set patterns with b3 and b5]
```

### 12.4 Augmented Triad Shapes
```
Formula: R - 3 - #5
[Same string set patterns with 3 and #5]
```

---

## 13. Fingering Conventions

### 13.1 Standard Finger Numbering
```
Index Finger:   1
Middle Finger:  2
Ring Finger:    3
Pinky Finger:   4
Thumb:          T (rarely used for fretting)
```

### 13.2 Recommended Triad Fingerings by Shape

#### 3-String Triads (General Rule)
```
Lowest String:   Finger 1 or 2
Middle String:   Finger 2 or 3
Highest String:  Finger 3 or 4
```

#### Context-Dependent Adjustments
```
If embellishing:     Use fingering that frees pinky (4) for extensions
If moving up:        Start with 1 to allow position shift
If moving down:      Start with 3 or 4 to allow position shift
```

---

## Summary: Key Formulas for Implementation

```javascript
// Core Calculations
relativeMinor = (majorRoot - 3 + 12) % 12
relativeMajor = (minorRoot + 3) % 12
noteAtFret = (openStringNote + fret) % 12

// Triad Construction
majorTriad = [root, root + 4, root + 7]
minorTriad = [root, root + 3, root + 7]
dimTriad = [root, root + 3, root + 6]
augTriad = [root, root + 4, root + 8]

// Pentatonic Construction
minorPentatonic = [root, root + 3, root + 5, root + 7, root + 10]
majorPentatonic = [root, root + 2, root + 4, root + 7, root + 9]

// Voice Leading Score
smoothnessScore = sumOfSemitoneDistancesBetweenVoices
```

---

*This document provides the complete theoretical foundation. All application features must be derived from these principles.*
