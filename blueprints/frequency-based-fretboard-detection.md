# Frequency-Based Fretboard Position Detection Blueprint

## Overview
Enhance the live notes glow feature to detect the **exact string and fret position** being played based on frequency analysis, rather than lighting up all instances of a note across the fretboard.

## Problem Statement
Currently, when a note (e.g., D) is detected, all D notes across all strings and frets light up. This is not useful for learning or practice. We need to identify the specific string and fret being played based on the detected frequency and the guitar's tuning.

## Solution Architecture

### Core Concept
Each fret on each string produces a unique frequency. By analyzing the detected frequency and comparing it to a comprehensive frequency map of all fret positions, we can identify the exact string and fret being played.

### Key Components

#### 1. Fretboard Frequency Database (`/lib/audio/fretboardFrequencyMap.ts`)
A comprehensive database that maps every fret position to its exact frequency based on guitar tuning.

**Data Structure:**
```typescript
interface FretPosition {
  stringIndex: number;      // 0-5 for 6-string, 0-6 for 7-string
  fretNumber: number;        // 0-24
  note: string;              // Note name (e.g., 'E', 'A#', 'Db')
  frequency: number;         // Exact frequency in Hz
  midiNote: number;          // MIDI note number
}

interface FrequencyRange {
  minFrequency: number;      // Lower bound (frequency - tolerance)
  maxFrequency: number;      // Upper bound (frequency + tolerance)
  position: FretPosition;    // The fret position
}
```

**Features:**
- Generate frequency map for any tuning configuration
- Support for 6-string and 7-string guitars
- Support for all tuning types (Standard, Drop D, Half Step Down, etc.)
- Frequency tolerance buffer (±10-15 Hz) to account for tuning imperfections
- Octave-aware frequency calculation

#### 2. Frequency-to-Position Matcher (`/lib/audio/frequencyPositionMatcher.ts`)
Algorithm to match detected frequency to the most likely fret position.

**Matching Strategy:**
1. **Frequency Range Matching**: Find all positions within tolerance of detected frequency
2. **String Probability Weighting**: Prefer certain strings based on frequency range
   - Low frequencies (< 150 Hz) → Lower strings (E, A, D)
   - Mid frequencies (150-300 Hz) → Middle strings (D, G, B)
   - High frequencies (> 300 Hz) → Higher strings (B, E)
3. **Harmonic Analysis**: Detect and filter out harmonic overtones
4. **Confidence Scoring**: Return confidence level for the match

**Algorithm:**
```typescript
function findFretPosition(
  frequency: number,
  tuning: string[],
  tolerance: number = 15 // Hz
): FretPositionMatch | null {
  // 1. Get all positions within frequency tolerance
  const candidates = findCandidatePositions(frequency, tuning, tolerance);
  
  // 2. If no candidates, return null
  if (candidates.length === 0) return null;
  
  // 3. If single candidate, return with high confidence
  if (candidates.length === 1) {
    return { ...candidates[0], confidence: 0.95 };
  }
  
  // 4. Multiple candidates - apply weighting
  const scored = candidates.map(candidate => ({
    ...candidate,
    score: calculatePositionScore(candidate, frequency)
  }));
  
  // 5. Return highest scoring position
  const best = scored.reduce((a, b) => a.score > b.score ? a : b);
  return {
    ...best.position,
    confidence: best.score
  };
}
```

#### 3. Enhanced Live Note Detection (`/lib/audio/liveNoteDetection.ts`)
Update the existing live note detection to use frequency-based matching.

**Changes:**
- Accept frequency parameter in addition to note name
- Use frequency-to-position matcher instead of note-based matching
- Return single position instead of array of all matching notes
- Include confidence score in result

#### 4. Pitch Detector Integration
Update `PitchDetector` to pass frequency information through the detection pipeline.

**Current Flow:**
```
Audio Input → YIN Algorithm → Frequency → Note Name → All Positions
```

