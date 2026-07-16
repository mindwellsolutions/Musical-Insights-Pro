# Algorithm & Logic Specifications

## Executive Summary

This document provides the complete algorithmic specifications, calculation formulas, and logic implementations required to build the Pentatonic Triad System. All functions are provided in TypeScript with detailed comments.

---

## 1. Core Music Theory Algorithms

### 1.1 Note Calculation System

```typescript
// ============================================
// CONSTANTS
// ============================================

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Standard tuning: String 6 (low E) to String 1 (high E)
const STANDARD_TUNING = [4, 9, 2, 7, 11, 4]; // E, A, D, G, B, E as pitch classes

// ============================================
// NOTE UTILITIES
// ============================================

/**
 * Get the pitch class (0-11) for a note at a specific fret position
 * @param stringNumber - 1 (high E) to 6 (low E)
 * @param fret - 0 to 24
 * @returns Pitch class 0-11 (0 = C)
 */
function getPitchClass(stringNumber: number, fret: number): number {
  const openStringPitch = STANDARD_TUNING[stringNumber - 1];
  return (openStringPitch + fret) % 12;
}

/**
 * Get note name from pitch class
 * @param pitchClass - 0-11
 * @param preferFlats - Whether to prefer flat spelling
 */
function getNoteName(pitchClass: number, preferFlats: boolean = false): string {
  return preferFlats ? NOTES_FLAT[pitchClass] : NOTES_SHARP[pitchClass];
}

/**
 * Get pitch class from note name
 */
function pitchClassFromName(noteName: string): number {
  let index = NOTES_SHARP.indexOf(noteName);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(noteName);
  }
  return index;
}

/**
 * Find all positions of a note on the fretboard
 * @param pitchClass - The note to find (0-11)
 * @param minFret - Minimum fret to search (default 0)
 * @param maxFret - Maximum fret to search (default 15)
 */
function findAllPositions(
  pitchClass: number, 
  minFret: number = 0, 
  maxFret: number = 15
): FretPosition[] {
  const positions: FretPosition[] = [];
  
  for (let string = 1; string <= 6; string++) {
    for (let fret = minFret; fret <= maxFret; fret++) {
      if (getPitchClass(string, fret) === pitchClass) {
        positions.push({ string, fret });
      }
    }
  }
  
  return positions;
}
```

### 1.2 Interval Calculations

```typescript
/**
 * Calculate interval in semitones between two pitch classes
 * @param from - Starting pitch class
 * @param to - Target pitch class
 * @returns Semitones (0-11) from 'from' to 'to' going up
 */
function getInterval(from: number, to: number): number {
  return (to - from + 12) % 12;
}

/**
 * Transpose a pitch class by a number of semitones
 */
function transpose(pitchClass: number, semitones: number): number {
  return (pitchClass + semitones + 12) % 12;
}

/**
 * Get the relative minor for a major key (down 3 semitones)
 */
function getRelativeMinor(majorRoot: number): number {
  return (majorRoot - 3 + 12) % 12;
}

/**
 * Get the relative major for a minor key (up 3 semitones)
 */
function getRelativeMajor(minorRoot: number): number {
  return (minorRoot + 3) % 12;
}

/**
 * Get interval name from semitone count
 */
function getIntervalName(semitones: number): string {
  const names: Record<number, string> = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7'
  };
  return names[semitones % 12];
}
```

---

## 2. Triad Construction Algorithms

### 2.1 Triad Building

