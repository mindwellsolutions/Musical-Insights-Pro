# Build Fix Blueprint - Comprehensive Error Resolution

**Generated:** 2026-02-23  
**Total Errors Found:** 60 TypeScript errors + 17 ESLint errors  
**Strategy:** Batch fix by category to resolve all issues efficiently

---

## 📊 Error Summary by Category

### Category 1: Missing Exports (CRITICAL - Blocks Build)
**Count:** 4 errors  
**Impact:** Build fails immediately  
**Files Affected:**
- `lib/musicTheory.ts` - Missing `getScale` export
- `lib/chord-voicings-database.ts` - Missing `CAGEDShapeName` export
- `lib/music-theory-database/loader.ts` - Missing `KeyDatabase` export
- `lib/mode-database-loader.ts` - Missing `@/types/fretboard` module

### Category 2: TypeScript Implicit 'any' Types
**Count:** 32 errors  
**Impact:** Type safety violations  
**Files Affected:**
- `app/page.tsx` - 4 errors (lines 496, 498, 504)
- `hooks/use-overlapping-chords.ts` - 28 errors (multiple setState callbacks)

### Category 3: Type Mismatches
**Count:** 10 errors  
**Impact:** Component prop/type incompatibilities  
**Files Affected:**
- `components/chord-neighborhood/ChordDiagramSidebar.tsx` - Property 'notes' on 'never'
- `components/chord-neighborhood/ChordVoicingSelector.tsx` - ThemeConfig undefined, category missing
- `components/chord-neighborhood/UnifiedRightSidebar.tsx` - Dispatch type mismatch
- `components/ChordProgressionNavigator.tsx` - MouseEventHandler mismatch
- `components/overlapping-chords/ChordList.tsx` - Missing 'onToggle' prop

### Category 4: Missing Function Arguments
**Count:** 10 errors  
**Impact:** Function signature mismatches  
**Files Affected:**
- `lib/mode-database-loader.ts` - Expected 2 arguments, got 1
- `lib/triad-pentatonic-mapping.ts` - Expected 2 arguments, got 1
- `scripts/test-mode-compatibility.ts` - Multiple instances

### Category 5: Missing Properties
**Count:** 4 errors  
**Impact:** Object structure mismatches  
**Files Affected:**
- `lib/mode-database-loader.ts` - Property 'intervals' missing on SourceScale
- `scripts/test-mode-compatibility.ts` - Property 'intervals' missing on ModeCompatibility

### Category 6: ESLint Warnings (Non-blocking)
**Count:** 17 errors  
**Impact:** Code quality, potential runtime issues  
**Types:**
- React Hooks exhaustive-deps warnings (12)
- Unescaped entities in JSX (4)
- Module variable assignment (2)
- Conditional Hook call (1)

---

## 🔧 Resolution Plan - Phase by Phase

### PHASE 1: Fix Critical Export Issues (Unblocks Build)
**Priority:** CRITICAL  
**Estimated Time:** 10 minutes  
**Dependencies:** None

#### Task 1.1: Export CAGEDShapeName from chord-voicings-database.ts
```typescript
// Add to lib/chord-voicings-database.ts exports
export type { CAGEDShapeName } from './caged/types';
```

#### Task 1.2: Export getScale from musicTheory.ts
```typescript
// Add to lib/musicTheory.ts
export function getScale(rootNote: string, scaleName: string): { notes: string[], intervals: number[] } {
  const intervals = EXTENDED_SCALE_INTERVALS[scaleName];
  if (!intervals) {
    throw new Error(`Unknown scale: ${scaleName}`);
  }
  
  const rootIndex = NOTES.indexOf(rootNote);
  const notes = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
  
  return { notes, intervals };
}
```

#### Task 1.3: Export KeyDatabase from music-theory-database/loader.ts
```typescript
// Add to lib/music-theory-database/loader.ts
export type { KeyDatabase } from './types';
```

#### Task 1.4: Fix fretboard types import
```typescript
// In lib/mode-database-loader.ts, change:
// FROM: import { FretNote } from '@/types/fretboard';
// TO: import { FretNote } from '@/lib/music-theory/core/fretboard';
```

---

### PHASE 2: Fix TypeScript Implicit 'any' Types
**Priority:** HIGH  
**Estimated Time:** 15 minutes  
**Dependencies:** Phase 1 complete

#### Task 2.1: Fix app/page.tsx setState callbacks
**Lines:** 496-504
**Fix:** Add explicit type annotations to callback parameters
```typescript
// Line 496 - Change from:
setSelectedOverlappingChords(prev => {
  const isSelected = prev.some(
    c => c.rootNote === chord.rootNote && c.quality === chord.quality
  );

  if (isSelected) {
    return prev.filter(
      c => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
    );
  }
  // ...
});

// TO:
setSelectedOverlappingChords((prev: OverlappingChord[]) => {
  const isSelected = prev.some(
    (c: OverlappingChord) => c.rootNote === chord.rootNote && c.quality === chord.quality
  );

  if (isSelected) {
    return prev.filter(
      (c: OverlappingChord) => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
    );
  }
  // ...
});
```

