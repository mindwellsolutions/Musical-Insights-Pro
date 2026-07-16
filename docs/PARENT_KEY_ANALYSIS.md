# Parent Key System Analysis

## The Problem

When a user selects a triad (e.g., **C Major**), the system should show all **7 modes of the parent key** that contains that triad, NOT just modes starting on C.

### Example: C Major Triad

**Parent Key:** C Major (C D E F G A B)

**The 7 Modes to Show:**
1. **C Ionian** - starts on C (C D E F G A B)
2. **D Dorian** - starts on D (D E F G A B C)
3. **E Phrygian** - starts on E (E F G A B C D)
4. **F Lydian** - starts on F (F G A B C D E)
5. **G Mixolydian** - starts on G (G A B C D E F)
6. **A Aeolian** - starts on A (A B C D E F G)
7. **B Locrian** - starts on B (B C D E F G A)

All 7 modes share the **same notes** but start on different degrees.

---

## Parent Key Derivation Rules

### Major Triads
**Rule:** The triad root IS the parent key root.
- **C Major triad** → Parent key: **C Major**
- **D Major triad** → Parent key: **D Major**
- **G Major triad** → Parent key: **G Major**

### Minor Triads
**Rule:** The triad is the 6th degree (Aeolian) of the parent major key.
- **C Minor triad** → Parent key: **Eb Major** (C is the 6th degree of Eb Major)
- **D Minor triad** → Parent key: **F Major** (D is the 6th degree of F Major)
- **A Minor triad** → Parent key: **C Major** (A is the 6th degree of C Major)

**Formula:** Parent key = triad root + 3 semitones (minor 3rd up)

### Diminished Triads
**Rule:** The triad is the 7th degree (Locrian) of the parent major key.
- **C Diminished triad** → Parent key: **Db Major** (C is the 7th degree of Db Major)
- **B Diminished triad** → Parent key: **C Major** (B is the 7th degree of C Major)
- **F# Diminished triad** → Parent key: **G Major** (F# is the 7th degree of G Major)

**Formula:** Parent key = triad root + 1 semitone (minor 2nd up)

### Augmented Triads
**Rule:** Augmented triads are NOT diatonic to major keys. They come from harmonic minor or other sources.
- **C Augmented** → Use **C Harmonic Minor** as parent, or show exotic scales
- Alternative: Show modes from **Melodic Minor** or **Whole Tone** scales

**Special Case:** Augmented triads don't fit the 7-mode diatonic system cleanly.

---

## The 7 Modes of Major Scale

For any major key, the 7 modes are:

| Degree | Mode | Quality | Formula | Example (C Major) |
|--------|------|---------|---------|-------------------|
| 1 | Ionian | Major | W-W-H-W-W-W-H | C Ionian |
| 2 | Dorian | Minor | W-H-W-W-W-H-W | D Dorian |
| 3 | Phrygian | Minor | H-W-W-W-H-W-W | E Phrygian |
| 4 | Lydian | Major | W-W-W-H-W-W-H | F Lydian |
| 5 | Mixolydian | Dominant | W-W-H-W-W-H-W | G Mixolydian |
| 6 | Aeolian | Minor | W-H-W-W-H-W-W | A Aeolian |
| 7 | Locrian | Diminished | H-W-W-H-W-W-W | B Locrian |

---

## Implementation Strategy

### Step 1: Calculate Parent Key
```typescript
function getParentKey(triadRoot: string, triadType: TriadType): string {
  switch (triadType) {
    case 'major':
      return triadRoot; // C Major → C Major parent
    case 'minor':
      return transposeNote(triadRoot, 3); // C Minor → Eb Major parent
    case 'diminished':
      return transposeNote(triadRoot, 1); // C Dim → Db Major parent
    case 'augmented':
      return triadRoot; // Special case - use harmonic minor or exotic
  }
}
```

### Step 2: Generate 7 Modes
```typescript
function getSevenModesOfKey(parentKey: string): ModeInfo[] {
  const modes = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
  const semitoneOffsets = [0, 2, 4, 5, 7, 9, 11]; // Scale degrees
  
  return modes.map((mode, index) => ({
    rootNote: transposeNote(parentKey, semitoneOffsets[index]),
    modeName: mode,
    displayName: `${transposeNote(parentKey, semitoneOffsets[index])} ${mode}`,
    scaleDbKey: mode,
    degree: index + 1
  }));
}
```

### Step 3: Display in Dropdown
```typescript
// For C Major triad:
const parentKey = getParentKey('C', 'major'); // Returns 'C'
const modes = getSevenModesOfKey('C'); // Returns 7 modes

// Dropdown shows:
// C Ionian ★
// D Dorian
// E Phrygian
// F Lydian
// G Mixolydian
// A Aeolian
// B Locrian
```

---

## Examples for All Triad Types

### C Major Triad
- **Parent Key:** C Major
- **7 Modes:** C Ionian, D Dorian, E Phrygian, F Lydian, G Mixolydian, A Aeolian, B Locrian

### C Minor Triad
- **Parent Key:** Eb Major (C is 6th degree)
- **7 Modes:** Eb Ionian, F Dorian, G Phrygian, Ab Lydian, Bb Mixolydian, C Aeolian ★, D Locrian

### C Diminished Triad
- **Parent Key:** Db Major (C is 7th degree)
- **7 Modes:** Db Ionian, Eb Dorian, F Phrygian, Gb Lydian, Ab Mixolydian, Bb Aeolian, C Locrian ★

### C Augmented Triad
- **Special Case:** Not diatonic to major scale
- **Options:**
  1. Use C Harmonic Minor modes (7 modes)
  2. Use Whole Tone, Augmented, Lydian Augmented (exotic scales)
  3. Use C Melodic Minor modes (7 modes)

---

## Key Insights

1. **Each triad type has a different parent key relationship**
2. **All 7 modes share the same notes** (just different starting points)
3. **The primary mode** is the one that matches the triad quality:
   - Major triad → Ionian is primary
   - Minor triad → Aeolian is primary
   - Diminished triad → Locrian is primary
4. **CAGED shapes align** because all modes use the same notes

---

## Next Steps

1. Create `lib/parent-key-calculator.ts`
2. Create `lib/seven-modes-generator.ts`
3. Update `lib/mode-compatibility-database.ts`
4. Update dropdown to show root note + mode name
5. Test all combinations