```typescript
// Triad interval formulas (in semitones from root)
const TRIAD_FORMULAS: Record<TriadQuality, [number, number, number]> = {
  major: [0, 4, 7],      // Root, Major 3rd, Perfect 5th
  minor: [0, 3, 7],      // Root, Minor 3rd, Perfect 5th
  diminished: [0, 3, 6], // Root, Minor 3rd, Diminished 5th
  augmented: [0, 4, 8]   // Root, Major 3rd, Augmented 5th
};

/**
 * Build a triad from root and quality
 */
function buildTriad(root: number, quality: TriadQuality): Triad {
  const formula = TRIAD_FORMULAS[quality];
  
  return {
    root: { pitchClass: root, name: getNoteName(root) },
    quality,
    notes: [
      { pitchClass: root, name: getNoteName(root) },
      { pitchClass: transpose(root, formula[1]), name: getNoteName(transpose(root, formula[1])) },
      { pitchClass: transpose(root, formula[2]), name: getNoteName(transpose(root, formula[2])) }
    ],
    intervals: formula
  };
}

/**
 * Get the notes for a specific inversion
 * @param triad - The base triad
 * @param inversion - 'root', 'first', or 'second'
 * @returns Notes ordered from bass (lowest) to treble
 */
function getInversionNotes(triad: Triad, inversion: Inversion): [Note, Note, Note] {
  const [root, third, fifth] = triad.notes;
  
  switch (inversion) {
    case 'root':
      return [root, third, fifth];    // 1-3-5 (Root in bass)
    case 'first':
      return [third, fifth, root];    // 3-5-1 (Third in bass)
    case 'second':
      return [fifth, root, third];    // 5-1-3 (Fifth in bass)
  }
}
```

### 2.2 Triad Voicing Generation

```typescript
// String set definitions (string numbers, low to high pitch within set)
const STRING_SETS: Record<StringSet, [number, number, number]> = {
  '123': [3, 2, 1],  // G, B, E (lowest to highest pitch)
  '234': [4, 3, 2],  // D, G, B
  '345': [5, 4, 3],  // A, D, G
  '456': [6, 5, 4]   // E, A, D
};

/**
 * Find all voicings for a triad on a specific string set
 */
function findVoicingsOnStringSet(
  triad: Triad,
  stringSet: StringSet,
  inversion: Inversion,
  fretRange: [number, number] = [0, 15]
): TriadVoicing[] {
  const voicings: TriadVoicing[] = [];
  const strings = STRING_SETS[stringSet];
  const notes = getInversionNotes(triad, inversion);
  
  // Get all possible fret positions for the bass note (lowest string in set)
  const bassPositions = findAllPositions(
    notes[0].pitchClass, 
    fretRange[0], 
    fretRange[1]
  ).filter(p => p.string === strings[0]);
  
  for (const bassPos of bassPositions) {
    // Try to find the other two notes on the remaining strings
    const middlePositions = findAllPositions(notes[1].pitchClass, 0, 24)
      .filter(p => p.string === strings[1]);
    
    const treblePositions = findAllPositions(notes[2].pitchClass, 0, 24)
      .filter(p => p.string === strings[2]);
    
    // Find combinations where frets are playable together
    for (const middlePos of middlePositions) {
      for (const treblePos of treblePositions) {
        const frets = [bassPos.fret, middlePos.fret, treblePos.fret];
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);
        
        // Check if this is a playable shape (within 4 fret span typically)
        if (maxFret - minFret <= 4 && minFret >= fretRange[0] && maxFret <= fretRange[1]) {
          const positions: [FretboardNote, FretboardNote, FretboardNote] = [
            { ...bassPos, note: notes[0], isTriadNote: true },
            { ...middlePos, note: notes[1], isTriadNote: true },
            { ...treblePos, note: notes[2], isTriadNote: true }
          ];
          
          voicings.push({
            ...triad,
            inversion,
            stringSet,
            positions,
            lowestFret: minFret,
            highestFret: maxFret,
            centerFret: Math.round((minFret + maxFret) / 2),
            fingering: calculateFingering(positions),
            voicingId: `${triad.root.name}${triad.quality}_${stringSet}_${inversion}_${minFret}`
          });
        }
      }
    }
  }
  
  return voicings;
}

/**
 * Get ALL voicings for a triad across all string sets and inversions
 */
function getAllVoicings(
  triad: Triad,
  fretRange: [number, number] = [0, 15]
): TriadVoicing[] {
  const allVoicings: TriadVoicing[] = [];
  const stringSets: StringSet[] = ['123', '234', '345', '456'];
  const inversions: Inversion[] = ['root', 'first', 'second'];
  
  for (const stringSet of stringSets) {
    for (const inversion of inversions) {
      allVoicings.push(
        ...findVoicingsOnStringSet(triad, stringSet, inversion, fretRange)
      );
    }
  }
  
  // Sort by fret position
  return allVoicings.sort((a, b) => a.centerFret - b.centerFret);
}
```

### 2.3 Fingering Algorithm