#### Task 2.2: Fix hooks/use-overlapping-chords.ts setState callbacks
**Lines:** 91, 100, 108, 112, 115, 121, 128, 135, 138, 144, 146, 152, 170
**Fix:** Add explicit type to all setState callback parameters
```typescript
// Pattern to apply throughout the file:
// Change: setState(prev => ...)
// TO: setState((prev: OverlappingChordsState) => ...)

// For array callbacks:
// Change: .some(c => ...)
// TO: .some((c: OverlappingChord) => ...)

// Change: .filter(p => ...)
// TO: .filter((p: OverlappingChord) => ...)

// Change: .filter(s => ...)
// TO: .filter((s: string) => ...)
```

---

### PHASE 3: Fix Type Mismatches
**Priority:** HIGH
**Estimated Time:** 20 minutes
**Dependencies:** Phase 1 complete

#### Task 3.1: Fix ChordDiagramSidebar.tsx - Property 'notes' on 'never'
**File:** `components/chord-neighborhood/ChordDiagramSidebar.tsx`
**Line:** 108
**Root Cause:** Type narrowing issue - variable typed as 'never'
**Fix:** Add proper type guard or type assertion
```typescript
// Need to see the actual code context, but likely:
// Add type assertion or fix the conditional logic that narrows to 'never'
```

#### Task 3.2: Fix ChordVoicingSelector.tsx - Missing 'category' property
**File:** `components/chord-neighborhood/ChordVoicingSelector.tsx`
**Line:** 117
**Root Cause:** Object type doesn't include 'category' field
**Fix:** Either add 'category' to the type definition or remove its usage
```typescript
// Option 1: Add to type definition
interface VoicingGroup {
  quality: string;
  displayName: string;
  category?: string; // Add optional category
  voicings: EnhancedChordVoicing[];
}

// Option 2: Remove category usage if not needed
```

#### Task 3.3: Fix ChordVoicingSelector.tsx - ThemeConfig undefined
**File:** `components/chord-neighborhood/ChordVoicingSelector.tsx`
**Lines:** 443, 556
**Root Cause:** ThemeConfig can be undefined
**Fix:** Add null check or default value
```typescript
// Change from:
const theme: ThemeConfig = getTheme();

// TO:
const theme: ThemeConfig = getTheme() || defaultTheme;

// OR add non-null assertion if guaranteed:
const theme: ThemeConfig = getTheme()!;
```

#### Task 3.4: Fix UnifiedRightSidebar.tsx - Dispatch type mismatch
**File:** `components/chord-neighborhood/UnifiedRightSidebar.tsx`
**Line:** 170
**Root Cause:** Passing Dispatch<SetStateAction<>> to (value: string) => void
**Fix:** Wrap in adapter function or change prop type
```typescript
// Option 1: Wrap in adapter
onChange={(value) => setActiveTab(value as "diagrams" | "explore")}

// Option 2: Change prop type to accept Dispatch
```

#### Task 3.5: Fix ChordProgressionNavigator.tsx - MouseEventHandler mismatch
**File:** `components/ChordProgressionNavigator.tsx`
**Line:** 369
**Root Cause:** Function expects boolean, receives MouseEvent
**Fix:** Wrap in event handler
```typescript
// Change from:
onClick={handleShowProgressionManager}

// TO:
onClick={() => handleShowProgressionManager(true)}
```

#### Task 3.6: Fix ChordList.tsx - Missing 'onToggle' prop
**File:** `components/overlapping-chords/ChordList.tsx`
**Line:** 58
**Root Cause:** ChordCard doesn't accept 'onToggle' prop
**Fix:** Change to 'onClick' which is the correct prop name
```typescript
// Change from:
<ChordCard
  key={...}
  theme={theme}
  chord={chord}
  isSelected={isSelected}
  onToggle={(chord) => onToggle(chord)}
/>

// TO:
<ChordCard
  key={...}
  theme={theme}
  chord={chord}
  isSelected={isSelected}
  onClick={() => onToggle(chord)}
  isHovered={false}
  onHover={() => {}}
  onHoverEnd={() => {}}
/>
```

---

### PHASE 4: Fix Missing Function Arguments
**Priority:** MEDIUM
**Estimated Time:** 15 minutes
**Dependencies:** Phase 1 complete

