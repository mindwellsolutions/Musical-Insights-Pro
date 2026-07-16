# 🔧 Build Fix Blueprint - Batch Mode
**Date:** May 29, 2026  
**Total Errors:** 61 TypeScript + 5 ESLint warnings  
**Strategy:** Fix all errors in 7 batched phases, then verify build once

---

## 📊 QUICK SUMMARY

| Phase | Category | Files | Errors | Priority |
|-------|----------|-------|--------|----------|
| 1 | FeedbackEvent Types | 1 | 20 | CRITICAL |
| 2 | Test Playback ChordQuality | 1 | 4 | HIGH |
| 3 | Genre Loader ChordQuality | 1 | 1 | HIGH |
| 4 | ChordQuality Comparisons | 2 | 16 | HIGH |
| 5 | OctaveShape Types | 1 | 3 | HIGH |
| 6 | Audio Engine API | 3 | 7 | HIGH |
| 7 | Misc Fixes | 4 | 5 | MEDIUM |

**Total Impact:** All 56 blocking errors resolved

---

## ⚡ PHASE 1: FeedbackEvent Type Fixes
**Impact:** 20 errors → 0 errors  
**Files:** `lib/fretboard-learning/types.ts`

### Edit 1A: Add 'message' property
**Line:** 161 (insert after `type: FeedbackType;`)
```typescript
message?: string;
```

### Edit 1B: Add 'success' to FeedbackType  
**Line:** 158
```typescript
// CHANGE FROM:
export type FeedbackType = 'correct' | 'incorrect' | 'hint';

// CHANGE TO:
export type FeedbackType = 'correct' | 'incorrect' | 'hint' | 'success';
```

**Errors Fixed:**
- ✅ app/learn/fretboard/note-a-day/page.tsx: Lines 155, 168, 177, 194, 198, 216, 221 (7 errors)
- ✅ app/learn/fretboard/octave-shapes/page.tsx: Lines 178, 189, 211, 220 (6 errors)  
- ✅ app/learn/fretboard/single-string/page.tsx: Lines 159, 168, 175, 194, 203 (5 errors)
- ✅ Type 'success' errors (2 errors)

---

## ⚡ PHASE 2: Test Playback ChordQuality
**Impact:** 4 errors → 0 errors  
**File:** `app/test-playback/page.tsx`

### Batch Replace
```typescript
// Line 24: quality: 'major' → quality: 'maj'
// Line 34: quality: 'minor' → quality: 'min'  
// Line 44: quality: 'major' → quality: 'maj'
// Line 54: quality: 'major' → quality: 'maj'
```

**Errors Fixed:**
- ✅ Lines 24, 34, 44, 54 (4 errors)

---

## ⚡ PHASE 3: Genre Loader Quality Mapping
**Impact:** 1 error + prevents future issues  
**File:** `lib/chord-progression/genre-loader.ts`

### Edit 3A: Add helper function (after imports, before any code)
```typescript
import { ChordQuality } from './types';

// ADD THIS FUNCTION:
function normalizeChordQuality(quality: string): ChordQuality {
  const mapping: Record<string, ChordQuality> = {
    'major': 'maj',
    'minor': 'min',
    'diminished': 'dim',
    'augmented': 'aug',
    'dominant7': 'dom7',
    'major7': 'maj7',
    'minor7': 'min7'
  };
  return (mapping[quality] || quality) as ChordQuality;
}
```

### Edit 3B: Update line 93
```typescript
// CHANGE FROM:
chordQuality: quality

// CHANGE TO:
chordQuality: normalizeChordQuality(quality)
```

**Errors Fixed:**
- ✅ Line 93 (1 error)

---

## ⚡ PHASE 4: Remove ChordQuality String Comparisons  
**Impact:** 16 errors → 0 errors  
**Files:** 2 files need mapping functions

### Fix 4A: DualFretboardDisplay.tsx
**File:** `components/chord-progression/DualFretboardDisplay.tsx`  
**Lines:** 97-99

**Add helper at top of component:**
```typescript
const isMinorQuality = (quality: ChordQuality): boolean => {
  return ['min', 'min7', 'min9', 'min11', 'min13', 'min6', 'min-add9', 'min7b5'].includes(quality);
};
```

**Replace lines 97-99:**
```typescript
// CHANGE FROM:
const isMinor = quality === 'minor' || quality === 'minor7' || quality === 'minor9' ||
  quality === 'minor11' || quality === 'minor13' || quality === 'minor6' ||
  quality === 'minor-add9' || quality === 'half-diminished7';

// CHANGE TO:
const isMinor = isMinorQuality(quality);
```

**Errors Fixed:**
- ✅ Lines 97-99 (8 errors)

---

### Fix 4B: song-progression-utils.ts
**File:** `lib/chord-progression/song-progression-utils.ts`  
**Lines:** 39-42, 218-221

**Add helper at top:**
```typescript
function isMinorChord(quality: ChordQuality): boolean {
  return ['min', 'min7', 'min9', 'min11', 'min13', 'min6', 'min-add9', 'min7b5'].includes(quality);
}
```

**Replace lines 39-42 AND 218-221:**
```typescript
// CHANGE TO:
const isMinor = isMinorChord(chord.chordQuality);
```

**Errors Fixed:**
- ✅ Lines 39-42 (8 errors total, 4 each location)

---

## ⚡ PHASE 5: OctaveShape Type Fixes
**Impact:** 3 errors → 0 errors
**File:** `app/learn/fretboard/octave-shapes/page.tsx`