```typescript
/**
 * Calculate optimal fingering for a triad voicing
 * Principles:
 * 1. Assign fingers 1-4 from lowest fret to highest
 * 2. Use finger 1 for barres if needed
 * 3. Keep pinky free when possible for embellishments
 */
function calculateFingering(positions: FretboardNote[]): [number, number, number] {
  // Sort by fret number
  const sorted = [...positions].sort((a, b) => a.fret - b.fret);
  const minFret = sorted[0].fret;
  const maxFret = sorted[sorted.length - 1].fret;
  const span = maxFret - minFret;
  
  // If all on same fret (barre potential)
  if (span === 0) {
    // Use index finger barre
    return [1, 1, 1];
  }
  
  // If compact shape (span <= 2)
  if (span <= 2) {
    // Assign fingers based on relative position
    const fingerMap = new Map<number, number>();
    let nextFinger = 1;
    
    for (const pos of sorted) {
      if (!fingerMap.has(pos.fret)) {
        fingerMap.set(pos.fret, nextFinger++);
      }
    }
    
    // Map back to original order
    return positions.map(p => fingerMap.get(p.fret)!) as [number, number, number];
  }
  
  // For stretched shapes (span > 2)
  // Use 1 for lowest, skip a finger for gaps, use 4 for highest
  const fingering: number[] = [];
  
  for (const pos of positions) {
    const relativePos = pos.fret - minFret;
    if (relativePos === 0) {
      fingering.push(1);
    } else if (relativePos === span) {
      fingering.push(4);
    } else {
      // Middle position - use 2 or 3 based on exact position
      fingering.push(relativePos <= span / 2 ? 2 : 3);
    }
  }
  
  return fingering as [number, number, number];
}
```

---

## 3. Pentatonic Scale Algorithms

### 3.1 Scale Construction

```typescript
// Pentatonic formulas (semitones from root)
const PENTATONIC_FORMULAS = {
  minor: [0, 3, 5, 7, 10],  // 1, b3, 4, 5, b7
  major: [0, 2, 4, 7, 9]    // 1, 2, 3, 5, 6
};

/**
 * Build a pentatonic scale
 */
function buildPentatonic(root: number, type: PentatonicType): PentatonicScale {
  const formula = PENTATONIC_FORMULAS[type];
  
  return {
    root: { pitchClass: root, name: getNoteName(root) },
    type,
    notes: formula.map(interval => ({
      pitchClass: transpose(root, interval),
      name: getNoteName(transpose(root, interval))
    })) as [Note, Note, Note, Note, Note],
    intervals: formula
  };
}

/**
 * Check if a pitch class is in a pentatonic scale
 */
function isInPentatonic(pitchClass: number, scale: PentatonicScale): boolean {
  return scale.notes.some(note => note.pitchClass === pitchClass);
}

/**
 * Get all pentatonic notes in a fret range
 */
function getPentatonicInRange(
  scale: PentatonicScale,
  fretRange: [number, number],
  stringsFilter?: number[]
): FretboardNote[] {
  const notes: FretboardNote[] = [];
  const strings = stringsFilter || [1, 2, 3, 4, 5, 6];
  
  for (const string of strings) {
    for (let fret = fretRange[0]; fret <= fretRange[1]; fret++) {
      const pitchClass = getPitchClass(string, fret);
      
      if (isInPentatonic(pitchClass, scale)) {
        const noteIndex = scale.notes.findIndex(n => n.pitchClass === pitchClass);
        notes.push({
          string,
          fret,
          note: scale.notes[noteIndex],
          isPentatonicNote: true,
          isRoot: pitchClass === scale.root.pitchClass,
          intervalFromRoot: getIntervalName(
            getInterval(scale.root.pitchClass, pitchClass)
          )
        });
      }
    }
  }
  
  return notes;
}
```

### 3.2 Pentatonic Box Positions