#### Task 4.1: Fix mode-database-loader.ts argument count
**File:** `lib/mode-database-loader.ts`
**Lines:** 79, 107
**Root Cause:** Function expects 2 arguments but only 1 provided
**Investigation Needed:** Check function signature to determine missing argument

#### Task 4.2: Fix triad-pentatonic-mapping.ts argument count
**File:** `lib/triad-pentatonic-mapping.ts`
**Lines:** 40, 77
**Root Cause:** Function expects 2 arguments but only 1 provided
**Investigation Needed:** Check function signature

#### Task 4.3: Fix test-mode-compatibility.ts argument count
**File:** `scripts/test-mode-compatibility.ts`
**Lines:** 32, 33, 36, 126, 134, 142, 151
**Root Cause:** Multiple function calls missing second argument
**Investigation Needed:** Check function signatures

---

### PHASE 5: Fix Missing Properties
**Priority:** MEDIUM
**Estimated Time:** 10 minutes
**Dependencies:** Phase 1 complete

#### Task 5.1: Add 'intervals' to SourceScale type
**File:** `lib/music-theory-database/types.ts`
**Line:** 35-40
**Fix:** Add intervals property to SourceScale interface
```typescript
export interface SourceScale {
  name: string;
  formula: string | null;
  intervals?: number[]; // Add this property
  family: string;
  quality: string;
}
```

#### Task 5.2: Add 'intervals' to ModeCompatibility type
**File:** Check where ModeCompatibility is defined
**Fix:** Add intervals property to the type definition

---

### PHASE 6: Fix ESLint Issues (Optional - Non-blocking)
**Priority:** LOW
**Estimated Time:** 30 minutes
**Dependencies:** None (can be done in parallel)

#### Task 6.1: Fix React Hooks exhaustive-deps warnings
**Count:** 12 warnings
**Strategy:** Add missing dependencies or use eslint-disable comments if intentional

#### Task 6.2: Fix unescaped entities in JSX
**Count:** 4 errors
**Files:** reviews/page.tsx, reviews/submit/page.tsx, chord-progression/AddScaleModeModal.tsx, etc.
**Fix:** Replace `'` with `&apos;` and `"` with `&quot;`

#### Task 6.3: Fix module variable assignments
**Count:** 2 errors
**Files:** audio-engine-client.ts, audio-engine.ts
**Fix:** Use different variable name instead of `module`

#### Task 6.4: Fix conditional Hook call
**File:** ChordProgressionNavigator.tsx
**Line:** 191
**Fix:** Move useEffect outside conditional or restructure logic

---

## 📋 Execution Checklist

### Pre-Execution
- [x] Capture all TypeScript errors: `npx tsc --noEmit`
- [x] Capture all build errors: `npm run build`
- [x] Capture all ESLint errors: `npx next lint`
- [x] Categorize errors by type and priority
- [x] Create resolution plan

### Execution Order
- [ ] **PHASE 1:** Fix Critical Export Issues (MUST DO FIRST)
- [ ] **PHASE 2:** Fix TypeScript Implicit 'any' Types
- [ ] **PHASE 3:** Fix Type Mismatches
- [ ] **PHASE 4:** Fix Missing Function Arguments
- [ ] **PHASE 5:** Fix Missing Properties
- [ ] **PHASE 6:** Fix ESLint Issues (Optional)

### Post-Execution Validation
- [ ] Run `npx tsc --noEmit` - Should show 0 errors
- [ ] Run `npm run build` - Should complete successfully
- [ ] Run `npx next lint` - Should show 0 errors (or only warnings)
- [ ] Test critical user flows in development mode
- [ ] Verify no functionality was broken

---

## 🎯 Success Criteria

1. ✅ Build completes without errors
2. ✅ TypeScript compilation passes with 0 errors
3. ✅ All critical functionality remains intact
4. ✅ No new errors introduced
5. ⚠️ ESLint warnings reduced (optional)

---

## 📝 Notes

- **DO NOT** run build after each individual fix - wait until phase completion
- **DO NOT** fix ESLint warnings until TypeScript errors are resolved
- **ALWAYS** verify imports are correct before fixing type issues
- **TEST** after each phase to ensure no functionality breaks
- Keep this document updated as issues are resolved

---

## 🔍 Investigation Required

The following items need code inspection before fixing:

1. **ChordDiagramSidebar.tsx line 108** - Need to see context of 'never' type
2. **Function signatures** - Need to identify what second arguments are expected for:
   - mode-database-loader.ts functions
   - triad-pentatonic-mapping.ts functions
   - test-mode-compatibility.ts functions
3. **ModeCompatibility type** - Need to locate type definition file

---

**Last Updated:** 2026-02-23
**Status:** Ready for execution
**Next Action:** Begin Phase 1 - Fix Critical Export Issues