**New Flow:**
```
Audio Input → YIN Algorithm → Frequency → Note Name + Frequency → Exact Position
```

## Technical Specifications

### Frequency Calculation Formula
For any fret on any string:
```
frequency = tuningFrequency × 2^(fret/12)
```

Where:
- `tuningFrequency` = frequency of the open string
- `fret` = fret number (0-24)

### Frequency Tolerance
- **Default Tolerance**: ±15 Hz
- **Rationale**: Accounts for slight tuning imperfections and vibrato
- **Configurable**: Can be adjusted based on user preference

### String Frequency Ranges (Standard Tuning)

**6-String Guitar:**
- String 6 (Low E): 82.41 Hz - 164.81 Hz (E2 to E3)
- String 5 (A): 110.00 Hz - 220.00 Hz (A2 to A3)
- String 4 (D): 146.83 Hz - 293.66 Hz (D3 to D4)
- String 3 (G): 196.00 Hz - 392.00 Hz (G3 to G4)
- String 2 (B): 246.94 Hz - 493.88 Hz (B3 to B4)
- String 1 (High E): 329.63 Hz - 659.25 Hz (E4 to E5)

**7-String Guitar:**
- String 7 (Low B): 61.74 Hz - 123.47 Hz (B1 to B2)
- (Plus all 6-string ranges)

### Overlap Handling
When multiple strings can produce the same frequency:
1. Calculate frequency difference for each candidate
2. Apply string probability weighting
3. Consider playing context (previous notes)
4. Return position with highest confidence score

## Implementation Plan

### Phase 1: Frequency Database ✅
**File**: `/lib/audio/fretboardFrequencyMap.ts`

**Tasks:**
- [ ] Create FretPosition and FrequencyRange interfaces
- [ ] Implement frequency calculation for each fret
- [ ] Build frequency map generator for any tuning
- [ ] Add support for 6-string and 7-string guitars
- [ ] Create frequency lookup functions
- [ ] Add unit tests for frequency calculations

**Deliverables:**
- Complete frequency database for all tunings
- Fast lookup functions (O(log n) or better)
- Comprehensive test coverage

### Phase 2: Position Matcher ✅
**File**: `/lib/audio/frequencyPositionMatcher.ts`

**Tasks:**
- [ ] Implement candidate position finder
- [ ] Create string probability weighting algorithm
- [ ] Add harmonic filtering
- [ ] Implement confidence scoring
- [ ] Add position history tracking (for context)
- [ ] Create unit tests for matching algorithm

**Deliverables:**
- Accurate position matching (>90% accuracy)
- Confidence scores for all matches
- Harmonic rejection

### Phase 3: Live Note Detection Update ✅
**File**: `/lib/audio/liveNoteDetection.ts`

**Tasks:**
- [ ] Update LiveNotePosition interface to include frequency and confidence
- [ ] Modify calculateLiveNotePositions to accept frequency parameter
- [ ] Integrate frequency-to-position matcher
- [ ] Return single best position instead of all positions
- [ ] Add fallback to note-based matching if frequency matching fails
- [ ] Update unit tests

**Deliverables:**
- Updated live note detection with frequency support
- Single position output
- Backward compatibility

### Phase 4: Pitch Detector Integration ✅
**File**: `/lib/audio/pitchDetector.ts`

**Tasks:**
- [ ] Ensure frequency is passed through detection pipeline
- [ ] Update DetectedNote interface if needed
- [ ] Verify frequency accuracy from YIN algorithm
- [ ] Add frequency smoothing/averaging for stability
- [ ] Test with real guitar input

**Deliverables:**
- Frequency data available in detection pipeline
- Stable frequency readings
- Low latency (<50ms)

### Phase 5: UI Updates ✅
**Files**:
- `/components/Fretboard.tsx`
- `/components/audio/NoteDetectorSidebar.tsx`
- `/app/page.tsx`