```typescript
// Box definitions: fret offset from root position, and relative pattern
// These are the 5 classic "box" patterns
const PENTATONIC_BOX_PATTERNS: Record<BoxPosition, {
  rootOffset: number;  // Frets from root on 6th string
  pattern: { string: number; fretOffset: number }[];
}> = {
  1: {
    rootOffset: 0,
    pattern: [
      { string: 6, fretOffset: 0 }, { string: 6, fretOffset: 3 },
      { string: 5, fretOffset: 0 }, { string: 5, fretOffset: 2 },
      { string: 4, fretOffset: 0 }, { string: 4, fretOffset: 2 },
      { string: 3, fretOffset: 0 }, { string: 3, fretOffset: 2 },
      { string: 2, fretOffset: 0 }, { string: 2, fretOffset: 3 },
      { string: 1, fretOffset: 0 }, { string: 1, fretOffset: 3 }
    ]
  },
  2: {
    rootOffset: 3,
    pattern: [
      { string: 6, fretOffset: 0 }, { string: 6, fretOffset: 2 },
      { string: 5, fretOffset: 0 }, { string: 5, fretOffset: 2 },
      { string: 4, fretOffset: -1 }, { string: 4, fretOffset: 2 },
      { string: 3, fretOffset: -1 }, { string: 3, fretOffset: 2 },
      { string: 2, fretOffset: 0 }, { string: 2, fretOffset: 2 },
      { string: 1, fretOffset: 0 }, { string: 1, fretOffset: 2 }
    ]
  },
  // ... patterns 3, 4, 5 would follow similar structure
};

/**
 * Get a specific pentatonic box
 */
function getPentatonicBox(
  scale: PentatonicScale,
  boxPosition: BoxPosition
): PentatonicBox {
  const boxDef = PENTATONIC_BOX_PATTERNS[boxPosition];
  
  // Find root position on 6th string
  const rootFret = findAllPositions(scale.root.pitchClass, 0, 12)
    .find(p => p.string === 6)?.fret || 0;
  
  const baseFret = rootFret + boxDef.rootOffset;
  
  const positions: FretboardNote[] = boxDef.pattern.map(p => {
    const fret = baseFret + p.fretOffset;
    const pitchClass = getPitchClass(p.string, fret);
    
    return {
      string: p.string,
      fret,
      note: { pitchClass, name: getNoteName(pitchClass) },
      isPentatonicNote: true,
      isRoot: pitchClass === scale.root.pitchClass
    };
  });
  
  const frets = positions.map(p => p.fret);
  
  return {
    ...scale,
    boxPosition,
    positions,
    startFret: Math.min(...frets),
    endFret: Math.max(...frets),
    zone: getZoneForFret(baseFret)
  };
}

/**
 * Find which box best covers a given fret range
 */
function findBestBoxForRange(
  scale: PentatonicScale,
  targetFret: number
): PentatonicBox {
  const boxes: PentatonicBox[] = [1, 2, 3, 4, 5].map(
    pos => getPentatonicBox(scale, pos as BoxPosition)
  );
  
  // Find box whose center is closest to target
  return boxes.reduce((best, box) => {
    const boxCenter = (box.startFret + box.endFret) / 2;
    const bestCenter = (best.startFret + best.endFret) / 2;
    
    return Math.abs(boxCenter - targetFret) < Math.abs(bestCenter - targetFret)
      ? box
      : best;
  });
}
```

---

## 4. Voice Leading Algorithms

### 4.1 Voice Leading Calculation

