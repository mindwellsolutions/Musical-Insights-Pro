# Build Fix Blueprint - Part 2: Detailed Implementation

---

## 🔧 PHASE 1: Fix Missing Import (3 errors)

### File: `hooks/useSupabaseStorage.ts`

**Current State**: Function `normalizeNoteFromDisplay` is called but not imported

**Lines Affected**: 87, 163, 200

**Implementation**:

**Step 1.1**: Add import at top of file (after line 9)
```typescript
import { normalizeScaleNameFromDisplay } from '@/lib/music-theory-database/scale-mapping';
import { normalizeNoteFromDisplay } from '@/lib/musicTheory'; // ADD THIS LINE
```

**Verification**: 
- Check that `normalizeNoteFromDisplay` is exported from `lib/musicTheory.ts` ✅ (confirmed at line 44)
- Verify function signature: `(displayNote: string): string` ✅

**Expected Result**: 3 errors resolved

---

## 🔧 PHASE 2: Fix DynamicRecommendationContext (1 error)

### File: `components/DynamicRecommendationPanel.tsx`

**Current State**: Missing `scale` property when calling `analyzeProgression()`

**Line Affected**: 49

**Type Definition Required**:
```typescript
export interface DynamicRecommendationContext {
  songList: string[];
  currentPosition: number;
  key: string;
  scale: string; // ← REQUIRED but missing
}
```

**Problem**: Component doesn't have access to current scale name

**Implementation**:

**Step 2.1**: Add `currentScaleName` to component props (line 10-17)
```typescript
interface DynamicRecommendationPanelProps {
  theme: ThemeConfig;
  manualSelections: ManualSelection[];
  currentSelectionIndex: number;
  currentKey: string;
  currentScaleName: string; // ADD THIS LINE
  onChordSelect?: (notes: string[]) => void;
  onScaleSelect?: (scaleName: string) => void;
}
```

**Step 2.2**: Destructure new prop (line 19-26)
```typescript
const DynamicRecommendationPanel = memo(function DynamicRecommendationPanel({
  theme,
  manualSelections,
  currentSelectionIndex,
  currentKey,
  currentScaleName, // ADD THIS LINE
  onChordSelect,
  onScaleSelect,
}: DynamicRecommendationPanelProps) {
```

**Step 2.3**: Pass scale to analyzeProgression (line 49-53)
```typescript
const result = await analyzeProgression({
  songList,
  currentPosition: currentSelectionIndex,
  key: currentKey,
  scale: currentScaleName, // ADD THIS LINE
});
```

**Step 2.4**: Update parent component call (find where DynamicRecommendationPanel is used)
- Search for: `<DynamicRecommendationPanel`
- Add prop: `currentScaleName={scaleName}`

**Expected Result**: 1 error resolved

---

## 🔧 PHASE 3: Fix ScaleRecommendation Property (1 error)

### File: `components/DynamicRecommendationPanel.tsx`

**Current State**: Accessing non-existent `description` property

**Line Affected**: 181

**Type Definition**:
```typescript
export interface ScaleRecommendation {
  scaleName: string;
  compatibilityScore: number;
  usage: string; // ← Correct property name
}
```

**Implementation**:

**Step 3.1**: Change property access (line 181)
```typescript
// BEFORE:
<div className="text-xs" style={{ color: theme.textSecondary }}>
  {scale.description}
</div>

// AFTER:
<div className="text-xs" style={{ color: theme.textSecondary }}>
  {scale.usage}
</div>
```

**Expected Result**: 1 error resolved

---

## 🔧 PHASE 4A: Fix generateChordRecommendations.ts (4 errors)

### File: `scripts/generateChordRecommendations.ts`

**Lines Affected**: 80, 96, 120

**Implementation**:

**Step 4A.1**: Fix map callback parameters (line 80)
```typescript
// BEFORE:
return scale.intervals.slice(0, 7).map((_, i) => {

// AFTER:
return scale.intervals.slice(0, 7).map((_: number, i: number) => {
```

**Step 4A.2**: Add return type and type annotation (line 95-96)
```typescript
// BEFORE:
function generateExtendedChords(key: string, scale: any) {
  const chords = [];

// AFTER:
function generateExtendedChords(key: string, scale: any): any[] {
  const chords: any[] = [];
```

**Expected Result**: 4 errors resolved

---

## 🔧 PHASE 4B: Fix generateChordScaleCompatibility.ts (2 errors)

### File: `scripts/generateChordScaleCompatibility.ts`

**Line Affected**: 114

**Implementation**:

**Step 4B.1**: Add type annotations to sort callback (line 113-114)
```typescript
// BEFORE:
const compatibleScales = Array.from(compatibleScalesMap.values())
  .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

// AFTER:
const compatibleScales = Array.from(compatibleScalesMap.values())
  .sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore);
```

**Expected Result**: 2 errors resolved

---

## 🎯 VERIFICATION COMMANDS

After completing all phases:

```bash
# 1. Check TypeScript errors
npx tsc --noEmit --pretty false 2>&1 | tee .build-debugging/verification-typescript.txt

# 2. Run full build
npm run build 2>&1 | tee .build-debugging/verification-build.txt

# 3. Count remaining errors
# Should show 0 errors
```

---

## 📊 SUCCESS CRITERIA

- ✅ All 11 TypeScript errors resolved
- ✅ `npm run build` completes successfully
- ✅ No new errors introduced
- ✅ All existing functionality preserved
- ✅ Type safety maintained throughout

---

## 🚨 ROLLBACK PLAN

If issues occur:
1. All changes are in version control
2. Each phase is independent - can rollback individually
3. Error logs saved in `.build-debugging/` for analysis

---

## 📝 NOTES

- **Phase 2** requires finding parent component - likely `app/page.tsx`
- All fixes are type-level only - no runtime behavior changes
- Scripts in `/scripts` are build-time only - low risk