**Tasks:**
- [ ] Update Fretboard to display single live note position
- [ ] Add confidence indicator (optional visual feedback)
- [ ] Update state management in page.tsx
- [ ] Add frequency tolerance setting (optional)
- [ ] Test with various tunings
- [ ] Add visual feedback for low confidence matches

**Deliverables:**
- Single fret dot lights up for detected note
- Smooth visual updates
- Works with all tunings

### Phase 6: Testing & Refinement ✅
**Tasks:**
- [ ] Test with real guitar across all strings
- [ ] Test with different tunings
- [ ] Test with 6-string and 7-string guitars
- [ ] Verify accuracy at different fret positions
- [ ] Test with slightly out-of-tune guitars
- [ ] Optimize tolerance settings
- [ ] Performance testing
- [ ] Edge case handling

**Deliverables:**
- >90% position accuracy
- Works reliably across all strings and frets
- Handles tuning variations gracefully

## Data Structures

### FretPosition Interface
```typescript
interface FretPosition {
  stringIndex: number;      // 0-based index (0 = lowest string)
  stringName: string;       // String name (e.g., 'E', 'A', 'D')
  fretNumber: number;       // 0-24
  note: string;             // Note name (e.g., 'E', 'A#', 'Db')
  frequency: number;        // Exact frequency in Hz
  midiNote: number;         // MIDI note number (0-127)
}
```

### FretPositionMatch Interface
```typescript
interface FretPositionMatch {
  stringIndex: number;
  fretNumber: number;
  note: string;
  frequency: number;
  confidence: number;       // 0.0 to 1.0
  isGhostNote: boolean;     // Not in current scale
}
```

### FrequencyMap Structure
```typescript
interface FrequencyMap {
  tuningName: string;
  stringCount: 6 | 7;
  positions: FretPosition[];
  frequencyIndex: Map<number, FretPosition[]>; // Frequency bucket → positions
}
```

## Algorithm Details

### Frequency Bucketing
To optimize lookup performance, frequencies are bucketed:
- Bucket size: 1 Hz
- Each bucket contains all positions within ±0.5 Hz
- Lookup: O(1) to find bucket, then linear search within bucket

### Confidence Scoring Algorithm
```typescript
function calculateConfidence(
  detectedFreq: number,
  position: FretPosition,
  candidates: FretPosition[]
): number {
  // Base confidence from frequency match
  const freqDiff = Math.abs(detectedFreq - position.frequency);
  const freqScore = Math.max(0, 1 - (freqDiff / 15)); // 15 Hz tolerance

  // String probability weight
  const stringWeight = getStringProbability(detectedFreq, position.stringIndex);

  // Uniqueness bonus (fewer candidates = higher confidence)
  const uniquenessBonus = 1 / Math.sqrt(candidates.length);

  // Combined score
  return (freqScore * 0.6) + (stringWeight * 0.3) + (uniquenessBonus * 0.1);
}
```

### String Probability Weighting
```typescript
function getStringProbability(frequency: number, stringIndex: number): number {
  // Define expected frequency ranges for each string
  const stringRanges = [
    { min: 80, max: 180, optimal: 130 },   // String 6 (Low E)
    { min: 100, max: 240, optimal: 170 },  // String 5 (A)
    { min: 140, max: 320, optimal: 230 },  // String 4 (D)
    { min: 190, max: 420, optimal: 305 },  // String 3 (G)
    { min: 240, max: 520, optimal: 370 },  // String 2 (B)
    { min: 320, max: 680, optimal: 500 },  // String 1 (High E)
  ];

  const range = stringRanges[stringIndex];
  if (!range) return 0.5; // Default for 7th string

  // Calculate probability based on distance from optimal frequency
  const distanceFromOptimal = Math.abs(frequency - range.optimal);
  const rangeSize = range.max - range.min;

  return Math.max(0, 1 - (distanceFromOptimal / rangeSize));
}
```