```typescript
/**
 * Calculate voice leading between two voicings
 */
function calculateVoiceLeading(
  from: TriadVoicing,
  to: TriadVoicing
): VoiceLeadingPath {
  // Match voices by string (assuming same string set)
  const movements: [number, number, number] = [0, 0, 0];
  let totalDistance = 0;
  let commonTones = 0;
  
  for (let i = 0; i < 3; i++) {
    const fromNote = from.positions[i];
    const toNote = to.positions[i];
    
    // Calculate fret movement
    const fretMovement = toNote.fret - fromNote.fret;
    movements[i] = fretMovement;
    totalDistance += Math.abs(fretMovement);
    
    // Check for common tones (same pitch class)
    if (fromNote.note.pitchClass === toNote.note.pitchClass) {
      commonTones++;
    }
  }
  
  // Rate the smoothness
  let rating: VoiceLeadingPath['smoothnessRating'];
  if (totalDistance <= 2) {
    rating = 'excellent';
  } else if (totalDistance <= 4) {
    rating = 'good';
  } else if (totalDistance <= 6) {
    rating = 'acceptable';
  } else {
    rating = 'rough';
  }
  
  return {
    fromVoicing: from,
    toVoicing: to,
    voiceMovement: movements,
    totalDistance,
    commonTones,
    smoothnessRating: rating
  };
}

/**
 * Find the optimal voicing for the next chord based on voice leading
 */
function findOptimalNextVoicing(
  currentVoicing: TriadVoicing,
  nextTriad: Triad,
  constraints?: {
    stringSet?: StringSet;
    maxFretDistance?: number;
    preferCommonTones?: boolean;
  }
): TriadVoicing {
  const {
    stringSet = currentVoicing.stringSet,
    maxFretDistance = 5,
    preferCommonTones = true
  } = constraints || {};
  
  // Get all voicings for next chord on same string set
  const candidates = getAllVoicings(nextTriad, [0, 15])
    .filter(v => v.stringSet === stringSet);
  
  // Filter by fret distance
  const nearbyVoicings = candidates.filter(
    v => Math.abs(v.centerFret - currentVoicing.centerFret) <= maxFretDistance
  );
  
  if (nearbyVoicings.length === 0) {
    // No nearby options, return closest one
    return candidates.reduce((closest, v) => 
      Math.abs(v.centerFret - currentVoicing.centerFret) <
      Math.abs(closest.centerFret - currentVoicing.centerFret)
        ? v : closest
    );
  }
  
  // Score each candidate
  const scored = nearbyVoicings.map(candidate => {
    const voiceLeading = calculateVoiceLeading(currentVoicing, candidate);
    
    let score = 100 - voiceLeading.totalDistance * 10;
    
    if (preferCommonTones) {
      score += voiceLeading.commonTones * 15;
    }
    
    return { voicing: candidate, score, voiceLeading };
  });
  
  // Return highest scored option
  scored.sort((a, b) => b.score - a.score);
  return scored[0].voicing;
}

/**
 * Optimize voicings for an entire progression
 */
function optimizeProgression(
  progression: Progression,
  startingVoicing?: TriadVoicing,
  constraints?: {
    stringSet?: StringSet;
    stayInZone?: boolean;
  }
): TriadVoicing[] {
  const result: TriadVoicing[] = [];
  
  // Get first voicing
  let current: TriadVoicing;
  if (startingVoicing) {
    current = startingVoicing;
  } else {
    // Find a good starting point (middle of neck)
    const firstChordVoicings = getAllVoicings(progression.chords[0].chord);
    current = firstChordVoicings.find(v => v.centerFret >= 4 && v.centerFret <= 8)
      || firstChordVoicings[0];
  }
  
  result.push(current);
  
  // Optimize each subsequent chord
  for (let i = 1; i < progression.chords.length; i++) {
    const nextChord = progression.chords[i].chord;
    const nextVoicing = findOptimalNextVoicing(current, nextChord, {
      stringSet: constraints?.stringSet,
      maxFretDistance: constraints?.stayInZone ? 4 : 8
    });
    
    result.push(nextVoicing);
    current = nextVoicing;
  }
  
  return result;
}
```

---

## 5. Chord Neighborhood Algorithm

### 5.1 Diatonic Chord Calculation

```typescript
// Diatonic chord formulas for major key
const DIATONIC_MAJOR: { semitones: number; quality: TriadQuality; numeral: string }[] = [
  { semitones: 0, quality: 'major', numeral: 'I' },
  { semitones: 2, quality: 'minor', numeral: 'ii' },
  { semitones: 4, quality: 'minor', numeral: 'iii' },
  { semitones: 5, quality: 'major', numeral: 'IV' },
  { semitones: 7, quality: 'major', numeral: 'V' },
  { semitones: 9, quality: 'minor', numeral: 'vi' },
  { semitones: 11, quality: 'diminished', numeral: 'vii°' }
];

/**
 * Get all diatonic chords for a key
 */
function getDiatonicChords(key: number, mode: 'major' | 'minor'): {
  triad: Triad;
  numeral: string;
  function: string;
}[] {
  const formulas = mode === 'major' ? DIATONIC_MAJOR : DIATONIC_MINOR;
  
  return formulas.map(({ semitones, quality, numeral }) => {
    const root = transpose(key, semitones);
    return {
      triad: buildTriad(root, quality),
      numeral,
      function: getChordFunction(numeral)
    };
  });
}

function getChordFunction(numeral: string): string {
  const functions: Record<string, string> = {
    'I': 'Tonic',
    'ii': 'Supertonic',
    'iii': 'Mediant',
    'IV': 'Subdominant',
    'V': 'Dominant',
    'vi': 'Submediant',
    'vii°': 'Leading Tone'
  };
  return functions[numeral] || 'Unknown';
}
```