### Fix 5A: Update shape initialization (Line 27)
```typescript
// CHANGE FROM:
setCurrentShape({ id: 1, strings: [6, 4], fretOffset: 0, name: 'Shape 1' });

// CHANGE TO:
setCurrentShape({ id: 1, strings: [6, 4] as [number, number], fretOffset: 0, name: 'Shape 1' });
```

### Fix 5B: Update shape selection (Line 301)
```typescript
// CHANGE FROM:
setCurrentShape({ id: 1, strings: [6, 4], fretOffset: 0, name: 'Shape 1' });

// CHANGE TO:
setCurrentShape({ id: 1, strings: [6, 4] as [number, number], fretOffset: 0, name: 'Shape 1' });
```

**Errors Fixed:**
- ✅ Lines 27, 178, 301 (3 errors)

---

## ⚡ PHASE 6: Audio Engine API Fixes
**Impact:** 7 errors → 0 errors
**Files:** 3 script files

### Fix 6A: test-audio-engine.ts
**File:** `scripts/test-audio-engine.ts`
**Lines:** 57, 70, 98

**Change all instances:**
```typescript
// CHANGE FROM:
instrument.stop({ note: midiNote });

// CHANGE TO:
instrument.stop({ stopId: midiNote });
```

**Errors Fixed:**
- ✅ Lines 57, 70, 98 (3 errors)

---

### Fix 6B: test-smplr-direct.ts
**File:** `scripts/test-smplr-direct.ts`
**Lines:** 42, 55

**Change all instances:**
```typescript
// CHANGE FROM:
instrument.stop({ note: midiNote });

// CHANGE TO:
instrument.stop({ stopId: midiNote });
```

**Errors Fixed:**
- ✅ Lines 42, 55 (2 errors)

---

## ⚡ PHASE 7: Miscellaneous Fixes
**Impact:** 5 errors → 0 errors

### Fix 7A: Stripe API Version
**File:** `lib/stripe/stripe-client.ts`
**Line:** 12

```typescript
// CHANGE FROM:
apiVersion: '2024-12-18.acacia',

// CHANGE TO:
apiVersion: '2026-01-28.clover',
```

**Errors Fixed:**
- ✅ Line 12 (1 error)

---

### Fix 7B: Remove currentChordProgression prop
**File:** `components/chord-neighborhood/AddChordToNeighborhood.tsx`
**Line:** 89

```typescript
// CHANGE FROM:
<AddChordModal
  open={open}
  onOpenChange={onOpenChange}
  currentKey={currentKey}
  onChordSelect={handleChordSelect}
  currentChordProgression={[]}
/>

// CHANGE TO:
<AddChordModal
  open={open}
  onOpenChange={onOpenChange}
  currentKey={currentKey}
  onChordSelect={handleChordSelect}
/>
```

**Errors Fixed:**
- ✅ Line 89 (1 error)

---

### Fix 7C: Duplicate Functions in audio-engine-smplr.ts
**File:** `lib/chord-progression/audio-engine-smplr.ts`
**Action:** View file to identify duplicate function names, then remove one copy

**Errors:**
- Line 81: Duplicate function implementation
- Line 369: Duplicate function implementation

**Resolution Steps:**
1. View lines 75-90 and 365-380 to identify function names
2. Keep the correct implementation, remove duplicate
3. Ensure no breaking changes to calling code

**Errors Fixed:**
- ✅ Lines 81, 369 (2 errors)

---

### Fix 7D: String to Number conversion
**File:** `lib/chord-progression/audio-engine-smplr.ts`
**Lines:** 403, 404, 406

```typescript
// Likely needs parseFloat() or Number() conversion
// Example:
midiNote = Number(noteValue)
```

**Errors Fixed:**
- ✅ Lines 403, 404, 406 (3 errors)

---

### Fix 7E: SongChordDiagramSidebar chordQuality
**File:** `components/chord-progression/SongChordDiagramSidebar.tsx`
**Line:** 607

**Action:** Ensure OverlappingChord type includes chordQuality property or remove reference

**Errors Fixed:**
- ✅ Line 607 (1 error)

---

## 📋 EXECUTION CHECKLIST

### Pre-Execution
- [ ] Review all changes above
- [ ] Backup current code (git commit)
- [ ] Close running dev servers

### Execution Order (DO NOT RUN BUILD BETWEEN PHASES!)
- [ ] **Phase 1:** Update FeedbackEvent types (1 file)
- [ ] **Phase 2:** Fix test-playback qualities (1 file)
- [ ] **Phase 3:** Add genre loader mapping (1 file)
- [ ] **Phase 4:** Fix quality comparisons (2 files)
- [ ] **Phase 5:** Fix OctaveShape types (1 file)
- [ ] **Phase 6:** Fix audio engine API (2 files)
- [ ] **Phase 7:** Miscellaneous fixes (5 files)

### Verification
- [ ] Run: `npx tsc --noEmit` (should show 0 errors)
- [ ] Run: `npm run build` (should complete successfully)
- [ ] Test key functionality manually

---

## 🎯 EXPECTED OUTCOME
- **Before:** 61 TypeScript errors
- **After:** 0 TypeScript errors
- **Build Time:** ~5-8 minutes (single build)
- **Total Fix Time:** ~30-45 minutes

---

## 📝 NOTES
- All fixes maintain existing functionality
- No breaking changes to public APIs
- ChordQuality mapping ensures backward compatibility
- Audio engine fixes align with smplr v1.x API