## Edge Cases & Handling

### 1. Harmonic Overtones
**Problem**: Guitar strings produce harmonics at 2x, 3x, 4x the fundamental frequency.
**Solution**:
- Detect if frequency is a multiple of a lower frequency
- Prefer fundamental over harmonics
- Use amplitude analysis if available

### 2. Multiple String Overlap
**Problem**: Same note can be played on multiple strings (e.g., 5th fret of E string = open A string).
**Solution**:
- Use string probability weighting
- Consider playing context (previous notes)
- Return highest confidence match

### 3. Out-of-Tune Guitar
**Problem**: Guitar may be slightly out of tune.
**Solution**:
- Configurable tolerance (default ±15 Hz)
- Adaptive tolerance based on detection history
- User-adjustable sensitivity setting

### 4. Fret Buzz / Noise
**Problem**: Poor technique or setup can cause frequency instability.
**Solution**:
- Frequency smoothing over multiple frames
- Minimum confidence threshold (e.g., 0.6)
- Ignore detections below threshold

### 5. Bends and Vibrato
**Problem**: Pitch bending changes frequency continuously.
**Solution**:
- Track frequency changes over time
- Lock to initial detected position
- Release lock after frequency stabilizes

## Performance Considerations

### Optimization Strategies
1. **Pre-computed Frequency Maps**: Generate once per tuning change
2. **Frequency Bucketing**: O(1) lookup instead of O(n) search
3. **Early Exit**: Return immediately if single candidate found
4. **Caching**: Cache recent frequency-to-position mappings
5. **Debouncing**: Limit update rate to 30-60 Hz (sufficient for visual feedback)

### Memory Usage
- Frequency map: ~2KB per tuning (6-string, 24 frets)
- Lookup index: ~4KB per tuning
- Total: <10KB for all tunings

### CPU Usage
- Frequency matching: <1ms per detection
- Visual update: <5ms per frame
- Total overhead: <10% CPU on modern devices

## Testing Strategy

### Unit Tests
1. Frequency calculation accuracy
2. Position matching with known frequencies
3. Confidence scoring algorithm
4. Edge case handling
5. Performance benchmarks

### Integration Tests
1. End-to-end detection with simulated audio
2. Tuning changes
3. String count changes
4. Multiple rapid note changes

### Manual Testing
1. Real guitar input across all strings
2. Different playing techniques (picking, strumming, fingerstyle)
3. Various tunings
4. Out-of-tune scenarios
5. Fast playing (alternate picking, tremolo)

## Success Metrics

### Accuracy
- **Target**: >90% correct position detection
- **Measurement**: Manual verification across 100+ note samples

### Latency
- **Target**: <100ms from note played to visual feedback
- **Measurement**: High-speed camera comparison

### Reliability
- **Target**: <5% false positives
- **Measurement**: Detection during silence and noise

### User Experience
- **Target**: Feels natural and responsive
- **Measurement**: User testing and feedback

## Future Enhancements

### Phase 7: Advanced Features (Optional)
1. **Multi-note Detection**: Detect chords (multiple simultaneous notes)
2. **Playing Technique Detection**: Identify bends, slides, hammer-ons
3. **Tuning Calibration**: Auto-detect and adjust for out-of-tune guitars
4. **Position History**: Show trail of recently played notes
5. **Practice Mode**: Highlight target notes and show accuracy
6. **Recording**: Record and playback detected positions

## References

### Musical Acoustics
- Equal temperament tuning: f = 440 × 2^((n-69)/12)
- Guitar string physics and harmonics
- Frequency ranges of musical instruments

### Algorithms
- YIN pitch detection algorithm
- Autocorrelation for fundamental frequency
- Harmonic product spectrum

### Web Audio API
- AnalyserNode for frequency analysis
- AudioContext sample rates
- Real-time audio processing