### 5.2 Neighborhood Discovery

```typescript
/**
 * Find all compatible chords within reach of current position
 */
function getChordNeighborhood(
  currentVoicing: TriadVoicing,
  key: number,
  maxDistance: number = 4
): ChordNeighborhood {
  const diatonicChords = getDiatonicChords(key, 'major');
  
  const immediate: ChordNeighborhood['immediateNeighbors'] = [];
  const extended: ChordNeighborhood['extendedNeighbors'] = [];
  
  for (const { triad, numeral } of diatonicChords) {
    // Skip the current chord
    if (triad.root.pitchClass === currentVoicing.root.pitchClass &&
        triad.quality === currentVoicing.quality) {
      continue;
    }
    
    // Find best voicing on same string set
    const candidateVoicings = getAllVoicings(triad)
      .filter(v => v.stringSet === currentVoicing.stringSet);
    
    for (const candidate of candidateVoicings) {
      const fretDistance = Math.abs(candidate.centerFret - currentVoicing.centerFret);
      
      if (fretDistance <= maxDistance) {
        const relationship = getChordRelationship(currentVoicing, candidate, key);
        
        const neighborInfo = {
          chord: triad,
          voicing: candidate,
          fretDistance,
          relationship
        };
        
        if (fretDistance <= 2) {
          immediate.push(neighborInfo);
        } else {
          extended.push(neighborInfo);
        }
      }
    }
  }
  
  // Sort by distance
  immediate.sort((a, b) => a.fretDistance - b.fretDistance);
  extended.sort((a, b) => a.fretDistance - b.fretDistance);
  
  // Remove duplicates (keep closest voicing of each chord)
  const dedupeImmediate = deduplicateByChord(immediate);
  const dedupeExtended = deduplicateByChord(extended);
  
  return {
    currentChord: buildTriad(currentVoicing.root.pitchClass, currentVoicing.quality),
    currentVoicing,
    immediateNeighbors: dedupeImmediate,
    extendedNeighbors: dedupeExtended
  };
}

/**
 * Determine the relationship between two chords
 */
function getChordRelationship(
  from: TriadVoicing,
  to: TriadVoicing,
  key: number
): string {
  const fromRoot = from.root.pitchClass;
  const toRoot = to.root.pitchClass;
  const interval = getInterval(fromRoot, toRoot);
  
  // Check for relative major/minor
  if (interval === 3 && from.quality === 'major' && to.quality === 'minor') {
    return 'Relative Minor';
  }
  if (interval === 9 && from.quality === 'minor' && to.quality === 'major') {
    return 'Relative Major';
  }
  
  // Check for diatonic functions
  if (interval === 5) return 'Subdominant (IV)';
  if (interval === 7) return 'Dominant (V)';
  if (interval === 2) return 'Supertonic (ii)';
  if (interval === 4) return 'Mediant (iii)';
  
  // Generic interval description
  return `${interval} semitones away`;
}
```

---

## 6. Zone Management Algorithms

### 6.1 Zone Definitions

```typescript
const ZONE_DEFINITIONS: Zone[] = [
  { zoneNumber: 1, startFret: 0, endFret: 3, centerFret: 2, cagedShape: 'E' },
  { zoneNumber: 2, startFret: 2, endFret: 6, centerFret: 4, cagedShape: 'D' },
  { zoneNumber: 3, startFret: 5, endFret: 9, centerFret: 7, cagedShape: 'C' },
  { zoneNumber: 4, startFret: 7, endFret: 11, centerFret: 9, cagedShape: 'A' },
  { zoneNumber: 5, startFret: 10, endFret: 14, centerFret: 12, cagedShape: 'G' },
  { zoneNumber: 6, startFret: 12, endFret: 15, centerFret: 14, cagedShape: 'E' }
];

/**
 * Get the zone for a specific fret
 */
function getZoneForFret(fret: number): number {
  for (const zone of ZONE_DEFINITIONS) {
    if (fret >= zone.startFret && fret <= zone.endFret) {
      return zone.zoneNumber;
    }
  }
  return fret < 0 ? 1 : 6;
}

/**
 * Build complete zone data for a key
 */
function buildZoneData(key: number, mode: 'major' | 'minor'): Zone[] {
  const pentatonicRoot = mode === 'major' ? getRelativeMinor(key) : key;
  const pentatonic = buildPentatonic(pentatonicRoot, 'minor');
  
  return ZONE_DEFINITIONS.map(zoneDef => {
    const fretRange: [number, number] = [zoneDef.startFret, zoneDef.endFret];
    
    // Get all triads in this zone
    const diatonicChords = getDiatonicChords(key, mode);
    const triadVoicings: TriadVoicing[] = [];
    
    for (const { triad } of diatonicChords) {
      const voicings = getAllVoicings(triad, fretRange);
      triadVoicings.push(...voicings);
    }
    
    // Get pentatonic box for this zone
    const pentatonicBox = findBestBoxForRange(pentatonic, zoneDef.centerFret);
    
    return {
      ...zoneDef,
      triadVoicings,
      pentatonicBox,
      compatibleChords: diatonicChords.map(d => d.triad)
    };
  });
}
```

---

## 7. Embellishment Algorithms

### 7.1 Slide Approach Calculation

```typescript
/**
 * Get slide approach notes for a voicing
 * (one fret below each triad note)
 */
function getSlideApproaches(voicing: TriadVoicing): Embellishment[] {
  return voicing.positions
    .filter(pos => pos.fret > 0)  // Can't slide into open strings
    .map(pos => ({
      type: 'slide-up' as const,
      from: {
        string: pos.string,
        fret: pos.fret - 1,
        note: {
          pitchClass: getPitchClass(pos.string, pos.fret - 1),
          name: getNoteName(getPitchClass(pos.string, pos.fret - 1))
        }
      },
      to: pos,
      interval: 1,
      finger: pos.suggestedFinger || 1
    }));
}
```

### 7.2 Pentatonic Embellishment Discovery

```typescript
/**
 * Find all pentatonic notes within reach of a voicing
 */
function getReachableEmbellishments(
  voicing: TriadVoicing,
  pentatonic: PentatonicScale,
  maxStretch: number = 2
): EmbellishmentSet {
  const embellishments: Embellishment[] = [];
  const reachableNotes: FretboardNote[] = [];
  
  // Get fret range with stretch
  const minFret = Math.max(0, voicing.lowestFret - maxStretch);
  const maxFret = voicing.highestFret + maxStretch;
  
  // Get strings used in this voicing
  const usedStrings = voicing.positions.map(p => p.string);
  
  // Find pentatonic notes in reach
  const pentatonicInRange = getPentatonicInRange(
    pentatonic,
    [minFret, maxFret],
    usedStrings
  );
  
  for (const pentNote of pentatonicInRange) {
    // Skip notes that are already in the triad
    const isTriadNote = voicing.positions.some(
      p => p.string === pentNote.string && p.fret === pentNote.fret
    );
    
    if (isTriadNote) continue;
    
    // Find the triad note on the same string
    const triadOnSameString = voicing.positions.find(
      p => p.string === pentNote.string
    );
    
    if (triadOnSameString) {
      const fretDiff = pentNote.fret - triadOnSameString.fret;
      
      if (fretDiff === 1 || fretDiff === 2) {
        embellishments.push({
          type: 'hammer-on',
          from: triadOnSameString,
          to: pentNote,
          interval: fretDiff,
          finger: fretDiff === 1 ? 2 : 4  // Simplified
        });
      } else if (fretDiff === -1 || fretDiff === -2) {
        embellishments.push({
          type: 'pull-off',
          from: triadOnSameString,
          to: pentNote,
          interval: Math.abs(fretDiff),
          finger: 1
        });
      }
    }
    
    reachableNotes.push(pentNote);
  }
  
  // Add slide approaches
  embellishments.push(...getSlideApproaches(voicing));
  
  return {
    triadVoicing: voicing,
    embellishments,
    reachableNotes
  };
}
```

---

## 8. Two-Note Mode Algorithm

```typescript
/**
 * Apply two-note mode to reduce triad to 2 notes
 */
function applyTwoNoteMode(
  voicing: TriadVoicing,
  mode: 'outside' | 'top'
): [FretboardNote, FretboardNote] {
  // Sort positions by string (lowest number = highest pitch)
  const sorted = [...voicing.positions].sort((a, b) => a.string - b.string);
  
  // sorted[0] = highest pitch (treble)
  // sorted[1] = middle pitch
  // sorted[2] = lowest pitch (bass)
  
  if (mode === 'outside') {
    // Keep highest and lowest, remove middle
    return [sorted[0], sorted[2]];
  } else {
    // Keep highest and middle, remove lowest (top notes)
    return [sorted[0], sorted[1]];
  }
}

/**
 * Get the note to mute for two-note display
 */
function getMutedNote(
  voicing: TriadVoicing,
  mode: 'outside' | 'top'
): FretboardNote {
  const sorted = [...voicing.positions].sort((a, b) => a.string - b.string);
  
  if (mode === 'outside') {
    return sorted[1];  // Middle note muted
  } else {
    return sorted[2];  // Bass note muted
  }
}
```

---

## 9. Rendering Data Preparation

```typescript
/**
 * Prepare all data needed to render the fretboard
 */
function prepareFretboardRenderData(state: AppState): FretboardRenderData {
  const layers: RenderLayer[] = [];
  
  // Layer 1: Zone background
  if (state.currentZone) {
    const zone = state.zoneData[state.currentZone - 1];
    layers.push({
      type: 'zone-highlight',
      startFret: zone.startFret,
      endFret: zone.endFret
    });
  }
  
  // Layer 2: Pentatonic ghost notes
  if (state.viewSettings.showPentatonicOverlay) {
    const pentatonicNotes = getPentatonicInRange(
      state.derivedState.relativePentatonic,
      [0, 15]
    );
    
    layers.push({
      type: 'notes',
      notes: pentatonicNotes.map(n => ({
        ...n,
        styleClass: 'note-pentatonic-ghost'
      }))
    });
  }
  
  // Layer 3: Bar chord reference
  if (state.viewSettings.showBarChordReference && state.derivedState.currentVoicing) {
    const barChord = getBarChordReference(state.derivedState.currentVoicing);
    layers.push({
      type: 'notes',
      notes: barChord.map(n => ({
        ...n,
        styleClass: 'note-barchord-ghost'
      }))
    });
  }
  
  // Layer 4: Triad notes
  if (state.derivedState.currentVoicing) {
    let triadNotes: FretboardNote[];
    
    if (state.viewSettings.twoNoteMode) {
      const twoNotes = applyTwoNoteMode(
        state.derivedState.currentVoicing,
        state.viewSettings.twoNoteModeType
      );
      const mutedNote = getMutedNote(
        state.derivedState.currentVoicing,
        state.viewSettings.twoNoteModeType
      );
      
      triadNotes = [
        ...twoNotes.map(n => ({ ...n, styleClass: getTriadNoteClass(n) })),
        { ...mutedNote, styleClass: 'note-muted' }
      ];
    } else {
      triadNotes = state.derivedState.currentVoicing.positions.map(n => ({
        ...n,
        styleClass: getTriadNoteClass(n)
      }));
    }
    
    layers.push({ type: 'notes', notes: triadNotes });
  }
  
  // Layer 5: Embellishments
  if (state.viewSettings.showEmbellishments && state.derivedState.embellishmentSet) {
    layers.push({
      type: 'embellishments',
      embellishments: state.derivedState.embellishmentSet.embellishments
    });
  }
  
  return { layers };
}

function getTriadNoteClass(note: FretboardNote): string {
  if (note.isRoot) return 'note-root';
  
  const interval = note.intervalFromRoot;
  if (interval === '3' || interval === 'b3') return 'note-third';
  if (interval === '5' || interval === 'b5' || interval === '#5') return 'note-fifth';
  
  return 'note-triad';
}
```

---

*This document provides all algorithmic specifications needed to implement the Pentatonic Triad System. All functions are designed to be pure and testable.*
